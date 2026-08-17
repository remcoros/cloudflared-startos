# Updating the upstream version

This package wraps Cloudflare's own `cloudflared` release. The Dockerfile copies the binary out of the published `cloudflare/cloudflared` image, so the upstream version and the image tag are the same string.

## Determining the upstream version

- **cloudflared** ([cloudflare/cloudflared](https://github.com/cloudflare/cloudflared)) — fetch the latest release tag:

  ```sh
  gh release view -R cloudflare/cloudflared --json tagName -q .tagName
  ```

  Release tags carry no leading `v`, and the tag is used verbatim as the image tag.

  **Read the release body before pinning.** Cloudflare marks a bad release in place rather than withdrawing it, with a `> [!WARNING] … Do not use this version` note naming the release to use instead. 2026.8.0 and 2026.8.1 both carry one — they rewrote request paths on the way to HTTP origins, which is exactly what this package does for every routed service.

  ```sh
  gh release view -R cloudflare/cloudflared <tag> --json body -q .body | head -5
  ```

  The current pin lives in `startos/versions/current.ts` as `CLOUDFLARED_VERSION`. `startos/manifest/index.ts` reads it and passes `cloudflare/cloudflared:<version>` to the Dockerfile as the `CLOUDFLARED_IMAGE` build arg — there is no `dockerTag` field to edit.

## Applying the bump

1. Set `CLOUDFLARED_VERSION` in `startos/versions/current.ts` to the new release tag.
2. Set `version` in the same file to `<new version>:0` — an upstream bump resets the downstream revision.
3. Rewrite `releaseNotes` in all five locales, summarizing the upstream changes and linking to the release.
