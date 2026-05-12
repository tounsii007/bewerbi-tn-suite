#!/usr/bin/env bash
# One-shot first-time setup. Run from the suite root.
#   bash scripts/setup-all.sh
#
# Idempotent — re-running is safe.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

say() { printf "\033[1;36m▸ %s\033[0m\n" "$*"; }

# ── Sanity checks ───────────────────────────────────────────
command -v node    >/dev/null || { echo "node missing"; exit 1; }
command -v java    >/dev/null || { echo "java missing"; exit 1; }
command -v flutter >/dev/null || echo "  (flutter missing — flutter/ steps will be skipped)"

# ── Tokens ──────────────────────────────────────────────────
say "Regenerating shared tokens"
node scripts/sync-tokens.mjs

# ── Backend ─────────────────────────────────────────────────
say "Building backend (mvnw install -DskipTests)"
(cd backend && ./mvnw -B install -DskipTests)

# ── Web ─────────────────────────────────────────────────────
say "Installing web deps"
(cd web && npm ci --no-audit --no-fund)

# ── Mobile ──────────────────────────────────────────────────
say "Installing mobile deps"
(cd mobile && npm ci --no-audit --no-fund)

# ── Flutter ─────────────────────────────────────────────────
if command -v flutter >/dev/null; then
  say "Fetching flutter packages"
  (cd flutter && flutter pub get)
fi

# ── Infra ───────────────────────────────────────────────────
say "Starting infra (postgres/redis/mailhog/kafka/jaeger)"
(cd backend && docker compose up -d)

cat <<'EOF'

✓ Setup complete.

Next steps:
  cd backend && ./mvnw -pl gateway -am spring-boot:run
  cd web     && npm run dev
  cd mobile  && npm run start
  cd flutter && flutter run
EOF
