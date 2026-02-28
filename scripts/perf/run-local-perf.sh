#!/usr/bin/env bash
set -euo pipefail

PORT="${PORT:-3000}"
MODE="${1:-baseline}"
REPORT_DIR="reports/perf"

mkdir -p "$REPORT_DIR"

npm run build

npm run start -- -p "$PORT" >/tmp/clevr-tools-next-start.log 2>&1 &
SERVER_PID=$!

cleanup() {
  if kill -0 "$SERVER_PID" >/dev/null 2>&1; then
    kill "$SERVER_PID" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

for _ in {1..40}; do
  if curl -sf "http://127.0.0.1:${PORT}" >/dev/null 2>&1; then
    break
  fi
  sleep 0.5
done

node scripts/perf/route-bytes.mjs \
  / \
  /compress/image \
  /convert/pdf-to-jpg \
  >"${REPORT_DIR}/${MODE}-route-bytes.txt"

node scripts/perf/measure-web-vitals.mjs \
  --out "${REPORT_DIR}/${MODE}-web-vitals.json" \
  "http://127.0.0.1:${PORT}/" \
  "http://127.0.0.1:${PORT}/compress/image" \
  "http://127.0.0.1:${PORT}/convert/pdf-to-jpg"
