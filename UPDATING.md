# Updating the upstream version

This package wraps Cloudflare's own `cloudflared` release. The Dockerfile copies the binary out of the published `cloudflare/cloudflared` image, so the upstream version and the image tag are the same string.

## Determining the upstream version

- **cloudflared** ([cloudflare/cloudflared](https://github.com/cloudflare/cloudflared)) — fetch the latest release tag:

  ```sh
  gh api repos/cloudflare/cloudflared/releases --jq '.[] | select(.draft == false and .prerelease == false) | .tag_name' | sort -V | tail -1
  ```

  Release tags carry no leading `v`, and the tag is used verbatim as the image tag.

  **Read the release body before pinning.** Cloudflare marks a bad release in place rather than withdrawing it, with a `> [!WARNING] … Do not use this version` note naming the release to use instead. 2026.8.0 and 2026.8.1 both carry one — they rewrote request paths on the way to HTTP origins, which is exactly what this package does for every routed service.

  ```sh
  gh release view -R cloudflare/cloudflared <tag> --json body -q .body | head -5
  ```

  The current pin lives in `startos/versions/current.ts` as `CLOUDFLARED_VERSION`. `startos/manifest/index.ts` reads it and passes `cloudflare/cloudflared:<version>` to the Dockerfile as the `CLOUDFLARED_IMAGE` build arg — there is no `dockerTag` field to edit.

## Refreshing the container base

The final image uses `debian:13-slim`, pinned by its multi-architecture digest in `Dockerfile`. Check the [Docker Hub tag metadata](https://hub.docker.com/v2/repositories/library/debian/tags/13-slim) for the current digest and confirm that both `amd64` and `arm64` images are present before replacing the digest. Keep the Debian slim base: the upstream cloudflared image has no shell, which the package's login helper and StartOS commands require.

Verify that the selected `cloudflare/cloudflared:<version>` tag also exists for both architectures using its Docker Hub tag metadata before building.

## Applying the bump

1. Set `CLOUDFLARED_VERSION` in `startos/versions/current.ts` to the new release tag.
2. Set `version` in the same file to `<new version>:0` — an upstream bump resets the downstream revision.
3. Rewrite `releaseNotes` in all five locales, summarizing the upstream changes and linking to the release.
