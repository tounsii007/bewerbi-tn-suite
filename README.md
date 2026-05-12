# bewerbi.tn — Suite

[![CI Backend](https://github.com/bewerbi-tn/suite/actions/workflows/ci-backend.yml/badge.svg)](.)  [![CI Web](https://github.com/bewerbi-tn/suite/actions/workflows/ci-web.yml/badge.svg)](.)  [![CI Mobile](https://github.com/bewerbi-tn/suite/actions/workflows/ci-mobile.yml/badge.svg)](.)  [![CI Flutter](https://github.com/bewerbi-tn/suite/actions/workflows/ci-flutter.yml/badge.svg)](.)

Konsolidierter Monorepo-Workspace für die gesamte **bewerbi.tn**-Plattform — die Brücke nach Deutschland für Tunesier:innen. Eine Codebasis für Backend, Web, Mobile (Expo) und Flutter, mit gemeinsamen Design-Tokens, API-Schemas und CI/CD.

```
bewerbi-tn-suite/
├── backend/    Spring Boot 3.4 · Java 21 · 9 Microservices + Gateway
├── web/        Next.js 15 · React 19 · Tailwind v4 · Radix
├── mobile/     Expo / RN 0.81 · NativeWind · expo-router
├── flutter/    Flutter 3.27 · Riverpod · go_router · Material 3
├── shared/     Design-Tokens · JSON-Schemas · i18n-Seeds · Constants
├── docs/       Architecture · API · Security · Runbook · Contributing
├── scripts/    setup-all · lint-all · dev · clean · sync-tokens
└── .github/    Workflows · CODEOWNERS · Templates · Dependabot
```

## Quickstart

```bash
bash scripts/setup-all.sh        # installiert alles, startet docker-compose-Infra
bash scripts/dev.sh              # startet Gateway + Web + Mobile parallel
```

→ Web: <http://localhost:3000>  ·  Gateway-API: <http://localhost:8080>  ·  Swagger: <http://localhost:8080/docs>

Im Detail: [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md).

## Highlights

| Bereich            | Was die Suite mitbringt                                                           |
|--------------------|-----------------------------------------------------------------------------------|
| **Backend**        | JWT-Auth mit Refresh-Rotation in Redis · per-Account-Brute-Force · Idempotency-Filter · 13 typisierte Error-Mappings · Audit-Log auf eigenem Logger · MDC-Korrelations-Id quer durch alle Services |
| **Security**       | HSTS · X-Frame-Options · COOP/CORP · CSP konfigurierbar · CORS auf explizite Header-Liste · `JwtSecretValidator` fail-fast in prod |
| **Web**            | OKLCH-Design-Tokens · Glassmorphism + Gradient-Mesh · framer-motion Page-Transitions · ⌘K-Command-Palette · Skip-to-Content · Web Vitals · MSW-Mocks · Storybook |
| **Mobile (Expo)**  | Reanimated 4 Press-Springs · BottomSheet · SegmentedControl · Skeleton · Pull-to-Refresh · Forms-Shell · Switch / Checkbox / RadioGroup |
| **Flutter**        | AppMotion Tokens · PageTransitions · BottomSheet · Pressable · Skeleton · SegmentedControl · GradientMesh · Toast / Alert / Chip · PasswordField mit Strength-Meter |
| **Shared**         | Design-Tokens als JSON (Design Token Community Group Format) · JSON-Schemas für API · i18n-Seeds für de/fr/ar · Generator für TS + Dart |
| **CI/CD**          | 5 Workflows (backend/web/mobile/flutter/tokens-check) · Dependabot mit Groups · CODEOWNERS · PR-/Issue-Templates |
| **Observability**  | Per-app HTTP-Duration-Timer · Slow-Request-Logger · Build-Info-Endpoint · MDC-Tags (traceId/spanId/correlationId/userId/method/path) |

## Plattformen & Tech-Stack

| Plattform | Stack                                                                | Hauptzielgruppe                  |
|-----------|----------------------------------------------------------------------|----------------------------------|
| Backend   | Spring Boot 3.4 · Java 21 (Virtual Threads) · Postgres 16 · Redis 7 · Kafka · Resilience4j | Microservices-Cluster (K8s)      |
| Web       | Next.js 15 App-Router · React 19 · Tailwind v4 · Radix · TanStack Query · framer-motion | Desktop / Tablet, Arbeitgeber-Portal |
| Mobile    | Expo SDK 54 · RN 0.81 · NativeWind · Reanimated 4 · Zustand          | iOS / Android Bewerber:innen     |
| Flutter   | Flutter 3.27 · Riverpod · go_router · Material 3                     | Alternative native Erfahrung     |

## Iteration-Roadmap (Abriss)

Die Suite ist in **19 Iterationen** aus den vier Einzelrepos zusammengeführt worden — jeder als eigener Commit mit klarem Fokus. Vollständige Liste: [docs/CHANGELOG.md](docs/CHANGELOG.md).

1. Suite-Workspace
2. Backend-Härtung (Error-Handling, MDC, Tests)
3. Backend-Security (Headers, JWT-Validator, Audit, Brute-Force)
4. Web-Modernisierung (OKLCH, Motion, UI-Primitives)
5. Web-Features (Toast, Alert, Command-Palette, States)
6. Mobile (Expo) Modernisierung (Tokens, Sheets, Components)
7. Mobile-Features (Pressable, Refresh, ListItem, Hooks)
8. Flutter-Modernisierung (Motion, Sheet, Segmented, Mesh)
9. Shared Resources (Tokens-JSON, Schemas, Generator)
10. CI/CD (Workflows, Dependabot, Setup-Scripts)
11. Backend Performance (Hikari, Virtual-Threads, Metrics)
12. Web Accessibility & SEO (Skip-Link, Live-Regions, Sitemap)
13. Mobile Forms (Switch, Checkbox, RadioGroup)
14. Flutter Forms (Field, SwitchTile, RadioGroup, PasswordField)
15. i18n-Seeds + Storybook + MSW-Mocks
16. Web Analytics + Web Vitals + Offline
17. Backend Caching & Idempotency
18. Developer Docs (API, Examples, Runbook)
19. Flutter Toast + Skeleton + ApiError

## Wo finde ich…?

| Frage                            | Datei                                             |
|----------------------------------|---------------------------------------------------|
| Wie ist die Plattform aufgebaut? | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)       |
| Wie sieht die API aus?           | [docs/API.md](docs/API.md)                         |
| Beispielcode für häufige Tasks   | [docs/EXAMPLES.md](docs/EXAMPLES.md)               |
| Sicherheit / Audits              | [docs/SECURITY.md](docs/SECURITY.md)               |
| Wenn etwas brennt                | [docs/RUNBOOK.md](docs/RUNBOOK.md)                 |
| Wie contribute ich?              | [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md)       |
| Vollständiger Changelog          | [docs/CHANGELOG.md](docs/CHANGELOG.md)             |
| Design-Tokens                    | [shared/tokens/](shared/tokens/)                   |
| API-Schemas                      | [shared/schemas/](shared/schemas/)                 |

## Lizenz

Proprietär. © bewerbi.tn.
