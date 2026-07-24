<p align="center">
  <img src="icon.png" alt="Cloudflare Tunnel Logo" width="21%">
</p>

# Cloudflare Tunnel on StartOS

> **Upstream docs:** <https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/>
>
> Everything not listed in this document should behave the same as upstream cloudflared. If a feature, setting, or behavior is not mentioned here, the upstream documentation is accurate and fully applicable.

Cloudflare Tunnel (cloudflared) creates an outbound-only connection from your StartOS server to the Cloudflare edge network, allowing you to expose services publicly via your own domain without opening any inbound ports or configuring a router.

Upstream repo: <https://github.com/cloudflare/cloudflared>

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Configuration Management](#configuration-management)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Actions](#actions)
- [URL Plugin](#url-plugin)
- [Backups and Restore](#backups-and-restore)
- [Health Checks](#health-checks)
- [Dependencies](#dependencies)
- [What Is Unchanged from Upstream](#what-is-unchanged-from-upstream)
- [Limitations and Differences](#limitations-and-differences)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

- Upstream image: `cloudflare/cloudflared`, copied into `debian:12-slim`
- Architectures: `x86_64`, `aarch64` (aarch64 emulated if missing)
- Entrypoint: `cloudflared tunnel --credentials-file /root/.cloudflared/<tunnel-id>.json run <tunnel-id>`
- Autoupdate disabled via `--no-autoupdate`

## Volume and Data Layout

All persistent data is stored in the `main` volume:

| Path                                         | Contents                                                                    |
| -------------------------------------------- | --------------------------------------------------------------------------- |
| `/root/data/start9/config.yaml`              | Package store with selected tunnel, logged-in DNS zones, and managed routes |
| `/root/data/start9/login-url.txt`            | Temporary Cloudflare authorization URL during login flow                    |
| `/root/data/.cloudflared/zone-<zone-id>.pem` | Zone-specific Cloudflare origin certificate                                 |
| `/root/data/.cloudflared/<tunnel-id>.json`   | Tunnel credentials file used to run cloudflared                             |

## Installation and First-Run Flow

1. **Login to Cloudflare** by running the **Login to Cloudflare** action.
2. Open the returned authorization URL and approve access for one DNS zone.
3. Repeat the login action if you want this package to manage additional DNS zones.
4. Run **Select Tunnel** to choose an existing tunnel or create a new one.
5. The package stores the tunnel credentials automatically and starts cloudflared.

No manual token or credentials-file management is required.

## Configuration Management

- The package stores the selected tunnel, logged-in DNS zones, and managed routes in `start9/config.yaml`.
- Tunnel ingress is managed through the Cloudflare API.
- After selecting a tunnel, the package retrieves the credentials file automatically with `cloudflared tunnel token --cred-file ...`.
- DNS record management uses the zone-specific origin certificate for the selected zone.
- Existing dashboard-managed routes and advanced tunnel settings are preserved when StartOS changes one of its managed hostnames.
- Use **Import Public Hostnames** when you also want a compatible existing route to appear in StartOS and follow its service binding.

## Network Access and Interfaces

- **Metrics** - Prometheus metrics endpoint on internal loopback port 20241
- All public traffic is proxied through the Cloudflare edge. No inbound ports need to be opened on your router.

## Actions

| Action                             | When available                       | Purpose                                                                          |
| ---------------------------------- | ------------------------------------ | -------------------------------------------------------------------------------- |
| Login to Cloudflare / Add DNS Zone | Always                               | Start the Cloudflare login flow and authorize one DNS zone at a time             |
| Select Tunnel                      | When at least one zone is configured | Choose an existing tunnel or create a new one                                    |
| Remove DNS Zone                    | When zones exist                     | Remove a DNS zone from this package without deleting existing Cloudflare records |
| Import Public Hostnames            | Always                               | Import existing Cloudflare tunnel hostnames into the StartOS-managed route list  |
| Managed Public Routes              | Always                               | Show the selected tunnel, managed DNS zones, and application routes              |

## URL Plugin

Cloudflare Tunnel registers as a `url-v0` URL plugin. Any other installed service can add a public Cloudflare hostname directly from its StartOS URL list.

**Adding a hostname:**

- Open any service → URLs → Add URL → select Cloudflare Tunnel
- Enter a subdomain and choose one of the logged-in DNS zones
- The package updates the Cloudflare tunnel ingress configuration automatically
- StartOS targets are stored by package, host, interface, and internal port; their live bridge address is re-resolved after installs or assigned-port changes
- It also tries to create the DNS CNAME automatically
- If the DNS step fails, the route is still added and the action returns the manual fallback: `hostname → <tunnelID>.cfargotunnel.com` (proxied)

**Removing a hostname:**

- Open the service → URLs → remove the Cloudflare URL
- The package removes the ingress rule from the tunnel configuration
- It also tries to delete the matching DNS record and returns a warning if manual cleanup is still needed

**Importing existing dashboard routes:**

- If routes already exist on the tunnel in Cloudflare, run **Import Public Hostnames**
- Matching routes are added to the package store so StartOS can manage and display them
- Routes that remain dashboard-managed are retained unchanged by StartOS route additions and removals

## Backups and Restore

The entire `main` volume is backed up, including zone certificates, tunnel credentials, selected tunnel info, DNS zone info, and managed ingress entries. After restore, the service can resume using the same tunnel and managed routes.

## Health Checks

- **Cloudflare tunnel** - polls the local metrics endpoint on port 20241
- The service is considered healthy when the metrics endpoint responds successfully

## Dependencies

None.

## What Is Unchanged from Upstream

- Cloudflare Tunnel still uses your existing Cloudflare account, Zero Trust tunnel model, and DNS zones.
- Advanced tunnel settings that are not described here should still be managed exactly as documented in the upstream Cloudflare documentation.

## Limitations and Differences

1. **One selected tunnel per package instance** - this package runs one cloudflared tunnel at a time.
2. **No tunnel management UI** - tunnels are selected or created through StartOS actions, not a web UI. For advanced tunnel settings, use the Cloudflare Zero Trust dashboard.
3. **Dashboard routes are preserved** - StartOS reads and merges the complete live tunnel configuration before each update. Import a compatible route only if you want StartOS to manage and display it.
4. **DNS automation can still need manual fallback** - if a DNS record already exists or Cloudflare rejects the change, the package returns the manual CNAME fallback instead of silently failing.
5. **Autoupdate disabled** - `--no-autoupdate` is set; updates are delivered via new package versions.
6. **Metrics endpoint is internal only** - the Prometheus metrics endpoint is not proxied through the tunnel.
7. **Upgrade repair** - beta.9-era `STARTOS`/nullable admin identities and `.startos` targets are migrated to `start-os` / `admin` / `admin-ui`. Resolvable legacy dashboard routes are adopted without removing unrelated routes. If a target is ambiguous or the Cloudflare API is unavailable, no remote configuration is written and the package creates a **Repair Cloudflare Routes** task.

---

## Quick Reference for AI Consumers

```yaml
package_id: cloudflared
image: cloudflare/cloudflared
architectures: [x86_64, aarch64]
volumes:
  main:
    - /root/data/start9/config.yaml
    - /root/data/start9/login-url.txt
    - /root/data/.cloudflared/zone-<zone-id>.pem
    - /root/data/.cloudflared/<tunnel-id>.json
ports:
  metrics: 20241
dependencies: none
startos_managed_env_vars: []
actions:
  - cloudflare-login
  - select-tunnel
  - remove-zone
  - import-public-hostnames
  - managed-overview
```
