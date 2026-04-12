#!/bin/sh
# Starts `cloudflared tunnel login`, extracts the auth URL and writes it to the
# volume so the StartOS action can return it to the user. Then waits up to 10
# minutes for the user to authorize (cert.pem is written to /root/.cloudflared/).

set -e

URL_FILE="/root/data/start9/login-url.txt"
LOG_FILE="/tmp/cf-login.log"

rm -f "$URL_FILE"

# Start cloudflared login in the background; cert lands in /root/.cloudflared/
cloudflared tunnel login >"$LOG_FILE" 2>&1 &
CF_PID=$!

# Extract auth URL from the log as soon as it appears (timeout 30s)
i=0
while [ $i -lt 30 ]; do
  URL=$(grep -oE 'https://dash\.cloudflare\.com[^[:space:]"]+' "$LOG_FILE" 2>/dev/null | head -1)
  if [ -n "$URL" ]; then
    echo "$URL" >"$URL_FILE"
    break
  fi
  sleep 1
  i=$((i + 1))
done

if [ -z "$URL" ]; then
  echo "ERROR: could not extract auth URL after 30s"
  cat "$LOG_FILE"
  kill "$CF_PID" 2>/dev/null || true
  exit 1
fi

# Wait for auth to complete (user authorizes in browser)
wait "$CF_PID"
EXIT_CODE=$?

cat "$LOG_FILE"

if [ $EXIT_CODE -ne 0 ]; then
  echo "cloudflared login failed (exit $EXIT_CODE)"
  exit 1
fi

if [ ! -f "/root/.cloudflared/cert.pem" ]; then
  echo "Login appeared to succeed but cert.pem was not found"
  exit 1
fi

echo "Login successful"
