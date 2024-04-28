#!/bin/sh

echo
echo "Initialising Cloudflare Tunnel for StartOS..."
echo

export TUNNEL_TOKEN="$(yq e '.token' /root/data/start9/config.yaml)"

/usr/local/bin/cloudflared tunnel --no-autoupdate run
