# cloudflared container version is defined in Makefile
ARG CLOUDFLARED_IMAGE

# used to copy cloudflared binary
FROM $CLOUDFLARED_IMAGE as cloudflared

# run on debian bookworm slim
FROM debian:12-slim

ARG PLATFORM

# add local files
COPY --chmod=a+x ./docker_entrypoint.sh /usr/local/bin/docker_entrypoint.sh
COPY --chmod=0755 ./tmp/yq_linux_${PLATFORM} /usr/local/bin/yq
COPY --chmod=a+x --from=cloudflared /usr/local/bin/cloudflared /usr/local/bin/cloudflared
