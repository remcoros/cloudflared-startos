# TODO

- **Make route resolution live, once someone can test it against a real Cloudflare account.**
  `resolveService` in `startos/init/reconcileIngress.ts` uses `sdk.host.getBridgeAddress(...).once()`,
  so managed routes are re-resolved only when this service starts or `repair-routes` runs. Switching
  that to `.const()` inside the `reconcileIngress` init handler would make the tunnel follow a target's
  assigned port live, via `constRetry`.

  A `reactive` flag that did exactly this shipped dead in `bbab74a` — every call site passed `false`,
  so the path has never executed on any server — and it was removed during the 2026-08 audit rather
  than switched on untested. The mechanism reads as safe (one retrigger per run, `once()`-capped and
  serialized behind the run's completion; the watcher is a patch-db watch on the _target's_ host
  subtree, deduped on the resolved address string, so this package's own store writes cannot retrigger
  it; a throw is logged, not retried). What could not be checked is behavior against the live
  Cloudflare API, and each retrigger costs 2 GETs + 1 PUT with no debounce or cap.

  Finish it only with an account, a zone, and a routed service whose port you can actually move.
  Update `README.md` (Network Access and Interfaces, Limitations, Troubleshooting) and
  `instructions.md` if it lands.
