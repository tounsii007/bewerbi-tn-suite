# Architektur — bewerbi.tn

## Übersicht

bewerbi.tn ist eine Plattform, die Tunesier:innen den Berufseinstieg in Deutschland erleichtert. Sie deckt das Spektrum von Bewerbungsmanagement, Anerkennungs- und Visa-Workflows, Stellenmatching, Firmenverifikation bis hin zur mehrsprachigen Inhalts-Distribution ab.

## Client-Plattformen

| Client     | Stack                       | Ziel-Audience                          |
|------------|-----------------------------|----------------------------------------|
| `web/`     | Next.js 15 App-Router       | Desktop-Bewerber:innen, Arbeitgeber    |
| `mobile/`  | Expo / RN 0.81 + NativeWind | iOS/Android — auch Low-End-Geräte      |
| `flutter/` | Flutter 3.11                | Alternative Mobile-Implementierung     |

Alle Clients sprechen mit demselben Backend-Gateway (`:8080`). Auth via HMAC-JWT, i18n via `Accept-Language`.

## Backend

Spring-Boot-3.4-Microservices auf Java 21 mit Virtual Threads. Spring Cloud Gateway routet zu:

- `identity-service`     — Auth, Profile, Onboarding
- `i18n-service`         — Messages, Reference-Data, Professions
- `jobs-service`         — Stellen + Suche (pg_trgm)
- `applications-service` — Bewerbungen
- `companies-service`    — Firmen + Reviews + Verifikation
- `immigration-service`  — Anerkennungs- & Visa-Cases
- `documents-service`    — Upload + CV-Parsing (PDFBox 3)
- `matching-service`     — Empfehlungen
- `notification-service` — Mail + Push

Persistenz: PostgreSQL 16 (Schema-per-Service), Redis 7 (Refresh-Token, i18n-Cache), Kafka 7 (Event-Bus).

## Cross-Cutting Concerns

- **Security**: `shared/common-security` — JWT-Decoder/Encoder, CORS, Default `SecurityFilterChain`.
- **i18n**: `shared/common-i18n` — Locale-Context-Filter, Redis-gecachter Message-Client.
- **API-Fehler**: `shared/common-api` — `ApiError` mit `messageKey`, globaler `ExceptionHandler`.
- **Events**: `shared/common-events` — typisierte Records, Kafka-Publisher.

## Observability

- Metrics: Actuator + Prometheus (`/actuator/prometheus`).
- Tracing: Micrometer + OTLP → Jaeger.
- Logs: strukturierte JSON-Logs (Iter 2 ergänzt).

## Deployment-Zielbild

Kubernetes (Helm-Charts pro Service), Service-Mesh für mTLS, externes Postgres (RDS/CloudSQL), Managed Kafka.
