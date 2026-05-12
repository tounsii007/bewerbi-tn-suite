# Contributing — bewerbi.tn Suite

## Development setup

```bash
bash scripts/setup-all.sh
```

This installs every dependency, regenerates design tokens, and starts the local infra (Postgres, Redis, Kafka, MailHog, Jaeger) via `docker compose`.

## Running the apps

| Component | Command (from suite root)                                  | Port |
|-----------|------------------------------------------------------------|------|
| Gateway   | `cd backend && ./mvnw -pl gateway -am spring-boot:run`     | 8080 |
| Web       | `cd web && npm run dev`                                    | 3000 |
| Mobile    | `cd mobile && npm run start`                               | 19006 |
| Flutter   | `cd flutter && flutter run`                                | —    |

For everything in parallel: `bash scripts/dev.sh`.

## Before pushing

```bash
bash scripts/lint-all.sh
```

This runs the same checks CI does (lint, typecheck, build, analyze, tests). If something fails locally, it'll fail CI too.

## Design tokens

Edit JSON under `shared/tokens/*.json`, then regenerate the platform files:

```bash
node scripts/sync-tokens.mjs
```

Commit **both** the JSON edit and the regenerated `*-tokens.{ts,dart}` files — the `tokens-check` workflow rejects PRs where one is missing.

## Commit style

- Imperative subject line under 70 chars.
- Group changes by intent in the body; one paragraph per topic.
- Mention service/package boundaries explicitly (`identity-service:`, `web/ui:`, `mobile/hooks:`).
- Co-author trailers welcome — `Co-Authored-By: …`.

## Architecture decisions

Material changes to the system shape (a new microservice, a breaking API, a new shared dependency) need an ADR. Use the `engineering:architecture` slash command if you have Claude Code handy, or copy the template below:

```
# ADR-NNN: <decision>

## Status
proposed | accepted | superseded

## Context
What problem are we solving? What constraints?

## Decision
What we chose.

## Consequences
What's better. What's worse. What's now harder to change.
```

Drop ADRs into `docs/adr/NNN-short-title.md`.

## Code review

- Every PR needs one reviewer; security-sensitive changes (auth, JWT, headers, CORS) need two.
- Run the `security-review` slash command on the diff before requesting review for any change in `backend/shared/common-security/` or `backend/gateway/`.
- Keep PRs small. If the description doesn't fit on one screen, the PR probably doesn't either.
