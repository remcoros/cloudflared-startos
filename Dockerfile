# cloudflared container version is defined in Makefile
ARG CLOUDFLARED_IMAGE

# used to copy cloudflared binary
FROM $CLOUDFLARED_IMAGE as cloudflared

# run on debian bookworm slim
FROM debian:12-slim

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

# add local files
COPY --chmod=0755 ./docker_entrypoint.sh /usr/local/bin/docker_entrypoint.sh
COPY --chmod=0755 ./tmp/yq_linux_${PLATFORM} /usr/local/bin/yq
COPY --chmod=0755 --from=cloudflared /usr/local/bin/cloudflared /usr/local/bin/cloudflared
