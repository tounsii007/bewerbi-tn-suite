#!/usr/bin/env bash
# Run every linter / typecheck the CI runs. Use locally before pushing.
#   bash scripts/lint-all.sh
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

fails=0
say() { printf "\033[1;36m▸ %s\033[0m\n" "$*"; }
fail() { printf "\033[1;31m✗ %s\033[0m\n" "$*"; fails=$((fails+1)); }
pass() { printf "\033[1;32m✓ %s\033[0m\n" "$*"; }

say "Sync tokens (ensures generated files are current)"
node scripts/sync-tokens.mjs

say "Web lint + typecheck + build"
(cd web && npm run lint && npm run typecheck) && pass "web" || fail "web"

say "Mobile typecheck"
(cd mobile && npx tsc --noEmit) && pass "mobile" || fail "mobile"

if command -v flutter >/dev/null; then
  say "Flutter analyze + test"
  (cd flutter && flutter analyze --no-fatal-warnings && flutter test) && pass "flutter" || fail "flutter"
else
  echo "  (flutter missing — skipped)"
fi

say "Backend validate (no tests)"
(cd backend && ./mvnw -B -q validate) && pass "backend" || fail "backend"

if [ "$fails" -gt 0 ]; then
  printf "\n\033[1;31m%d job(s) failed\033[0m\n" "$fails"
  exit 1
fi
printf "\n\033[1;32mAll green\033[0m\n"
