#!/usr/bin/env bash
# Wipes build artefacts and dependency directories. Safe — only known dirs.
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT"
echo "Cleaning…"
find backend  -type d \( -name target \) -prune -exec rm -rf {} +
find .        -type d \( -name node_modules -o -name ".next" -o -name "dist" -o -name ".expo" -o -name ".turbo" \) -prune -exec rm -rf {} +
find flutter  -type d \( -name .dart_tool -o -name build \) -prune -exec rm -rf {} +
echo "Done."
