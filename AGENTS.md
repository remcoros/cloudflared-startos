# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

Work this package's `TODO.md` from top to bottom. Keep `README.md` (technical reference for an AI support or administering agent) and `instructions.md` (end-user docs) in sync with your changes.

## This repo

- **The upstream image is distroless and the Dockerfile deliberately does not use it as a base.** `cloudflare/cloudflared` ships on `gcr.io/distroless/base-debian13` with no shell and a non-root default user; `scripts/cf-login.sh` and every `SubContainer.exec` need `/bin/sh`. The Dockerfile copies the `cloudflared` binary onto `debian:13-slim` instead. Don't "simplify" it to `FROM cloudflare/cloudflared`.
- **`add-public-hostname` and `delete-public-hostname` are `visibility: 'hidden'` and must stay that way.** They are the `url-v0` plugin handshake: StartOS invokes them from another service's address table, never the user. They take a `urlPluginMetadata` hidden input the platform fills in, so they cannot be run by hand.
- **Cloudflare's tunnel-configuration `PUT` replaces the entire configuration.** Every mutation goes through `updateCloudflareIngress` in `startos/init/reconcileIngress.ts`, which re-reads the live config, rewrites only the hostnames this package owns, and refuses to write when a route it would touch has drifted from what the store recorded. Never build an ingress array from the store alone and `PUT` it — that silently deletes the user's dashboard-managed routes.
- **Routes are stored as `(packageId, hostId, internalPort)`, not as a frozen origin URL**, and re-resolved to a bridge address on every init — i.e. at each service start, and on demand via `repair-routes`. That is what lets a route recover after its target's assigned port changes; don't collapse it back to a stored URL. Resolution is deliberately **not** live — see `TODO.md`.
- **Zone credentials are secrets.** The Cloudflare API token is decoded out of `cert.pem` into the store and into `zone-<zone-id>.pem`. Never put one in an action result, a task reason, or a log line.
