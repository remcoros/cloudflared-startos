# CLOUDFLARED_IMAGE is passed in by the manifest; see UPDATING.md for the pin.
ARG CLOUDFLARED_IMAGE=cloudflare/cloudflared:latest

FROM $CLOUDFLARED_IMAGE AS cloudflared

# The upstream image is distroless: no shell, and a non-root default user. Both
# cf-login.sh and every SubContainer.exec need one, so only the binary is kept.
FROM debian:13-slim@sha256:62bd423aeee912639ca8ee681c2b762cb3e25137e0a92b20be455898a9f034ad

RUN \
    apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install --no-install-recommends -y \
        ca-certificates && \
    apt-get autoclean && \
    rm -rf \
      /var/lib/apt/lists/* \
      /var/tmp/* \
      /tmp/*

COPY --chmod=0755 --from=cloudflared /usr/local/bin/cloudflared /usr/local/bin/cloudflared

COPY --chmod=0755 scripts/cf-login.sh /usr/local/bin/cf-login.sh
