#!/usr/bin/env bash
# Convenience wrapper to start the backend gateway, web and mobile dev servers in parallel.
#   bash scripts/dev.sh
#
# Each one runs in its own background process; CTRL+C stops all of them.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

pids=()

cleanup() {
  echo
  echo "Stopping dev processes…"
  for pid in "${pids[@]}"; do
    kill "$pid" 2>/dev/null || true
  done
  wait 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo "▸ Starting backend gateway"
(cd backend && ./mvnw -pl gateway -am spring-boot:run -q) &
pids+=("$!")

echo "▸ Starting web dev server"
(cd web && npm run dev) &
pids+=("$!")

echo "▸ Starting expo metro bundler"
(cd mobile && npm run start) &
pids+=("$!")

echo
echo "Press CTRL+C to stop all processes."
wait
