#!/bin/sh
# Starts `cloudflared tunnel login`, extracts the auth URL and writes it to the
# volume so the StartOS action can return it to the user. Each login runs in an
# isolated session directory; if a newer login flow starts, the older one exits
# cleanly without publishing a stale URL or cert.pem.

set -eu

SESSION_ID="${LOGIN_SESSION_ID:-}"
if [ -z "$SESSION_ID" ]; then
  echo 'ERROR: LOGIN_SESSION_ID is required'
  exit 1
fi

URL_FILE="/root/data/start9/login-url.txt"
SESSION_FILE="/root/data/start9/login-session-id.txt"
SESSION_ROOT="/root/data/start9/login-sessions"
SESSION_HOME="$SESSION_ROOT/$SESSION_ID"
SESSION_CERT_DIR="$SESSION_HOME/.cloudflared"
SESSION_CERT_FILE="$SESSION_CERT_DIR/cert.pem"
FINAL_CERT_FILE="/root/data/.cloudflared/cert.pem"
LOG_FILE="$SESSION_HOME/cf-login.log"
URL=''
CF_PID=''

mkdir -p "$SESSION_CERT_DIR" "/root/data/.cloudflared" "$(dirname "$URL_FILE")"
rm -f "$URL_FILE"

cleanup() {
  rm -rf "$SESSION_HOME"
}

cancel_login() {
  if [ -n "$CF_PID" ]; then
    kill "$CF_PID" 2>/dev/null || true
    wait "$CF_PID" 2>/dev/null || true
  fi
}

is_current() {
  [ -f "$SESSION_FILE" ] && [ "$(cat "$SESSION_FILE" 2>/dev/null)" = "$SESSION_ID" ]
}

trap cleanup EXIT

# Start cloudflared login in an isolated HOME so only the active session can
# publish the cert into the shared .cloudflared volume.
HOME="$SESSION_HOME" cloudflared tunnel login >"$LOG_FILE" 2>&1 &
CF_PID=$!

# Extract auth URL from the log as soon as it appears (timeout 30s)
i=0
while [ $i -lt 30 ]; do
  if ! is_current; then
    echo 'Login flow superseded before URL was published'
    cancel_login
    exit 0
  fi

  URL=$(grep -oE 'https://dash\.cloudflare\.com[^[:space:]"]+' "$LOG_FILE" 2>/dev/null | head -1)
  if [ -n "$URL" ]; then
    if ! is_current; then
      echo 'Login flow superseded before URL was published'
      cancel_login
      exit 0
    fi
    echo "$URL" >"$URL_FILE"
    break
  fi
  sleep 1
  i=$((i + 1))
done

if [ -z "$URL" ]; then
  echo 'ERROR: could not extract auth URL after 30s'
  cat "$LOG_FILE"
  cancel_login
  exit 1
fi

# Wait for auth to complete, but keep checking whether a newer login flow has
# taken over.
while kill -0 "$CF_PID" 2>/dev/null; do
  if ! is_current; then
    echo 'Login flow superseded by a newer request'
    cancel_login
    exit 0
  fi
  sleep 1
done

if wait "$CF_PID"; then
  EXIT_CODE=0
else
  EXIT_CODE=$?
fi

cat "$LOG_FILE"

if ! is_current; then
  echo 'Login flow superseded after cloudflared exited'
  exit 0
fi

if [ $EXIT_CODE -ne 0 ]; then
  echo "cloudflared login failed (exit $EXIT_CODE)"
  exit 1
fi

if [ ! -f "$SESSION_CERT_FILE" ]; then
  echo 'Login appeared to succeed but cert.pem was not found'
  exit 1
fi

cp "$SESSION_CERT_FILE" "$FINAL_CERT_FILE"
echo 'Login successful'
