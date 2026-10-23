# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

**Start every task at the recipe index** — `../start-technologies/projects/start-sdk/docs/src/recipes.md`
(or <https://docs.start9.com/packaging/recipes.html>). It maps an intent ("prompt the user to create
admin credentials", "expose a web UI") to the constructs, the reference pages, and a named production
package to copy. Find the recipe before you read this package's neighbours: a package you reach by
grepping may be non-conformant, and the recipe outranks it.

Freshly scaffolded? Work the
[New Package Checklist](../start-technologies/projects/start-sdk/docs/src/new-package-checklist.md)
(or <https://docs.start9.com/packaging/new-package-checklist.html>) from top to bottom. It is a
guide page, not a file in this repo — read it, don't copy it in.

Keep `README.md` (technical reference for an AI support or administering agent) and
`instructions.md` (end-user docs) in sync with your changes. This file restates neither:
whoever changes the package has both, so it carries only what they don't — repo mechanics,
a change that looks right and is not, where the next thing gets added, a naming trap, a
build or test invocation particular to this repo.

**Fix a defect you spot rather than reporting it** — you have the package open and the
context to be sure. File **a GitHub issue on this repo** only when the call isn't yours to
make: you can't pin the cause down, two defensible fixes exist, or it's too large to ride on
the work in hand. An open issue is a report, not a queue — implement one when you're asked
to or when it's labelled `Approved`, then close it with `Closes #<n>`.

Don't record work in the repo instead: no `TODO.md`, no `NOTES.md`, no `PLAN.md`. What you
verified, tried, and decided belongs in the commit message and the PR body.

## This repo

- **Keep the Dockerfile's `debian:13-slim` base; don't switch it to `FROM cloudflare/cloudflared`.** The upstream image is distroless, and `scripts/cf-login.sh` and every `SubContainer.exec` need `/bin/sh`.
- **`add-public-hostname` and `delete-public-hostname` stay `visibility: 'hidden'`** — they are the `url-v0` plugin handshake, run from another service's address table with a platform-filled `urlPluginMetadata`.
- **Route every tunnel-configuration change through `updateCloudflareIngress` (`startos/init/reconcileIngress.ts`).** Cloudflare's `PUT` replaces the whole configuration, so an ingress array built from the store alone deletes the user's dashboard-managed routes.
- **Keep route-address subscriptions in the init handler and snapshot reads in actions.** Watch stable route targets; exclude resolved origins and repair flags so reconciliation's own writes cannot retrigger it.
- **Never put a zone's API token in an action result, a task reason, or a log line.** It is decoded from `cert.pem` into the store and `zone-<zone-id>.pem`.
