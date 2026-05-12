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

## Iteration 5 — Web-Features

**Toasts**

- `Toaster` neu — Lucide-Icons, Severity-Border-Left, dark-mode-aware via
  `useThemeStore`, close-Button, größere `gap`/`offset`. Re-export `toast`
  von sonner, sodass Feature-Code nicht direkt von der Library importiert.

**Empty/Error**

- `EmptyState` mit Icon-Bubble, optional Action, `compact`-Variante.
- `ErrorState` mit Retry-Button und `showDetails` (nur in Dev — Stack-Traces).
- `ErrorBoundary` Class-Component → rendert `ErrorState` als Fallback,
  `componentDidCatch` loggt für spätere Sentry-Integration.

**Inline-Notice**

- `Alert` mit Varianten info/success/warning/error/neutral, Auto-Icon,
  optional Title und Action-Slot.

**Navigation/Discovery**

- `CommandPalette` (⌘K / Ctrl+K) — Volltext-Filter, Keyboard-Navigation
  (Arrow/Enter/Esc), Gruppen-Headings, Items mit `href` ODER `onSelect`.
  Lokal mountbar — Routen-Items werden per Prop reingereicht.

**Layout-Helfer**

- `SectionHeader` — Eyebrow + Title + Description + Actions, optional Gradient.
- `Tooltip` (Radix-Wrapper) mit Shortcut-Slot.
- `Kbd` — branded `<kbd>` Element.

**Hooks**

- `useMediaQuery` + `breakpoints`-Konstanten (Tailwind-aligned) + `useIsMobile`.
- `useCopyToClipboard` mit self-resetting "copied"-Flag + Legacy-Fallback.
- `useOnClickOutside` für ad-hoc Dropdowns.
- `useLocalStorage` SSR-safe mit `hydrated`-Flag + `reset`.

## Iteration 6 — Mobile (Expo) Modernisierung

**Design-Tokens**

- `src/lib/tokens.ts` — plain-JS Spacing/Radius/Motion/Palette zum Inline-Verbrauch
  in RN-Styles und Reanimated-Worklets (Tailwind-Klassen können dort nicht gelesen
  werden). Spring-Presets `press / enter / bounce` für die Micro-Interactions.

**Button**

- Varianten erweitert: `primary | secondary | outline | ghost | subtle | destructive | gradient`
- Sizes inkl. `xl`, optional `trailingIcon`, animierte Opacity zusätzlich zum
  Scale-Press, `accessibilityRole/State/Label` korrekt gesetzt.

**Neue UI-Komponenten**

- `Skeleton` + `SkeletonGroup` — Reanimated-Pulse, dark-aware, %-/px-Breiten.
- `EmptyState` — Icon-Bubble, optional Action, `compact`-Variante.
- `ErrorState` — Icon, Retry-Button, dark/light-aware Akzentfarben.
- `BottomSheet` — slide-up Modal mit Grabber, Overlay-Tap-to-Dismiss,
  Easing-Animation (`Easing.out(Easing.exp)`), optional `fullScreen`.
- `SegmentedControl` — animierter Pill, springt zwischen Optionen statt zu cross-faden.
- `SectionHeader` — Eyebrow/Title/Description/Trailing, analog zur Web-Variante.

## Iteration 7 — Mobile-Features

**Komponenten**

- `FeedbackPressable` — RN-`Pressable` mit Scale+Opacity-Spring; via `flat`
  Prop deaktivierbar (z.B. innerhalb einer Stagger-Liste).
- `RefreshableScroll` — `ScrollView` mit gebrandetem `RefreshControl`,
  managed `refreshing`-Flag.
- `Chip` — read-only Badge oder selektierbarer Filter-Chip; mit `onRemove`
  als X-Button. Tones neutral/primary/success/warning/accent.
- `ListItem` — Standard-Row mit Leading/Title/Subtitle/Trailing-Chevron,
  optional Divider, `destructive` für Logout-/Delete-Rows.

**Hooks**

- `useDisclosure` — open/close/toggle für Sheets/Modals.
- `useAsync` — Loading/Error/Data mit Stale-Update-Schutz und Reset.
- `useToggle` — stabile Toggle-Funktion.
- `useDebouncedCallback` — debounced Side-Effect mit Cleanup.
- `useKeyboardVisible` — Footer-Buttons über die Tastatur heben.

## Iteration 8 — Flutter-Modernisierung

**Motion + Transitions**

- `AppMotion` (Tokens) — `fast/normal/slow` durations + Curves
  `outQuad/outExpo/spring`. Spiegelt die Web-Easings.
- `AppPageTransitions.theme` — `PageTransitionsTheme`-Factory mit Fade+Slide
  (6px lift), platform-agnostisch.

**Widgets**

- `AppPressable` — Scale + Opacity-Feedback per `AnimatedScale/Opacity`,
  konfigurierbares `scaleTo/opacityTo`, `flat`-Override.
- `AppSegmentedControl<T>` — animierter Pill via `AnimatedPositioned`,
  optional Icon pro Option, dark-aware.
- `AppSectionHeader` — Eyebrow + Title + Description + Trailing,
  konsistente Spacing/Typography.
- `AppListTile` — Standard-Row mit Leading/Trailing/Chevron,
  optional Divider, `destructive` für Logout/Delete.
- `AppBottomSheet.show()` — Wrapper um `showModalBottomSheet` mit Grabber,
  rounded Top-Corners, optionalem Titel + Close-Button.
- `AppGradientMesh` — Hero-Hintergrund mit 3 Radial-Blobs (Primary/Accent/Success),
  dark-aware Opacity-Reduktion.
- `AppChip` — selektierbar oder read-only, mit `onRemove`-X-Button,
  Tones neutral/primary/success/warning/accent.
- `AppAlert` — Inline-Notice mit Auto-Icon pro Variant
  (info/success/warning/error/neutral), optional Title + Action, `compact`.

## Iteration 9 — Shared Resources & Single Source of Truth

**Design-Tokens als JSON**

- `shared/tokens/colors.json` (HEX + OKLCH-Annotation pro Stop),
  `spacing.json`, `radius.json`, `motion.json`, `index.json`.
- Format: Design Token Community Group (`$schema`, `$description`, `value`).

**Generator**

- `scripts/sync-tokens.mjs` (Node 20+, kein Build-Step nötig): liest die JSONs
  und schreibt:
  - `shared/tokens/dist/tokens.ts` (für jedes TS-Projekt verbrauchbar)
  - `mobile/src/lib/generated-tokens.ts`
  - `web/src/lib/generated-tokens.ts`
  - `flutter/lib/app/theme/app_generated_tokens.dart`
- Hand-geschriebene Theme-Files bleiben unverändert — sie ziehen Rohwerte aus
  den Generated-Files; Utility-Klassen, MD3-ColorScheme und dark-mode-Annotationen
  sind kuratiert.

**JSON-Schemas**

- `api-error.schema.json` — Vertrag des Error-Envelopes,
  spiegelt `tn.bewerbi.common.api.ApiError`.
- `user.schema.json`, `job.schema.json`, `auth.schema.json`
  (login/register/refresh/tokenPair).
- JSON-Schema Draft 2020-12; einsetzbar mit `ajv` (TS),
  `quicktype` (Dart) und Spring's Validation in CI.

**Konstanten**

- `locales.json` — code/name/nativeName/direction/flag für `de/fr/ar`.
- `german-levels.json` — CEFR-Levels + Minima pro Berufsgruppe.
- `application-status.json` — Bewerbungs-Lifecycle (DRAFT…WITHDRAWN).

**Docs**

- `shared/README.md` mit Datenfluss-Diagramm, Generator-Usage,
  Schema-Konsumenten-Anleitung.

## Iteration 10 — CI/CD & Repo-Hygiene

**Workflows** (`.github/workflows/`)

- `ci-backend.yml` — JDK 21 (Temurin) + Postgres + Redis als Services,
  Maven `verify`, Surefire-Reports als Artifact, Docker-Smoke-Build der
  Service-Images auf `main`. Paralleler `lint`-Job.
- `ci-web.yml` — Node 22, `npm ci`, sync-tokens, lint, typecheck, build.
- `ci-mobile.yml` — Node 22, `npm ci`, sync-tokens, `tsc --noEmit`.
- `ci-flutter.yml` — Flutter 3.27 stable, `pub get`, analyze, format-check,
  test (expanded reporter).
- `tokens-check.yml` — regeneriert Tokens auf jedem PR und schlägt fehl,
  wenn die generierten Files nicht mit den Source-JSONs übereinstimmen.

Alle Workflows nutzen `concurrency.cancel-in-progress`, `paths`-Filter und
Setup-Action-Caches.

**Repo-Hygiene**

- `.editorconfig` — LF überall, 2 Spaces für JS/TS/CSS/YAML, 4 für Java/Kotlin,
  2 für Dart, Tab für Makefile, CRLF für `.bat/.cmd`.
- `.gitattributes` — `eol=lf`-Normalisierung, Binär-Flags, `linguist-generated`
  für die generierten Token-Files.
- `.github/dependabot.yml` — wöchentliche Updates für npm (web/mobile), Maven,
  GitHub Actions, Docker; Dependency-Groups (next/react/radix/expo/spring/…).
- `.github/CODEOWNERS` — `/backend/shared/common-security/` und `/backend/gateway/`
  Review-pflichtig durch `@bewerbi/security`.
- PR-Template + Issue-Templates (Bug, Feature) als YAML-Forms.

**Setup-/Dev-Scripts**

- `scripts/setup-all.sh` — One-Shot Erstinstallation aller Subprojekte +
  Infra-Start via `docker compose`.
- `scripts/lint-all.sh` — gleiche Checks wie CI, lokal vor Push.
- `scripts/dev.sh` — Gateway + Web + Mobile parallel, CTRL+C stoppt alles.
- `scripts/clean.sh` — sichere Cleanup aller Build-Artefakte und node_modules.

**Docs**

- `docs/CONTRIBUTING.md` — Setup, Dev-Loop, Token-Workflow, Commit-Style,
  ADR-Template.
- `docs/SECURITY.md` — Auth, Authz, Rate-Limits, CORS, Headers, Logging,
  Data-Protection. Schnellreferenz für Onboarding und Audits.

## Iteration 11 — Backend Performance & Observability

**Metrics**

- `HttpRequestMetricsFilter` — `http.request.duration` Timer mit
  app/method/status/outcome-Tags, Percentile-Histogram aktiviert. Coexistiert
  mit Spring Boots `http.server.requests` und bietet niedrigere Kardinalität
  via SUCCESS/CLIENT_ERROR/SERVER_ERROR.

**Slow-Path-Visibility**

- `SlowRequestLogger` — WARN-Line auf `slow.request` Logger, sobald eine
  Request länger als `bewerbi.observability.slowRequestMs` (default 1500ms)
  dauert. Cheap noticeboard für „was war heute langsam".

**Performance-Defaults** (`application-performance.yml`)

- Hikari: pool-size 20, min-idle 5, connection-timeout 5s, idle-timeout 10m,
  max-lifetime 30m, leak-detection 30s, named pool für Metrics.
- JPA: `open-in-view=false`, batch_size 50, ordered inserts/updates,
  plan_cache 4096.
- Virtual Threads für HTTP-/Scheduled-Tasks aktiviert.
- Distribution percentiles 0.5/0.95/0.99 für Hot-Path-Timer.

**Auto-Konfiguration**

- `SlowRequestLogger.Config` + `HttpRequestMetricsFilter.Config` werden
  via `CommonApiAutoConfiguration` automatisch geladen.

## Iteration 12 — Web Accessibility & SEO

**Accessibility**

- `SkipToContent` — erstes fokussierbares Element, springt zu `#main`. WCAG 2.4.1.
- `VisuallyHidden` — `sr-only`-Wrapper für Icon-Buttons / Screenreader-Labels.
- `LiveRegionProvider` + `useAnnounce()` — Polite/Assertive ARIA-Live-Regions
  für State-Changes ("Suche aktualisiert: 12 Treffer") die ohne UI-Announcement
  nicht sichtbar wären.

**SEO**

- `lib/seo.ts` — `SITE` Konstanten und `pageMetadata({...})` Factory:
  Title-Template, Canonical, hreflang-Alternates für de/fr/ar,
  OpenGraph + Twitter-Card, Robots-Direktive, Icons + Manifest-Link.
- `organizationJsonLd()` + `jobPostingJsonLd(job)` — `schema.org`-Strukturdaten.
- `app/sitemap.ts` — statische Section-Map mit changeFrequency/priority.
- `app/robots.ts` — Default-Allow + Disallow für private Bereiche;
  `NEXT_PUBLIC_INDEXABLE=false` schaltet auf vollständigen Disallow für Staging.
- `app/manifest.ts` — PWA-Manifest mit theme_color synchron zum Brand-Primary.

## Iteration 13 — Mobile Forms-Bibliothek

**Form-Shell**

- `Form` + `FormField` — Layout/Label/Hint/Error/Required-Wrapper, optional
  `density="compact"`. Dünne Schicht über react-hook-form: visuelle Chrome
  ohne `useForm` zu ersetzen.

**Eingaben**

- `Switch` — iOS-Style Toggle mit animierter Track-Color via
  `interpolateColor` und Knob-Translate-Spring.
- `Checkbox` — Material-Style mit Scale-Spring beim Check, Sizes `sm | md`,
  optional Label.
- `RadioGroup<T>` — Variants `compact` (inline) und `card` (mit Description
  + Divider), korrekte ARIA-Rolle `radiogroup/radio`.

## Iteration 14 — Flutter Forms & Inputs

**Form-Shell**

- `AppFormField` — Label/Hint/Error/Required-Wrapper analog zur RN-Variante.
  `compact` Prop für dichtere Layouts.

**Eingaben**

- `AppSwitchTile` — Settings-Row mit Title/Subtitle/Leading, tap-anywhere
  toggelt; nutzt `Switch.adaptive` für iOS-Look unter iOS, Material unter Android.
- `AppRadioGroup<T>` — Variants `compact | card`, korrekte
  `Semantics(inMutuallyExclusiveGroup)`.
- `AppPasswordField` — Masking-Toggle (Lucide eye/eyeOff), autocorrect+
  suggestions off, optional 4-Bar Strength-Indicator
  (length + case-mix + digit + symbol).

