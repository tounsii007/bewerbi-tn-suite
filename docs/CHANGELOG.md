# Suite-Changelog

Iterationsweises Hardening, Modernisierung und Konsolidierung der bewerbi.tn-Suite.

## Iteration 1 — Suite-Setup
- Vier Projekte (backend, web, mobile, flutter) in einen Monorepo-Workspace überführt.
- Gemeinsames `README`, `.gitignore`, `CHANGELOG`, `docs/` und `shared/` angelegt.
- Git-Repository initialisiert; jede Iteration wird als separater Commit getrackt.

## Iteration 2 — Backend-Härtung

**common-api**

- `ApiError` um `path` und `traceId` erweitert; beide werden aus MDC gezogen.
- `RequestContextFilter` populiert MDC mit `path`, `method`, `correlationId` und echo't
  letzteren in `X-Correlation-Id` zurück. Auto-registriert via
  `CommonApiAutoConfiguration` + `AutoConfiguration.imports`.
- `GlobalExceptionHandler` erweitert um:
  - `TooManyRequestsException` (setzt `Retry-After`-Header)
  - `MissingServletRequestParameterException` → `400 MISSING_PARAMETER`
  - `MethodArgumentTypeMismatchException` → `400 TYPE_MISMATCH`
  - `HttpMessageNotReadableException` → `400 MALFORMED_JSON`
  - `HttpRequestMethodNotSupportedException` → `405` mit `Allow`-Header
  - `HttpMediaTypeNotSupportedException` → `415`
  - `NoHandlerFoundException` → `404`
  - `MaxUploadSizeExceededException` → `413`
  - `ResponseStatusException` (durchreichen)
  - `AccessDeniedException` → `403`
  - `AuthenticationException` → `401`
  - `DataIntegrityViolationException` → `409 DATA_INTEGRITY`
  - `OptimisticLockingFailureException` → `409 STALE_RESOURCE`
- Neue Exception-Typen: `Unauthorized`, `Forbidden`, `UnprocessableEntity`,
  `TooManyRequests`, `PayloadTooLarge`, `ServiceUnavailable`. Mit Factory-Helfern.

**Logging**

- `logback-spring.xml` um `correlationId`, `userId`, `method`, `path` in MDC-Pattern
  und JSON-Profile erweitert.

**Health & Build-Info**

- Neuer Actuator-Endpoint `/actuator/buildinfo` liefert app, version, commit,
  startedAt, uptimeSec — geeignet für Deployment-Verifikation.

**Tests**

- `ApiErrorTest` und `RequestContextFilterTest` decken MDC-Propagation,
  Correlation-Id-Generierung und MDC-Cleanup ab.
- `spring-boot-starter-test` als Test-Dep in `common-api/pom.xml` ergänzt.

## Iteration 3 — Backend-Security

**Defense-in-Depth Headers**

- `SecurityHeadersFilter` (Servlet) und `SecurityHeadersWebFilter` (Reactive, Gateway):
  setzen HSTS, X-Content-Type-Options, X-Frame-Options=DENY, Referrer-Policy,
  Permissions-Policy, COOP/CORP für jede Antwort. CSP konfigurierbar über
  `bewerbi.security.headers.csp`.

**JWT-Härtung**

- `JwtSecretValidator`: fail-fast bei leerem, zu kurzem oder Default-Secret im
  `prod`-Profil. Dev/Test loggt nur Warnungen.
- CORS auf explizite Header- und Origin-Pattern-Liste umgestellt; Wildcard-Header
  mit Credentials sind spec-konform problematisch.

**Brute-Force-Schutz**

- `LoginAttemptTracker`: Redis-basierter Counter pro Email. 10 Failures / 10 Min
  → 15 Min Lockout. Konfigurierbar via `bewerbi.security.login.*`. Bean nur
  registriert, wenn Redis im Classpath.

**Audit-Logging**

- `AuditEvent` (record) + `AuditLogger`: schreibt strukturierte Events auf den
  dedizierten Logger `tn.bewerbi.audit`. Operations-Pipelines können
  diesen separat (länger) aufbewahren. MDC-Keys `audit.type/actor/target/outcome`.

**Actuator-Härtung**

- Default-Filter-Chain trennt Probes (`/actuator/health{,/liveness,/readiness}`,
  `/info`, `/buildinfo`) von sensiblen Endpunkten (`/prometheus`, `/metrics`,
  `/loggers`, `/env`, `/beans`, `/configprops`) — letztere nur für `ROLE_ADMIN`.

**Auto-Konfiguration**

- `CommonSecurityAutoConfiguration` via `AutoConfiguration.imports` — keine
  `@Import`s mehr nötig in den Services.

**Gateway**

- `SecurityHeadersWebFilter` analog zum Servlet-Filter.
- `RequestLoggingWebFilter`: gateway.access-Logger mit Methode/Pfad/Status/
  Latenz/IP/Correlation-Id pro Request. Korrelations-Id wird downstream
  propagiert und im Response-Header echo't.

**Tests**

- `JwtSecretValidatorTest` deckt fail-fast in prod, dev-Warnings und Akzeptanz
  langer Secrets ab.

## Iteration 4 — Web-Modernisierung

**Design-Tokens**

- Komplett auf **OKLCH** umgestellt (Primary, Accent, Success, Warning, Info,
  Neutral, Dark). Verbesserte perzeptive Helligkeit, sauberer Dark-Mode-Kontrast.
- Tokens für **Radius** (sm…3xl, pill), **Shadow** (xs…2xl + inner + glow) und
  **Motion** (spring/out-expo/out-quad easings, fast/normal/slow durations).
- Typography-Stack inkl. `--font-display` und Inter Stylistic-Sets `cv02/03/04/11`.

**Utility-Klassen**

- `.glass` — frosted-glass Surface
- `.gradient-mesh` — multi-Stop Radial-Mesh als Hero-Hintergrund
- `.text-gradient` — animierte Headlines
- `.press` / `.lift` — Micro-Interactions
- Keyframes: `shimmer`, `fade-in-up`, `pulse-soft`, `loading-bar`
- `@media (prefers-reduced-motion)` global respektiert

**Komponenten**

- `Button` — Varianten erweitert: `gradient`, `glass`, plus `loading`, `leadingIcon`,
  `trailingIcon`, `block`-Prop. Active-Scale + Spinner-Slot.
- `Card` — Varianten `default | elevated | flat | glass | ghost | outline | accent | gradient`,
  optional `interactive` (lift on hover).
- `Skeleton` — Shimmer (default) oder Pulse, plus `SkeletonGroup` für Textzeilen mit
  natürlicher ragged-right-Optik.
- `Spinner` — Stand-alone Komponente, vier Größen, drei Tones.
- `LoadingBar` — Top-of-Page-Bar (YouTube/GitHub-Stil) mit 80ms-Delay gegen Flicker.
- `Badge` — Variante `premium` mit Ring; optionaler Status-Dot.
- `Input` / `Textarea` — Focus-Ring auf OKLCH-Glow; disabled-State; aria-invalid.
- `Field` — Label+Hint+Error-Wrapper, Required-Sternchen.
- `PageTransition` (framer-motion) — sanfte Fade-Slide-Transitions zwischen Routes.
- `StaggerContainer` / `StaggerItem` — List-Reveal mit 40ms Stagger.

