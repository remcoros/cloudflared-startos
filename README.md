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
- [Limitations and Differences](#limitations-and-differences)

---

## Image and Container Runtime

- Base image: `cloudflare/cloudflared:<version>` copied into `debian:12-slim`
- Architectures: `x86_64`, `aarch64` (aarch64 emulated if missing)
- Entrypoint: `cloudflared tunnel --config /root/data/start9/tunnel.yaml run`
- Autoupdate disabled via `--no-autoupdate`

## Volume and Data Layout

All persistent data is stored in the `main` volume, mounted at `/root/data`:

| Path | Contents |
|---|---|
| `/root/data/start9/config.yaml` | Package store (token, tunnel info, zone info, ingress map) |
| `/root/data/start9/tunnel.yaml` | Generated cloudflared ingress config (written on every start) |
| `/root/data/start9/login-url.txt` | Temporary: Cloudflare auth URL during login flow |
| `/root/data/.cloudflared/cert.pem` | Cloudflare origin certificate (written by login) |

## Installation and First-Run Flow

1. **Login to Cloudflare** - Run the "Login to Cloudflare" action. A Cloudflare authorization URL is returned. Visit it in your browser and select the DNS zone you want to use.
2. **Select Tunnel** - Run the "Select Tunnel" action. Choose an existing tunnel or create a new one. The tunnel token is retrieved and stored automatically.
3. The service starts and begins proxying traffic through your tunnel.

No manual token management is required.

## Configuration Management

- The tunnel token is retrieved automatically via `cloudflared tunnel token` after tunnel selection - no manual token input needed.
- Ingress rules are stored in `start9/config.yaml` and written to `start9/tunnel.yaml` before each start.
- Dashboard-configured public hostnames are fetched from the Cloudflare API on each start and merged with locally-configured ones. Local rules take precedence if a hostname appears in both.
- Cloudflare credentials (`cert.pem`) are stored in the `main` volume at `.cloudflared/cert.pem`.

## Network Access and Interfaces

- **Metrics** - Prometheus metrics endpoint at `http://cloudflared.startos:20241/metrics` (internal only, not exposed publicly).
- All public traffic is routed inbound through the Cloudflare edge. No inbound ports need to be opened on your router.

## Actions

| Action | When available | Purpose |
|---|---|---|
| Login to Cloudflare | Always | Start the Cloudflare login flow; returns an authorization URL to visit in your browser |
| Select Tunnel | When logged in | Choose an existing tunnel or create a new one |

## URL Plugin

Cloudflare Tunnel registers as a `url-v0` URL plugin. This means any other installed service can add a public Cloudflare hostname directly from its URL list.

**Adding a hostname:**
- Open any service → URLs → Add URL → select Cloudflare Tunnel
- Enter a hostname (e.g. `myapp.example.com`) - pre-filled with `packageid.yourdomain.com` if a zone is configured
- If logged in, a DNS CNAME record is created automatically pointing to your tunnel
- If not logged in, create the CNAME manually: `hostname → <tunnelID>.cfargotunnel.com` (proxied)

**Removing a hostname:**
- Open the service → URLs → remove the Cloudflare URL
- The ingress rule and DNS CNAME record are removed automatically

**Dashboard hostnames:**
- Public hostnames configured in the Cloudflare Zero Trust dashboard are automatically merged into the tunnel config on each start. They do not appear in the StartOS URL list but work normally.

## Backups and Restore

The entire `main` volume is backed up, including `cert.pem`, the tunnel token, zone info, and all ingress entries. After restore, the service starts immediately with all previous configuration intact.

## Health Checks

- **Cloudflare tunnel** - polls `http://cloudflared.startos:20241/metrics` every 30 seconds
- Service is considered healthy when the metrics endpoint responds successfully

## Dependencies

None.

## Limitations and Differences

1. **Single DNS zone** - logging in authorizes one Cloudflare DNS zone. Hostnames on other zones can still be added but DNS records must be created manually for those zones.
2. **No tunnel management UI** - tunnels are managed via the StartOS actions interface, not a web UI. For advanced tunnel configuration, use the Cloudflare Zero Trust dashboard.
3. **Local config takes precedence over dashboard** - if a hostname is configured both locally and in the dashboard, the local entry wins. Dashboard-only entries are merged in automatically.
4. **Autoupdate disabled** - `--no-autoupdate` is set; updates are delivered via new package versions.
5. **Metrics endpoint is internal only** - the Prometheus metrics endpoint is not proxied through the tunnel.
