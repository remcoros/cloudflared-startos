# cloudflared container version is defined in manifest.ts
ARG CLOUDFLARED_IMAGE=cloudflare/cloudflared:latest

# used to copy cloudflared binary
FROM $CLOUDFLARED_IMAGE AS cloudflared

# run on debian troxie slim
FROM debian:13-slim

ARG PLATFORM

RUN \
    apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install --no-install-recommends -y \
        ca-certificates && \
    apt-get autoclean && \
    rm -rf \
      /var/lib/apt/lists/* \
      /var/tmp/* \
      /tmp/*

# add cloudflared binary
COPY --chmod=0755 --from=cloudflared /usr/local/bin/cloudflared /usr/local/bin/cloudflared

# add login helper script
COPY --chmod=0755 scripts/cf-login.sh /usr/local/bin/cf-login.sh
