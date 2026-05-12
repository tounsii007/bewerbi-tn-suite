# bewerbi.tn — Suite

Konsolidierter Monorepo-Workspace für die gesamte **bewerbi.tn**-Plattform: Backend-Microservices, Web, Mobile (React Native / Expo) und Flutter. Ziel: eine gemeinsame Quelle der Wahrheit für Konfiguration, Design-Tokens, Docs und CI/CD über alle Clients hinweg.

## Struktur

```
bewerbi-tn-suite/
├── backend/        Spring-Boot-Microservices (Java 21, Maven multi-module)
├── web/            Next.js 15 App-Router (React 19, Tailwind v4, Radix)
├── mobile/         Expo / React Native 0.81 (NativeWind, expo-router)
├── flutter/        Flutter 3.11 (Riverpod, go_router, Material 3)
├── shared/         Plattformunabhängige Tokens, Schemas, Konstanten
├── docs/           Architektur-, API-, Setup-Dokumentation
└── scripts/        Helfer-Skripte (Setup, Build, Lint, Sync)
```

## Quickstart

```bash
# 1. Backend hochfahren (Postgres, Redis, Kafka via docker compose)
cd backend && docker compose up -d
./mvnw install -DskipTests
./mvnw -pl gateway -am spring-boot:run

# 2. Web
cd web && npm install && npm run dev

# 3. Mobile (Expo)
cd mobile && npm install && npm run start

# 4. Flutter
cd flutter && flutter pub get && flutter run
```

## Plattform-übergreifende Themen

- **Auth**: HMAC-JWT (Access 60 min, Refresh in Redis, rotierend).
- **i18n**: Server-seitig via `i18n-service`. Clients pinnen Locale via `Accept-Language`/`X-Locale`.
- **Theme**: Geteilte Design-Tokens in `shared/tokens/` (siehe Iteration 9).
- **API-Versionierung**: `/api/v1/*` — Breaking-Changes erhöhen Major.

## Iterations-Roadmap

Die Suite wurde in mehreren Iterationen aus den vier Einzelrepos zusammengeführt. Jede Iteration ist ein eigener Commit mit klarem Fokus — siehe `docs/CHANGELOG.md`.

## Lizenz

Proprietär. © bewerbi.tn.
