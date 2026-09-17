#!/usr/bin/env bash
# Deploy Lexi to production host (rsync + docker compose rebuild).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
HOST="${DEPLOY_HOST:-shtikoff}"
REMOTE_PATH="${DEPLOY_PATH:-/home/profipark/lexi.shtikoff.ru}"
REMOTE_PORT="${DEPLOY_APP_PORT:-3010}"

cd "$ROOT"

echo "==> Sync to ${HOST}:${REMOTE_PATH}"
rsync -az --delete \
  --exclude node_modules \
  --exclude .git \
  --exclude .env \
  --exclude .nuxt \
  --exclude .output \
  --exclude .data \
  --exclude .cache \
  --exclude '*.log' \
  ./ "${HOST}:${REMOTE_PATH}/"

echo "==> Rebuild app on ${HOST}"
ssh -o BatchMode=yes "${HOST}" "cd '${REMOTE_PATH}' && docker compose up -d --build --force-recreate app"

echo "==> Wait for app"
ok=0
for i in $(seq 1 60); do
  if ssh -o BatchMode=yes "${HOST}" "curl -fsS -o /dev/null -w '%{http_code}' http://127.0.0.1:${REMOTE_PORT}/api/auth/features" 2>/dev/null | grep -qE '200'; then
    ok=1
    break
  fi
  sleep 2
done

if [ "$ok" != "1" ]; then
  echo "ERROR: app did not become healthy on :${REMOTE_PORT}"
  ssh -o BatchMode=yes "${HOST}" "cd '${REMOTE_PATH}' && docker compose ps && docker compose logs app --tail 40"
  exit 1
fi

echo "==> Status"
ssh -o BatchMode=yes "${HOST}" "cd '${REMOTE_PATH}' && docker compose ps && curl -sI http://127.0.0.1:${REMOTE_PORT}/ | head -5"

echo "==> Deploy OK → ${HOST} (port ${REMOTE_PORT})"
