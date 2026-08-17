<p align="center">
  <img src="icon.png" alt="Cloudflare Tunnel Logo" width="21%">
</p>

# Cloudflare Tunnel on StartOS

> Everything not listed in this document should behave the same as upstream
> cloudflared. If a feature, setting, or behavior is not mentioned here, the
> upstream documentation is accurate and fully applicable — see the
> Documentation section of `instructions.md` for links.

[cloudflared](https://github.com/cloudflare/cloudflared) is Cloudflare's tunnel client. It opens an outbound-only connection from the server to the Cloudflare edge, so services behind it can be reached on a public hostname without an inbound port, a static IP, or a router change. This package runs one tunnel and manages that tunnel's routes on the user's behalf: it registers as StartOS's `url-v0` URL plugin, so any other installed service can be given a public Cloudflare hostname from its own address list, and it keeps each of those routes pointed at the service it belongs to as the server's internal addressing changes.

- **Upstream repo:** <https://github.com/cloudflare/cloudflared>
- **Wrapper repo:** <https://github.com/Start9-Community/cloudflared-startos>

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [File Models](#file-models)
- [Dependencies](#dependencies)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Actions](#actions)
- [Tasks](#tasks)
- [Health Checks](#health-checks)
- [Backups and Restore](#backups-and-restore)
- [Limitations and Differences](#limitations-and-differences)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

One image, built here rather than pulled: the upstream image is distroless, and this package needs a shell for its login helper and for every one-shot `cloudflared` invocation. The Dockerfile copies the upstream `cloudflared` binary and `ca-certificates` onto a Debian slim base.

| Property      | Value                                                    |
| ------------- | -------------------------------------------------------- |
| Image         | Built from `cloudflare/cloudflared` on `debian:*-slim`   |
| Architectures | x86_64, aarch64 (aarch64 emulated when no native runner) |
| Command       | `cloudflared … tunnel --credentials-file … run <tunnel>` |

| Subcontainer | Purpose                                                                  |
| ------------ | ------------------------------------------------------------------------ |
| `main`       | The `primary` daemon running the tunnel — the one to `attach` to         |
| `cf-login`   | Short-lived; runs `cf-login.sh`, which drives `cloudflared tunnel login` |
| `cf-cmd`     | Short-lived; runs `cloudflared tunnel list` / `create` / `token`         |
| `route-dns`  | Short-lived; runs `cloudflared tunnel route dns` to create a CNAME       |

Autoupdate is disabled (`--no-autoupdate`) and the management-diagnostics channel is off; the binary is replaced by installing a new package version.

## Volume and Data Layout

One volume, holding the package's own state and the credentials `cloudflared` needs to run. There is no database.

| Volume | Mount Point                    | Purpose                                                    |
| ------ | ------------------------------ | ---------------------------------------------------------- |
| `main` | `/root/data`                   | Everything below                                           |
| `main` | `/root/.cloudflared` (subpath) | The same volume's `.cloudflared/`, where cloudflared looks |

| Path                                         | Contents                                                       |
| -------------------------------------------- | -------------------------------------------------------------- |
| `/root/data/start9/config.yaml`              | The package store — selected tunnel, DNS zones, managed routes |
| `/root/data/start9/login-url.txt`            | The authorization URL from the login flow in progress          |
| `/root/data/start9/login-session-id.txt`     | Which login flow is the current one                            |
| `/root/data/start9/login-sessions/<id>/`     | Per-login scratch directory, deleted when that login ends      |
| `/root/data/.cloudflared/cert.pem`           | Transient: a fresh origin certificate, consumed on next init   |
| `/root/data/.cloudflared/zone-<zone-id>.pem` | The retained origin certificate for one authorized DNS zone    |
| `/root/data/.cloudflared/<tunnel-id>.json`   | The credentials file the running tunnel authenticates with     |

The `.cloudflared` subpath is mounted read-only into the tunnel daemon and read-write into the short-lived subcontainers that write credentials.

**The Cloudflare API token for each zone lives in the store and in that zone's `.pem`.** Both are inside the backed-up volume; neither is ever returned by an action.

## File Models

Two, both owned entirely by the package. Neither is upstream configuration — this package does not write a `cloudflared` config file at all, and passes everything the daemon needs on its command line.

| Model     | File                    | Format | Ownership                                                               |
| --------- | ----------------------- | ------ | ----------------------------------------------------------------------- |
| `store`   | `start9/config.yaml`    | YAML   | Written by the package only; a hand edit is preserved but not respected |
| `certPem` | `.cloudflared/cert.pem` | text   | Written by `cloudflared tunnel login`; read once, then deleted          |

The store is seeded empty at install and then written by the actions: **Login to Cloudflare** adds a zone, **Cloudflare Tunnel** sets the selected tunnel, and the route actions add and remove entries under `ingress`. Nothing re-asserts a value the user set, because there is no user-editable setting in it — every key is a record of something the package did. A hand edit survives (the file is merged, never regenerated), but editing `ingress` by hand does not change Cloudflare; the next reconcile treats the edited entry as the desired state and pushes it, or refuses if the live route no longer matches what was recorded.

`certPem` exists only so init can react to a completed login. When it appears, the package decodes the zone id, account id, and API token out of it, fetches the zone name, copies it to `zone-<zone-id>.pem`, and deletes the original — so a second login for a second zone cannot overwrite the first zone's credential.

Because that pickup happens in init rather than in the action, an authorization the user completed in the browser can still fail to produce a zone, and it fails quietly: the certificate either does not decode, or its API token has since been revoked and the zone-name lookup fails. Neither shows up on the action, which has already returned; the service log carries the reason.

## Dependencies

None.

## Network Access and Interfaces

One interface, and it is not how traffic reaches the tunnel. All routed traffic arrives at the Cloudflare edge and is carried inbound over the tunnel's own outbound connection; nothing needs to be exposed for that to work.

| Interface | Id        | Type | Port  | Description                                      |
| --------- | --------- | ---- | ----- | ------------------------------------------------ |
| Metrics   | `metrics` | api  | 20241 | cloudflared's Prometheus endpoint, at `/metrics` |

The daemon binds the metrics server on all interfaces inside its container so the health check and the exported address both reach it.

Routes this package manages point at other services by their **bridge address**. The store records the package id, host id, and internal port rather than a resolved origin URL, and the address is resolved from that triple **each time this service starts** — so a route that has gone stale is corrected by restarting Cloudflare Tunnel or by running **Repair Cloudflare Routes**. Resolution is not live: a target's assigned port changing while this service is running does not update the tunnel on its own.

## Installation and First-Run Flow

Two steps, both surfaced as critical tasks, and the daemon will not start until both are done — it exits immediately when no tunnel is selected.

1. **Log in to Cloudflare.** The action starts an interactive `cloudflared tunnel login` in a subcontainer and returns the authorization URL it prints. Opening that URL and approving one zone writes an origin certificate into the volume, which init picks up and turns into a stored zone. Repeat the action once per additional zone. If the action returns no URL at all, `cloudflared` could not reach Cloudflare — almost always no outbound DNS or HTTPS — or a newer run superseded it; the `cf-login` output in the service log distinguishes the two.
2. **Choose a tunnel.** The action lists the tunnels on the account and offers a "create new" option pre-filled with the server's mDNS name. Selecting one fetches its credentials file, records it in the store, and clears the task; the daemon then starts.

Ordering matters: the tunnel action is disabled until at least one zone exists, because listing and creating tunnels needs a zone's origin certificate.

After that, hostnames are added from **other services' address lists**, not from this package — see [Actions](#actions).

## Actions

Eight actions. Two are the plugin handshake and are not user-facing; the rest are run from this package's own page.

**Login to Cloudflare** (also titled _Add DNS Zone_ once a zone exists) — run it for the first zone, and again for each additional domain. It authorizes exactly one zone per run. Takes as long as the user takes to approve in the browser; the action returns within 30 seconds with a URL and the login continues in the background for up to ten minutes. Safe to repeat: a second run supersedes the first, which shuts itself down rather than writing a stale certificate. Changes: adds one entry to the store's zone list and writes that zone's `.pem`.

**Cloudflare Tunnel** — run it to pick which tunnel this server runs, or to move to a different one. Creating a new tunnel also creates it on the Cloudflare account. Seconds. Safe to repeat; re-selecting the same tunnel just refetches its credentials. Changes: the store's selected tunnel and the credentials file on disk. The daemon restarts onto the new tunnel.

**Remove DNS Zone** — run it to stop managing a domain. It deletes nothing in Cloudflare: existing DNS records and tunnel routes keep working, they simply stop being tracked here. Instant. Safe to repeat. Changes: drops the zone, its `.pem`, and every route recorded against it from the store.

**Import Public Hostnames** — run it when routes already exist on the tunnel (created in the Cloudflare dashboard, or by an older version of this package) and they should appear on their services in StartOS. It reads the live tunnel configuration, adopts every whole-hostname rule that belongs to a configured zone and resolves to an installed service, and rewrites those rules to the current bridge address in one update. Seconds; does not interrupt the tunnel. **Safe to re-run** — already-tracked hostnames are skipped, and a run that adopts nothing changes nothing. It reports what it skipped and why. A rule it cannot resolve unambiguously is left exactly as it is.

**Managed Public Routes** — read-only. Run it to see the selected tunnel, each configured zone, and every route this package manages with its public URL and internal target. Instant, no state change. Account and tunnel identifiers are shown; credentials are not.

**Repair Cloudflare Routes** — run it when the repair task appears, after fixing whatever blocked the last reconcile (Cloudflare unreachable, a route edited in the dashboard, a zone removed). It re-resolves every managed route and pushes the result in one update. Seconds. Safe to repeat; on failure it leaves Cloudflare untouched and re-raises the task.

**Add Public Hostname** and **Delete Public Hostname** are `visibility: 'hidden'` — **not user-facing.** They are the URL-plugin handshake: StartOS presents them as _Add_ and _Delete_ in the Cloudflare Tunnel section of _another_ service's address list, and fills in a hidden input identifying that service's interface. Never direct a user to run them from this package's page; they cannot be run there.

Every route mutation reads the complete live tunnel configuration first, changes only the hostnames this package owns, and writes the whole object back — so rules created in the Cloudflare dashboard, path-scoped rules, and per-route origin settings are preserved. If the live rule for a hostname no longer matches what the store recorded, the update is refused rather than resolved by guessing.

## Tasks

Three, and the first two block startup.

| Task                     | Severity  | Raised when                                    | Cleared by                                        |
| ------------------------ | --------- | ---------------------------------------------- | ------------------------------------------------- |
| Login to Cloudflare      | critical  | No DNS zone is configured                      | Running the action                                |
| Cloudflare Tunnel        | critical  | A zone exists but no tunnel is selected        | Running the action                                |
| Repair Cloudflare Routes | important | A reconcile could not safely update Cloudflare | A reconcile succeeding, or the tunnel being unset |

The two critical tasks are the ordinary first-run path, not a fault; they are raised on a fresh install and again after a restore into an empty store. While either is active the service cannot be started and the usual controls are replaced by the task.

The repair task re-arms itself: running the action clears it, and a failed repair immediately raises it again with the reason attached. It also survives a restart, because the condition that raises it is stored rather than recomputed at startup. A repair task that keeps returning has one of two causes almost every time — the route was edited in the Cloudflare dashboard, so the package refuses to overwrite it and it must be reconciled by hand or re-imported; or the target service is no longer installed, so its bridge address cannot be resolved and the route has to be removed from the service that owns it.

## Health Checks

One check, on the only daemon.

| Check     | Displayed           | Method                                 |
| --------- | ------------------- | -------------------------------------- |
| `primary` | "Cloudflare tunnel" | HTTP GET of the local metrics endpoint |

The metrics server comes up before the tunnel finishes connecting, so a pass means the process is alive and serving — not that the tunnel is registered at the edge. A failure therefore means the process is gone or never started: the usual causes are a missing or rejected credentials file (the tunnel was deleted in Cloudflare after being selected here) and no outbound network. The service log carries cloudflared's own reason.

Whether traffic is actually arriving is not covered by this check. Confirm that against the public hostname itself, or against the connection count on the metrics endpoint — and read the failure the hostname gives you, because the two modes have different causes. A Cloudflare error page means the route exists and the origin is not answering: check that the target service is running, and check **Managed Public Routes** for the internal target cloudflared is dialing. A hostname that does not resolve at all means the DNS record is missing, which is created separately from the route; the add action reports when it could not create one, and the CNAME it returns has to be added, proxied, in the Cloudflare dashboard.

## Backups and Restore

The `main` volume is copied wholesale — `sdk.Backups.ofVolumes('main')`. Nothing is dumped and nothing is excluded, so a restored instance comes back with the same selected tunnel, the same zone credentials, and the same route list, and reconnects without a fresh login.

Two things a restored instance still has to reckon with. The tunnel and its DNS records live in the Cloudflare account, not in the backup — if either was deleted there in the meantime, the daemon will not start and the tunnel must be re-selected. And a route's target is re-resolved on the restored server, so a route whose service is not installed there cannot be resolved; the reconcile refuses to write, and the repair task appears.

Restoring onto a **second** server while the first is still running points the same tunnel at two origins. Remove the routes from one of them.

## Limitations and Differences

1. **One tunnel per install.** The package runs a single tunnel; a second tunnel needs a second install or the Cloudflare dashboard.
2. **No tunnel management UI.** Tunnels are created and selected through actions. Advanced per-route settings (access policies, origin TLS options, path-scoped rules) are managed in the Cloudflare Zero Trust dashboard; this package preserves them but does not expose them.
3. **One zone per login.** `cloudflared tunnel login` authorizes a single zone, so a second domain means a second run of the action.
4. **Routes are proxied HTTP origins.** A managed route is written as a plaintext origin at the target's bridge address. A service that only accepts TLS on that port cannot be routed this way from here.
5. **Whole-hostname rules only.** A rule with a path is never adopted, rewritten, or removed by this package. Two whole-hostname rules for the same hostname stop the update entirely rather than resolving the ambiguity.
6. **DNS creation can fall back to manual.** The CNAME is created through `cloudflared` using the zone's certificate. If that fails — a conflicting record, a revoked certificate — the tunnel route is still added and the action returns the record to create by hand.
7. **The metrics endpoint is local.** It is not routed through the tunnel and is not published on the internet by this package.
8. **Changing the selected tunnel does not move existing routes.** The store's routes are pushed onto the newly selected tunnel at the next reconcile, but their DNS records still point at the old tunnel until they are recreated.
9. **Route targets are re-resolved at startup, not continuously.** Managed routes are reconciled when this service starts and when **Repair Cloudflare Routes** runs. If a routed service's assigned port changes while Cloudflare Tunnel is running, its route keeps pointing at the old port until one of those happens.

---

## Quick Reference for AI Consumers

```yaml
package_id: cloudflared
image: cloudflare/cloudflared # binary copied onto a Debian slim base
architectures:
  - x86_64
  - aarch64
subcontainers:
  - main # the primary daemon
  - cf-login # transient: interactive login
  - cf-cmd # transient: tunnel list / create / token
  - route-dns # transient: DNS CNAME creation
volumes:
  main: /root/data # also mounted at /root/.cloudflared via subpath
file_models:
  - start9/config.yaml
  - .cloudflared/cert.pem
startos_managed_env_vars: []
dependencies: []
interfaces:
  metrics: { type: api, port: 20241 }
actions:
  - cloudflare-login
  - select-tunnel
  - remove-zone
  - import-public-hostnames
  - managed-overview
  - repair-routes
  - add-public-hostname # hidden: url-v0 plugin
  - delete-public-hostname # hidden: url-v0 plugin
tasks:
  - { action: cloudflare-login, severity: critical }
  - { action: select-tunnel, severity: critical }
  - { action: repair-routes, severity: important }
health_checks:
  - primary # displayed "Cloudflare tunnel"
```
