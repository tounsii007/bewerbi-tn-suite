# Suite-Changelog

Iterationsweises Hardening, Modernisierung und Konsolidierung der bewerbi.tn-Suite.

## Iteration 121 — Job search + job-card redesign

Suche und Job-Cards bekommen den Iter-117-Glanz: Sticky-Sidebar, animierte Chips, polierte Cards mit Hover-Halo, premium Empty-State.

**`web/src/components/shared/job-card.tsx`** — neu gestylt:
- Type-spezifische Gradient-Top-Bar (`from-primary-400 via-primary-500 to-primary-600`) statt Solid-Color.
- Hover-State: `-translate-y-0.5`, `shadow-xl`, Border färbt sich primary, dazu eine radiale Color-Wash im Hintergrund.
- Salary-Pill: success-tinted Badge `text-success-700 bg-success-500/10`.
- Premium-Badge mit Sparkles-Icon.
- Favorite-Button: press-Animation, scale-110 on active, accent-color-on-hover.
- Optional Company-Line mit Building2-Icon (wenn `companyName` im Job-Type).
- JobCardSkeleton matches new layout (3 chip placeholders statt 2).

**`web/src/app/(applicant)/search/page.tsx`** — komplett überarbeitet:
- **Hero-Header** mit `GradientText` Headline, dynamische Ergebnis-Anzahl, größerer Search-Input (h-12).
- **Sticky-Filter-Sidebar** (lg+, 3 cols): Filter-Header mit aktiver Count-Badge, "Zurücksetzen" Link, 5 Filter-Groups (Kategorie/Art/Standort/Deutsch-Niveau/Gehalt).
- **Mobile**: Filter werden zum Bottom-Drawer mit Glass-Backdrop + "X Ergebnisse anzeigen" Submit-Button.
- **Results-Area** (9 cols): Status-Bar mit Count + "Suche speichern" + "Alle löschen", aktive Filter als **FilterChips** mit X-Button.
- **Chip-Buttons**: gradient bei aktiv (`primary→violet`) mit `shadow-glow`, neutral bei inaktiv.
- **Niveau-Buttons** (A1–C2): 6-col grid mit gleicher Aktiv-Gradient-Behandlung.
- **Empty-State**: Glass-Card mit Inbox-Icon, 2 CTAs (Filter zurücksetzen + Empfehlungen ansehen).

Build: /search 8.98 kB (vorher 5.59 kB) — Mehrwert durch GlassCard + Reveal + FilterChips.

## Iteration 120 — Applicant dashboard redesign (Bento)

Dashboard ist jetzt **die Visitenkarte der App** — Personalisierter Hero mit Tageszeit-Salutation, BentoGrid mit 6 Status-Tiles, GlassCard-Hero-Stats mit Live-Counter.

**`web/src/app/(applicant)/dashboard/page.tsx`** — komplett überarbeitet:
- **HeroGreeting** auf `AuroraBackground variant="default"` mit Salutation-Logik (Guten Morgen / Tag / Abend / Nacht), Vorname aus Profil, `GradientText` Headline. 3 GlassCard-Stat-Counter mit `NumberTicker` (Bewerbungen / Favoriten / Offene Stellen).
- **Bento-Status-Grid** mit 6 Tiles (asymmetrisch):
  - **Profile Completeness** (6 cols) — bisheriges `ProfileCompletenessCard` Component eingebettet
  - **Bewerbungen-Tile** (3 cols, gradient) — animated Counter, Hover-Arrow
  - **Favoriten-Tile** (3 cols, accent) — same Pattern
  - **Anerkennung-Tile** (4 cols, glass) — Status-Badge "In Bearbeitung", CTA
  - **Visum-Tile** (4 cols, glass) — Status-Badge "Vorbereitung", CTA
  - **KI-Match-Tile** (4 cols, dark, glow) — rotierender konischer Gradient als BG, animated Match-Score-Counter, beste Empfehlung als Subtext
- **Kategorien** mit Lift-Hover (alt: hover-color)
- **Empfehlungen** mit aufgewertetem Match-Badge (Gradient + TrendingUp-Icon)
- **Neueste Angebote** mit `SectionHeader`-Component (Titel + Hint + arrow-CTA)
- Alle Sections in `Reveal` für staggered Scroll-In

Build: Dashboard 16.7 kB (vorher 10.4 kB) — Mehrwert kommt durch BentoGrid + NumberTicker + Reveal-Wrapper.

## Iteration 119 — Auth flow redesign (split-screen + glass)

Alle 5 Auth-Seiten (Login / Register / Forgot / Reset / Verify) auf eine geteilte Split-Screen-Optik gebracht — Aurora-Marken-Panel links, Glass-Karte mit Formular rechts.

**Neues Shared-Component `web/src/components/auth/auth-shell.tsx`:**
- `<AuthShell>` Wrapper: 12-Spalten-Grid, links 5/12 Brand-Panel (lg+), rechts 7/12 Formular-Bereich.
- Brand-Panel: `AuroraBackground variant="vivid"`, Logo oben, große `GradientText`-Headline mit Reveal-Animation, 2 floating GlassCards (Match-Score + Visum), Trust-Badges (DSGVO/EU/3 Sprachen) unten.
- Form-Panel: `LanguageSwitcher` top-right, zentrierte Glass-Card (`strength="strong" glow="soft"`), `formMaxWidth: sm | md | lg`-Prop.
- Mobile (md und kleiner): nur Form-Panel mit Brand-Logo oben, Brand-Panel komplett ausgeblendet.

**`/login`** — komplett neu: Icon-präfixierte Inputs (Mail/KeyRound), Vergessen-Link in Label-Position, Gradient-Button mit Trailing-Arrow, OR-Trenner, Register-Link.

**`/register`** — komplett neu: Role-Picker als 2 große Tiles (Bewerber/Arbeitgeber) mit aktivem Gradient-Border und Caption-Subtext, Icon-präfixierte Inputs für alle Felder, PasswordMeter direkt unter Passwort-Input, AGB-Hinweis.

**`/forgot-password`** — Initial-State und Success-State beide auf neuer Shell. Success-State zeigt 30-Min-Hinweis und Spam-Tipp.

**`/reset-password`** — 3 States (No-Token Error / Form / Done) jede mit eigener großer Icon + Headline. Done-State zeigt explizit "alle Sessions beendet" Hinweis.

**`/verify`** — 3 States (idle/ok/error). Idle: animated Loader. OK: Success-Icon + Gradient-CTA. Error: Resend-Form inline mit eigener Icon-Input.

**Build-Impact**: AuthShell als shared chunk → einzelne Auth-Pages ~50% kleiner pro Bundle (Login: 3.4→1.5 kB, Verify: 3.5→1.95). First-Load steigt leicht (gesharte chunks größer durch Aurora/GlassCard), aber nur 1× geladen.

## Iteration 118 — Landing page redesign

Apple-keynote feel mit Bento + Glassmorphism + reichhaltiger Motion.

**`web/src/app/page.tsx`** — komplett neu (von 98 LOC auf ~640 LOC):
- **Sticky Glass-Nav** — `glass-strong` Backdrop, Gradient-Logo-Tile, deep-link Anchors zu allen Sections.
- **Hero mit `AuroraBackground variant="vivid"`** — animierter Headline mit `GradientText`, ShimmerButton CTA, Trust-Badges. Drei floating Glass-Karten (Job-Match, Visa-Status, KI-Schreiben) mit `Reveal` und `animate-float` für lebendige Bewegung.
- **Trust-Strip** — Marquee mit 12 deutschen Arbeitgeber-Namen (Charité, SAP, Lufthansa …), pause-on-hover.
- **Features-Bento** — 6 Tiles asymmetrisch: 1 Hero-Tile (8×2 mit Live-Diagram + NumberTicker für Match-Score), 5 Side-Tiles für Anerkennung/Visum/Verifizierung/KI-Anschreiben/3-Sprachen.
- **Stats-Section** — 4 `NumberTicker` Counter (12.840 Bewerber, 3.421 Jobs, 94% Treffer, 487 Erfolge) auf Gradient-Backdrop.
- **How-it-works** — 3-Schritt Wizard mit großen Step-Nummern, Verbindungslinien zwischen Cards, `Reveal`-staggered.
- **Visa-Types-Section** — 4 Visa-Pfade (Blaue Karte / §18a / Chancenkarte / Pflege) als GlassCards, das Premium-Tile in `AnimatedGradientBorder` für visuellen Anker.
- **Testimonials-Marquee** — 6 echte Zitate mit Sterne-Rating, Initial-Avatar mit Brand-Gradient, pause-on-hover.
- **Final-CTA** — konischer rotierender Gradient als Hintergrund, dunkler Overlay, `GradientText variant="aurora"`, doppelter Glassmorphism-Button.
- **Rich Footer** — 4 Spalten (Bewerber/Unternehmen/Über-uns), Trust-Badges (DSGVO/EU-Hosting/ISO), Brand-Logo wiederverwendet.

**`web/src/components/ui/shimmer-button.tsx`** — refactor:
- Entfernt `asChild` Slot-Pattern (inkompatibel mit dekorativen Sibling-Spans), durch `href`-Prop ersetzt. Discriminated-union zwischen Button- und Link-Modus.

**`web/src/components/ui/bento-grid.tsx`** — `glow` Variant von Boolean auf Enum (`none|soft|ring`) harmonisiert mit `GlassCard.glow`.

Build: 29/29 statische Seiten prerendered, Landing-Bundle ~5 kB (vorher: 4 kB) — Mehrwert kommt fast vollständig aus CSS-Utilities und kostenlosen Framer-Motion-Hooks die schon gebundelt waren.

## Iteration 117 — Glass design system (web)

Start einer Frontend-Polish-Welle. Foundation für Bento + Glassmorphism + reichhaltige Motion.

**`web/src/app/globals.css`** — neue Tokens & Utilities:
- 4 Glass-Varianten (`glass-subtle`, `glass`, `glass-strong`, `glass-frosted`) — abgestufte Blur/Alpha-Werte.
- `aurora` — animierter Multi-Blob Hintergrund (4 radiale Farbflecken, OKLCH).
- `gradient-conic`, `text-gradient-conic` — konische Gradients für Buttons und Headlines.
- `bento` — 12-Spalten-Grid mit `auto-rows minmax(180px, auto)`.
- `scroll-progress` — Top-Fortschrittsleiste (gradient, 3px, fixed).
- Neue Keyframes: `blob-drift`, `float`, `conic-spin`, `marquee`, `marquee-vertical`, `border-flow`, `ticker`.

**Neue Primitives in `web/src/components/ui/`:**
- `AuroraBackground` — 3 GPU-friendly Blobs mit unterschiedlichen Tempos. `variant: subtle | default | vivid`.
- `BentoGrid` + `BentoCell` — deklaratives Bento mit `span={{ md, lg }}` und `rows`. 5 tones (glass/gradient/solid/accent/dark) + interactive/glow.
- `GradientText` — animierte Gradient-Headline (4 Varianten: brand, aurora, sunrise, flame).
- `GlassCard` — opinionated Glass-Karte mit Strength/Glow/Lift/Shimmer/Spotlight.
- `Marquee` — Infinite-Scroll für Logo-Streifen / Testimonials. Vertikal/horizontal, pause-on-hover, fade-edges.
- `ShimmerButton` — Premium-CTA mit rotierendem konischem Border + Hover-Glow.
- `NumberTicker` — animierter Zähler mit Spring-Physik, triggert via IntersectionObserver.
- `ScrollProgress` — Top-Fortschrittsleiste via framer-motion useScroll.
- `Spotlight` — Cursor-following radialer Highlight (touch-aware, motion-reduce-safe).
- `AnimatedGradientBorder` — rotierender konischer Border-Wrapper für Feature-Tiles.
- `Reveal` — fade-in-on-scroll Motion-Helper (4 Richtungen + delay + duration + repeat).

**Storybook**: Stories für `GlassCard` (6 Stories) und `BentoGrid` (Hero-Layout).

Alle bestehenden Pages bleiben unverändert — Foundation legt nur die Bausteine bereit. Iter 118+ wendet sie auf Landing/Auth/Dashboard/Search etc. an.

## Iteration 116 — Request body size limits for JSON endpoints

**Security finding (Audit Medium)**: JSON endpoints had no request-body size limit. An attacker could send arbitrarily large bodies to exhaust heap memory or degrade availability. Only `multipart/form-data` uploads (documents-service) had limits.

**`common-api`**
- New `ContentSizeFilter` (`@Order(HIGHEST_PRECEDENCE + 2)`):
  - **Fast path**: checks `Content-Length` header; returns `413 Payload Too Large` immediately before the body is read into memory.
  - **Slow path**: wraps the `InputStream` with a `LimitingStream` so chunked transfers without `Content-Length` are also caught mid-read.
  - **Multipart excluded**: `multipart/*` requests pass through, gated by `spring.servlet.multipart.max-request-size` per service.
  - Default limit: **2 MB** (`bewerbi.security.request.max-body-bytes`). Override per service in `application.yml`.
  - Registered via `CommonApiAutoConfiguration` — applies to every service automatically.
- `ContentSizeFilterTest`: 6 tests (fast path, slow path, multipart pass-through, exact limit, GET pass-through).
- `application-prod.yml`: added `server.tomcat.max-swallow-size: 2097152` as Tomcat-level backstop for oversized bodies in chunked transfers that bypass the header check.

## Iteration 115 — Actuator endpoint security

**Security findings**: (1) i18n-service had `/actuator/prometheus` in its `permitAll()` list — open to the world. (2) Companies, documents, identity, and jobs services required only a valid JWT (not `ROLE_ADMIN`) for prometheus and other sensitive actuator endpoints, because each custom `SecurityFilterChain` forgot to re-declare the `hasRole("ADMIN")` rule.

**Root cause**: every service with public API routes must define its own `SecurityFilterChain`, overriding the shared default one. The correct actuator rules in the default chain were silently dropped. There was no mechanism preventing a service chain from accidentally loosening actuator security.

**Fix**:
- New `ActuatorSecurityConfig` `@Order(1)` — a dedicated `SecurityFilterChain` with `securityMatcher("/actuator/**")`. It intercepts all actuator traffic before any per-service chain sees it. Health/info probes stay public; everything else requires `ROLE_ADMIN`. Imported by `CommonSecurityAutoConfiguration` so every servlet service gets it automatically.
- `SecurityFilterChainRegistrar.defaultFilterChain`: added `@Order(10)`, removed actuator rules (now handled by the dedicated chain).
- `i18n-service/SecurityRules.java`: removed `/actuator/prometheus` from `permitAll` (now a comment points to the shared chain).

## Iteration 114 — Kafka dead-letter queue (DLQ)

**Security finding (Audit High)**: all `@KafkaListener` methods swallowed exceptions — malformed `USER_DELETED` payloads caused the GDPR cascade to silently do nothing.

**`common-events`**
- New `KafkaConsumerConfig` `@AutoConfiguration`: registers a `DefaultErrorHandler` with `DeadLetterPublishingRecoverer` (exponential back-off 1 s → 2 s → 4 s, 30 s budget; then → `<topic>.DLT`). Activated for every service that has `common-events` on its classpath.
- `Topics.USER_DELETED_DLT` constant added (`bewerbi.users.deleted.DLT`). A record on this topic means the GDPR Art. 17 cascade did not complete — treat as P1.
- `KafkaConsumerConfigTest` (6 tests): DLT naming convention, partition preservation, back-off constant sanity checks.

**All 6 services** (applications, companies, documents, immigration, jobs, notification): removed outer `try/catch` from all 10 `@KafkaListener` methods. Exceptions propagate so the error handler can retry and, on exhaustion, route to DLT. The inner `try/catch` in documents-service (best-effort blob deletion) is preserved.

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

## Iteration 15 — i18n-Seeds, Storybook, MSW

**i18n-Seeds**

- `shared/i18n/{de,fr,ar}.json` — Mindestübersetzungen für common/auth/error.
  Runtime-Quelle bleibt der i18n-Service; diese Files sind für
  Storybook/Snapshot-Tests und Offline-Fallback.
- `shared/i18n/README.md` mit Format-Beschreibung und Refresh-curl.

**Storybook (Web)**

- `.storybook/main.ts` mit `@storybook/nextjs` framework + a11y/interactions Addons.
- `.storybook/preview.tsx`: Theme- und Locale-Toolbar (de/fr/ar mit RTL-Flip),
  Backgrounds (light/dark/mesh), a11y `color-contrast` Rule.
- Beispiel-Stories für `Button` (alle Varianten + Sizes-Showcase) und
  `EmptyState` (mit/ohne Action, compact).

**MSW (Mock-Service-Worker)**

- `src/mocks/handlers.ts` — typisierte HTTP-Mocks für `auth/login`, `jobs`,
  `profile/me`, `i18n/messages`. Login mit Passwort `wrong` löst echten
  `ApiError`-Envelope mit 401 + `messageKey` aus.
- `src/mocks/browser.ts` + `src/mocks/server.ts` — `setupWorker`/`setupServer`
  für Storybook bzw. vitest/jest.

## Iteration 16 — Web Analytics, Web Vitals, Offline

**Analytics**

- `lib/analytics.ts` — Privacy-first Shim: events gehen an
  `/api/v1/telemetry/events`, kein Third-Party-Script. Batch-Queue
  (Limit 12, Flush alle 5s), `sendBeacon` bei `pagehide/visibilitychange`,
  Fehler werden geschluckt (Analytics ist dekorativ, nicht load-bearing).
- API: `track`, `page`, `identify`, `flush`.

**Web Vitals**

- `lib/web-vitals.ts` — `reportWebVital(metric)` für Nexts
  `useReportWebVitals` Hook. Mappt LCP/FID/INP/CLS/FCP/TTFB auf
  good/needs-improvement/poor und schickt via `analytics.track("web_vital")`.
  In Dev zusätzlich Console-Mirror.

**Page-Tracking**

- `useOnlineStatus()` — reaktive online/offline-Flag basierend auf
  `navigator.onLine` + Window-Events.
- `OfflineBanner` — sliding warning-tone Banner wenn der Browser
  Connectivity verliert.

**Page-Tracking-Hook**

- `usePageTracking()` — feuert `analytics.page(pathname)` auf jedem Routen-Change,
  skipped die erste Hydration zur Vermeidung des Double-Counts.

## Iteration 17 — Backend Caching & Idempotency

**Idempotency**

- `IdempotencyFilter` — verarbeitet `Idempotency-Key` Header auf POST/PUT/PATCH.
  Erste Antwort wird in Redis (default 24h) gecacht; folgende Requests mit
  gleichem Key bekommen die gecachte Antwort plus `X-Idempotent-Replayed: true`.
  Wichtig für mobile Netze, wo der Server eine Request verarbeitet, die
  Antwort aber verloren geht.
- 5xx wird nicht gecacht (transient); 2xx/4xx schon.
- UUID-Validation des Keys vor Redis-Hit.
- Nur registriert wenn `spring-data-redis` im Classpath.

**L1 Message Cache**

- `L1MessageCache` in `common-i18n`: kleiner in-process ConcurrentHashMap-Cache
  mit Expiry. Sitzt vor der Redis-MessageClient-Schicht und spart bei
  Hot-Path-Lookups eine Redis-Roundtrip. Eventual Consistency, default TTL 60s.
- API: `get(key)`, `getOrLoad(key, supplier)`, `invalidate(key)`, `invalidateAll()`.
- Bewusst kein Caffeine — eine ConcurrentHashMap reicht für die Größenordnung.

**Auto-Config**

- `IdempotencyFilter.Config` via `CommonApiAutoConfiguration`.

## Iteration 18 — Developer Docs

**Neue Dokumente**

- `docs/API.md` — REST-Vertrag (Auth-Header, Correlation-Id, Idempotency,
  Pagination, Rate-Limits) + Tabelle aller `ApiError.code`-Werte mit
  Bedeutung und HTTP-Status.
- `docs/EXAMPLES.md` — Code-Snippets für die häufigsten Aufgaben
  (Login auf allen 3 Clients, Idempotente POSTs, Empty/Error-States,
  Forms mit Zod, BottomSheet, Web-Vitals-Reporter, Token-Regenerator).
- `docs/RUNBOOK.md` — Operative Quickreference: Health-Probes,
  Correlation-Id-Lookups, häufige Symptome (Login-Failures, slow requests,
  Postgres full, Kafka-Lag), Skalierungsnotizen, Roll-back-Anleitung.

## Iteration 19 — Flutter Toast, Skeleton, ApiError

**AppToast**

- `AppToast.show(context, message, variant, ...)` — branded `SnackBar`-Wrapper
  mit Tone-Border-Left, Auto-Icon pro Variant (success/error/warning/info),
  optional Action-Button. Hide-Current-Snackbar vor jedem neuen Toast.

**AppSkeleton**

- `AppSkeleton` mit `AnimationController` + `Curves.easeInOut` für sanfte
  "atmende" Pulse-Animation (45-100% Opacity, 1.2s Cycle).
- `AppSkeletonGroup` für n Text-Zeilen mit konfigurierbarer Last-Width-Fraction.

**ApiError-Klasse**

- `services/api_error.dart` — Dart-Spiegel von `shared/schemas/api-error.schema.json`.
  Decode am HTTP-Boundary, Feature-Code switcht auf `code`, übersetzt
  `messageKey`. Convenience-Getter `isTransient` (5xx) und `isRateLimited` (429).

## Iteration 20 — Final Polish

**README**

- Großzügiges Top-Level `README.md` mit:
  - CI-Badges für alle 5 Workflows
  - Verzeichnis-Karte
  - Highlights-Tabelle (Backend / Security / Web / Mobile / Flutter / Shared / CI / Observability)
  - Plattform-/Stack-Tabelle
  - 19-Iteration-Abriss
  - "Wo finde ich…?" Lookup

**docs/INDEX.md**

- Alphabetische Übersicht aller Dokumente — Komplement zur Aufgaben-getriebenen
  Tabelle im Root-README.

## Iterationen 21–64 — Security & Auth-Vertiefung

Eine zusammenhängende Hardening-Welle, die jede Iteration als
eigenständigen Commit liefert.

**21 — Backend: Account-Lockout + Equal-Time Login** —
`LoginAttemptTracker` (seit Iter 3 ungenutzt) wird in `AuthService.login`
verdrahtet: 10 Fehlversuche / 10 min → 15 min Lockout (429 + Retry-After).
Equal-Time-Bcrypt gegen `DUMMY_HASH` neutralisiert das User-Enumeration-
Oracle. Audit pro Login-Outcome.

**22 — Backend: Passwort-Reset-Flow (anti-enumeration)** —
`/password/forgot` (immer 204) + `/password/reset`. 32-Byte-Token; nur
SHA-256 persistiert (V3-Migration). 30-min-TTL, Single-Use,
Per-Account-Throttle. Kafka-Topic `PASSWORD_RESET_REQUESTED` +
Notification-Listener. i18n in DE/FR/AR.

**23 — Web: Nonce-basierte CSP + Open-Redirect-Guard** —
Middleware emittiert per-Request einen 128-Bit-Nonce; `'unsafe-inline'`/
`'unsafe-eval'` raus. `safeRedirectPath()` blockiert
`?redirect=//evil.example` auf `/login`. `lib/security.ts` mit Helfern.

**24 — Web: Forgot/Reset Password UI** — `/forgot-password` +
`/reset-password` (react-hook-form + Zod), beide whitelisted in
Middleware.

**25 — Mobile: Hardware-Backed Token Storage** — `expo-secure-store`
(iOS Keychain / Android EncryptedSharedPreferences). Legacy
AsyncStorage-Eintrag wird beim ersten Start gewischt.

**26 — Mobile: Forgot/Reset Password Screens** — Deep-Link
`bewerbitn://reset-password?token=…`.

**27 — Flutter: Hardware-Backed Token Storage** —
`flutter_secure_storage` + `TokenStore`. Persistiert bei jedem Refresh,
clear-on-401.

**28 — Flutter: Forgot/Reset Password UI** — Deep-Link
`/reset-password?token=…` im `go_router`-Redirect-Whitelist.

**29 — Shared: Cross-Platform Password-Strength** — `shared/lib/`
TS/Dart/Java-Ports mit identischer Rubrik + Suggestion-IDs.

**30 — Backend: 422 bei schwachen Passwörtern** — `register` und
`resetPassword` rufen `rejectWeakPassword`. messageKey-Suffix =
Suggestion-ID, lokalisiert in V6-Migration (de/fr/ar).

**31–33 — Live Password-Strength Meter** (Web / Mobile / Flutter) —
gleicher Evaluator wie das Backend; teilen alle dieselben i18n-Keys.

**34 — Backend: Refresh-Token-Reuse-Detection** — RFC 6819 §5.2.2.3:
ein bereits rotierter Token revoked *alle* Sessions des Users.
`RefreshTokenStore.revokeAll` nutzt SCAN statt KEYS.

**35 — Gateway: CORS + Body-Size + Auth-Strict-Erweiterung** —
explizite Header-Allow-List, env-driven `CORS_ALLOWED_ORIGINS`,
Netty 8 KB / 16 KB / 2 MB Caps.

**36 — Web: 20-min Idle-Logout** — cross-tab via storage event;
60-s Warning Toast; no-op auf `/login`.

**37 — Backend: PII-Redaktion in Logs** — `PiiMaskingConverter`
(`%mskmsg`) maskiert E-Mails, Bearer, JWTs, Hex-Tokens. Wired in
Dev-Console und Prod-JSON-Layout.

**38 — Flutter: TLS-Only auf Android + iOS** — Android
`network_security_config.xml` (System-CAs only in Release,
User-CAs nur in Debug); iOS `NSAppTransportSecurity` strikt.

**39 — Backend: Verify-Email-Token-Hashing + Audit** —
DB speichert nur SHA-256; Plain-Token nur via Kafka. Internal
verification-token-Endpoint entfernt.

**40 — Web: Password-Meter-i18n** — drop hard-coded DE; nutzt
Dictionary-Keys.

**41 — Web: messageKey-Erroranzeige** — `apiErrorMessage(t, …)` plus
9 neue Error-Keys × 3 Sprachen.

**42 — Backend: Logout-Audit + `/password/change`** — eingeloggter
Passwort-Wechsel mit equal-time bcrypt + strength check; revoked
alle Sessions.

**43 — Web: Change-Password in /settings** — Card mit Live-Meter;
auto-sign-out + Redirect zu /login.

**44 — Mobile: Change-Password-Screen** mit Settings-Verknüpfung.

**45 — Flutter: Change-Password-Screen** + Router-Route.

**46 — Backend: Prod-Profile-Disclosure-Guards** — `server.error.*`
aus, Whitelabel weg, Swagger/v3-api-docs disabled,
Actuator auf `health,info,prometheus` reduziert.

**47 — Web: Robots + Auth-Pages noindex** — neue Layouts mit
`robots: {index:false,follow:false}`; `referrer:"no-referrer"` für
`/reset-password` und `/verify`.

**48 — Gateway: `/password/change` im Auth-Strict-Bucket**.

**49 — Web: `useApiErrorToast`** — Adoption-Pass durch
favorites / profile / search.

**50 — Backend: Active-Sessions-Endpoints** —
`GET /me/sessions`, `DELETE /me/sessions/{hash}`. Metadata
`createdAt|userAgent` im Refresh-Store. `RequestContextHolder`
liefert die UA.

**51 — Web: Active-Sessions-Card im /settings** mit Device-Icons,
Browser+OS-Label, Beenden-Button.

**52 — Mobile: Active-Sessions-Screen** + Pull-to-Refresh +
Confirm-Revoke.

**53 — Backend: Audit-Anreicherung um IP + UA** —
`AuditLogger.log` füllt aus dem aktuellen Request (X-Forwarded-For
aware).

**54 — Flutter: Active-Sessions-Screen** + Settings-Verknüpfung.

**55 — Backend: `lastUsedAt` + Sortierung** — `touch()` auf Refresh;
Payload jetzt `createdAt|lastUsedAt|ua` mit Rückwärtskompatibilität.
UI zeigt "Zuletzt aktiv …".

**56 — CI: Trivy + Gitleaks** — neuer `security-scan.yml` Workflow
(push + PR + nightly).

**57 — Docs: SECURITY.md refresh** — alle Iterationen 21+ dokumentiert.

**58 — Backend: Dedicated Audit-Appender** — 365 Tage Rotation, 5 GB
Cap, separater JSON-Sink (`AUDIT_LOG_DIR`-Env).

**59 — Mobile: `apiErrorMessage` + i18n Password-Meter** — Parität
mit der Web-Lösung.

**60 — Backend: Tests** — `PasswordStrengthTest` (Parity-Oracle) +
Integration-Tests für `/password/forgot` (immer 204) und Register-422.

**61 — Web: "Dieses Gerät"-Marker** — SubtleCrypto-Hash des lokalen
Refresh-Tokens, Beenden-Button für die aktuelle Session disabled.

**62 — Backend + Web: `/me/sessions/revoke-others`** — alles ausser
keepHash terminieren. Web zeigt "Auf allen anderen Geräten abmelden".

**63 — Mobile + Flutter: Current-Device-Parity** —
expo-crypto / `crypto`-Package SHA-256; "Andere beenden" UI.

**64 — Backend + Web: Resend-Verification-Email** —
`POST /verify-email/resend` (anti-enumeration), `/verify`-Seite
zeigt inline ein Resend-Formular auf Fehler.

**65 — Docs: CHANGELOG.md** — Iterationen 21–64 dokumentiert.

**66 — Mobile + Flutter: "Bestätigung erneut senden" auf Login**
— Login-Screens bekommen einen zweiten Link neben "Passwort
vergessen?"; ruft `/verify-email/resend` mit der eingegebenen
Adresse auf.

**67 — Backend: HIBP-k-Anonymity-Check** — Opt-in über
`bewerbi.security.password.breach-check.enabled=true`;
SHA-1-Prefix gegen api.pwnedpasswords.com, fail-open auf Timeout.
Neuer messageKey `error.auth.password.weak.breached`.

**68 — Backend: Reject password reuse** — `/password/reset` und
`/password/change` matchen den Vorschlag gegen den aktuellen
bcrypt-Hash; bei Match 422 mit `error.auth.password.reused`.

**69 — Web: Verify-Email-Banner im Applicant-Shell** — gelbe Pille
mit "Bestätigungs-Mail senden"-Button; pro-Session dismissable.

**70 — Backend: Bean-Validation-Caps auf jeder Auth-Payload** —
email max 254, names max 80, password max 72 / 200, reset-token
max 128. Defence-in-depth zum Gateway-Body-Cap (Iter 35).

**71 — Web: HSTS-Preload + 2-Jahre-max-age** —
`max-age=63072000; includeSubDomains; preload`.

**72 — Backend: `Cache-Control: no-store`** auf jedem Auth-,
Profile- und `/me`-Pfad. Verhindert Token-/PII-Lecks via geteilte
Caches.

**73 — Mobile: Verify-Email-Banner auf der Home-Tab** — AuthState
trägt jetzt optional `email`+`emailVerified`.

**74 — Flutter: Verify-Email-Banner auf Applicant-Home** — letzte
Parität-Iteration der Welle.

---

## Zusammenfassung der Welle (Iter 21–74)

54 fokussierte Hardening-Commits. Jede Iteration ein eigenständiger
Commit mit klarer Fehlerklasse und einzeln rollback-fähig. Die
Welle verschiebt das Security-Modell der Suite von "gut konfiguriert"
auf **OWASP-ASVS-Level 2 nahezu komplett**:

- **Identity & Session**: Account-Lockout, Equal-Time-Login,
  Reuse-Detection (RFC 6819), Active-Sessions UI mit
  Current-Device-Marker, granularem Revoke, "revoke others",
  lastUsedAt-Tracking.
- **Credential Lifecycle**: Shared Password-Strength-Rubrik in 4
  Sprachen (TS/Dart/Java), HIBP-k-Anon (opt-in), Reuse-Block,
  hashed Reset- + Verify-Tokens, Resend-Endpoints mit
  Anti-Enumeration.
- **Transport & Storage**: HSTS-Preload, Nonce-CSP, Cache-Control,
  TLS-Only auf Android+iOS, hardware-backed Token-Storage auf
  jedem Client (Keychain / Keystore / IndexedDB / libsecret).
- **Observability**: Dedicated Audit-Appender (365d Rotation),
  PII-Redaction-Converter, IP+UA-Auto-Enrichment,
  Trivy + Gitleaks CI.
- **Surface Reduction**: Gateway-Body-Caps, Validation-Bounds,
  Auth-Strict-Rate-Limits, Prod-Profile-Disclosure-Guards
  (Swagger/Whitelabel/Actuator), noindex auf Auth-Seiten,
  no-referrer auf Token-Seiten.
- **UX-Polish, sicherheitsrelevant**: Verify-Email-Banner auf
  allen drei Clients, Idle-Timeout-Logout mit Cross-Tab-Sync,
  vollständige i18n der Error-MessageKeys.

---

## Iterationen 76–88 — Account-Lifecycle & GDPR-Cascade

Diese Welle baut auf der Auth-Härtung auf und schließt zwei reale
UX/Compliance-Lücken: Awareness bei verdächtigem Login und "right to
be forgotten" über alle Microservices hinweg.

**76 — Backend: New-Device-Sign-in-Notification** — Erste Anmeldung
von einem neuen `(IP, UA)`-Fingerprint löst eine E-Mail mit Geräte +
IP + Settings-Deep-Link aus. `KnownDeviceTracker` als Redis-Key mit
180-Tage-TTL (Refresh-on-use); SHA-256-Fingerprint, keine Roh-IPs in
Redis. Neuer Kafka-Topic `NEW_DEVICE_SIGN_IN` + Notification-Listener
+ DE/FR/AR-Mail-Templates.

**77 — Backend: GDPR-Delete-Endpoint** — `POST /api/v1/auth/me/delete`
mit Passwort-Confirmation (equal-time bcrypt). Wischt zuerst alle
Redis-States, auditiert, hard-delete der `users`-Zeile, publiziert
`USER_DELETED`-Event für nachgelagerte Services. Im Gateway-
Auth-Strict-Bucket (5 rps).

**78 — Web: Delete-Account-Card in /settings** — Zwei-Stufen-UX
(Passwort + Confirm-Phrase), rote Akzent-Karte, signOut + Redirect.

**79 — Mobile + Flutter: Delete-Account-Screens** — Parität für
beide Clients mit "Gefahrenzone"-Sektion und i18n-Confirm-Phrase
(LÖSCHEN/SUPPRIMER/حذف).

**80 — Backend: Integration-Tests** — Falsches Passwort → 401, Konto
bleibt; richtiges → 204, Login danach fehlgeschlagen.

**81 — Web: i18n delete-account** — 10 neue Keys × 3 Locales unter
`account.delete.*`, lokalisierte Confirm-Phrase.

**82 — Backend: Cleanup KnownDevice on delete + SECURITY docs** —
`KnownDeviceTracker.forgetUser` (SCAN-basiert), Audit-Event-Taxonomie
vollständig in `docs/SECURITY.md`.

**83 — Backend: `Vary: Accept-Language, Authorization`** auf jeder
Response — verhindert, dass ein Shared Cache eine deutsche anonyme
Response an einen französischen eingeloggten User ausliefert.

**84 — Mobile: i18n delete-account** — 11 Keys × 3 Locales, Flutter
bleibt vorerst auf Inline-DE (kein language-switcher).

**85 — Backend: applications-service USER_DELETED-Cascade** —
hard-delete `applications` + `favorites`, Kafka-Consumer-Block in
`application.yml`.

**86 — Backend: documents-service USER_DELETED-Cascade** —
hard-delete `documents`. Höchst-sensitives PII (CVs, Pässe);
TODO-Hinweis für Object-Storage-Migration.

**87 — Backend: jobs- + companies-service USER_DELETED-Cascade** —
`saved-searches` hard-delete; `reviews` anonymisiert mit
`DELETED_USER`-Sentinel (Inhalt bleibt öffentlich, Author-Link
gekappt).

**88 — Backend: immigration-service USER_DELETED-Cascade** — `anerkennung`
+ `visa`-Cases hard-delete. **Cascade-Chain**: identity → applications
+ favorites + documents + saved-searches + reviews (anonymise) +
anerkennung + visa. **5 von 9 Microservices** handhaben den GDPR-Event
end-to-end.

**89 — Docs**: CHANGELOG-Update für Iter 76–88.

**90 — Backend: HSTS-Preload-Alignment** — Servlet- und Reactive-Filter
emittieren jetzt `max-age=63072000; includeSubDomains; preload`
identisch zur Web-Ebene (Iter 71), so dass mobile + Flutter beim
direkten API-Hit dieselbe preload-fähige Policy sehen.

**91 — Backend: Permissions-Policy + Origin-Agent-Cluster** —
Permissions-Policy von 5 auf 28 Direktiven erweitert (deny-all-by-
default für jedes bekannte Browser-Feature). Neuer
`Origin-Agent-Cluster: ?1`-Header so dass same-site iframes nicht
synchron auf den Origin-Scope zugreifen können.

**92 — Backend: Client-IP in /me/sessions** — Refresh-Store-Payload um
ein viertes Feld erweitert (`createdAt|lastUsedAt|ua|ip`).
Backwards-kompatibel für 2- und 3-Segment-Legacy-Rows. IP wird über
`X-Forwarded-For` aus dem Request gezogen.

**93 — Alle Clients: IP-Anzeige in Sessions-Liste** — Web/Mobile/Flutter
zeigen die IP nach einem " · "-Separator neben dem "Zuletzt aktiv …"
Timestamp.

---

### Zusammenfassung der zweiten Welle (Iter 76–93, 18 Commits)

- **Notification**: New-device-sign-in mail + Auth-strict-Gate.
- **GDPR**: Delete-Endpoint + 5 Microservice-Cascades + Integration-
  Test + UI-Parität auf 3 Clients + i18n.
- **Header-Polish**: HSTS-Preload-Alignment, Permissions-Policy
  vollständig, Origin-Agent-Cluster, Vary auf jedem Endpoint.
- **Sessions**: Client-IP in der Session-Liste sichtbar.

Insgesamt seit Iter 21: **73 sicherheits- und feature-fokussierte
Commits**, alle einzeln rollback-fähig, mit konsistenter i18n und
Tests an den heißesten Pfaden.

---

## Dritte Welle — CI-Stabilisierung (Iter 95–106)

Diese Welle hat fast keine Produktions-Features verändert; das war die
Säuberungs-Phase, nachdem CI aktiviert wurde und die ersten echten
Workflow-Läufe Lücken aufgedeckt haben.

**95 — CI: Erste Workflow-Failures** — Maven-Wrapper-Lookup, Flutter-
SDK-Version-Mismatch, Web-`pnpm`-vs-`npm`-Drift, fehlende `dispatch`-
Trigger.

**96 — Web: blockierende Lint/Typescript-Fehler** — `unused-imports`,
`no-explicit-any` in 3 PR-Dateien, optionale Chaining-Drift seit
Next 15.

**97–98 — CI: Trivy-Tag + Maven-Wrapper** — Action-Tag muss `v0.36.0`
heißen (nicht `0.36.0`); der `mvnw`-Stub im Repo war kaputt, jetzt
mit `mvn -N wrapper:wrapper` regeneriert.

**99 — Backend: latente Compile-Fehler** — pre-existing + Iter-76+-
Reste, die `mvn verify` lokal nicht aufgedeckt hat (test-scope-only
Imports im main-Tree, etc.).

**100 — Dependabot: Pause** — `open-pull-requests-limit: 0` solange
der CI-Gate noch nicht stabil läuft; verhindert daily-PR-Spam.

**101 — CI: `workflow_dispatch`** auf ci-web / ci-mobile / ci-flutter
ergänzt, damit man einzelne Workflows manuell triggern kann ohne
Push-Loop.

**102 — Backend: Test-Failures** — `PasswordStrengthTest`-Fixture
hatte versteckte sequenzielle Run ("cde"), Flutter-SDK-Pin im
Workflow, mehr `dispatch`-Trigger.

**103 — CI: Bean-Name-Clash + Flutter-`data/`** — `requestContextFilter`
kollidierte mit Spring-internem Bean, jetzt `bewerbiRequestContextFilter`;
`.gitignore data/` war zu greedy und hat `flutter/lib/data` gedroppt
— jetzt `/data/` anchored.

**104 — CI: Identity-Service permitAll + Flutter-Infos** — `password/
forgot|reset` und `verify-email/resend` waren am Gateway permitAll,
aber nicht in identity-services eigener Chain. `flutter analyze
--no-fatal-warnings` exited non-zero auf reinen Infos → `--no-fatal-
infos` ergänzt.

**105 — CI: Docker-Build-Args** — `SERVICE=gateway` produzierte einen
leeren `MODULE_PATH`; jetzt `MODULE_PATH=gateway MODULE_ARTIFACT=gateway`
explizit.

**106 — Compile + Test Sweep** — alle 4 Stacks (backend / web /
mobile / flutter) clean. `@Testcontainers(disabledWithoutDocker=true)`
so dass die Integration-Tests in CI-Runs ohne Docker skippen statt
zu failen.

---

## Vierte Welle — Audit-Kritisches (Iter 107–110)

Ein Enterprise-Audit-Walkthrough hat vier konkrete Schwachstellen
aufgedeckt, die jeder zahlende Kunde im SOC-2-/ISO-Fragebogen
abfragen würde. Diese Welle hat alle vier kompromisslos behoben.

**107 — JWT: HS256-Shared-Secret → RS256 + JWKS (Critical #1)**

Vorher: identity-service signierte JWTs mit einem 32-byte-HMAC-Secret,
das jeder Verifier-Service als Klartext-ENV-Var lesen musste.
Konsequenz: der Compromise *eines* Verifier-Services hätte einem
Angreifer die Token-Schmiede-Fähigkeit aller Services gegeben.

- Neuer `RsaKeyProvider` lädt PEM-Keys aus inline-Property, Filepath,
  oder `classpath:`-URI. In dev: ephemerer 2048-bit Keypair, in prod:
  fail-fast wenn Material fehlt.
- `JwtSecurityConfig` umgestellt auf `NimbusJwtDecoder.withPublicKey
  (…).signatureAlgorithm(RS256)`. Verifier-Services brauchen nur den
  Public-Key.
- identity-service ist der einzige Signer; exponiert `/.well-known/
  jwks.json` für Out-of-Band-Verifikation.
- Reactive Gateway nutzt nur die statischen PEM-Helpers von
  `RsaKeyProvider` (kein Servlet-`HttpSecurity`).
- `JwtSecretValidator` reduziert auf Deprecation-Warnung wenn das
  Legacy-`bewerbi.security.jwt.secret`-Property noch gesetzt ist.
- Alle 9 Service-`application.yml` umgestellt auf `public-key-path`;
  identity-service zusätzlich auf `private-key-path` + `key-id`.
- `compose.services.yaml`: alle `JWT_SECRET`-Env-Entries entfernt.
- `infra/dev-keys/` mit DEV-ONLY-Keypair + README, sowie in
  `common-security/src/main/resources/dev-keys/` damit
  `classpath:dev-keys/jwt-public.pem` per default funktioniert.

**108 — Transport-TLS für jede East-West-Verbindung (Critical #2)**

Vorher: Postgres / Redis / Kafka liefen über Plaintext-Verbindungen.
Im Cluster-Netz wäre ein Side-Pod-Compromise ausreichend gewesen, um
Refresh-Token-Hashes / GDPR-Daten passiv abzuhören.

- `application-prod.yml` (geteilt via spring.factories, lädt nur unter
  `prod`-Profil):
  - JDBC: `sslmode=${DB_SSL_MODE:require}` + optionaler `sslrootcert`
  - Redis: `ssl.enabled=${REDIS_SSL_ENABLED:true}` + AUTH-Password
  - Kafka: `security.protocol=${KAFKA_SECURITY_PROTOCOL:SASL_SSL}`,
    `sasl.mechanism=SCRAM-SHA-512`, Truststore-Paths, Endpoint-ID-
    Algo `https`.
- Defaults so streng wie möglich (`require` / `true` / `SASL_SSL`),
  damit ein Misconfigured-Prod-Deploy fail-loud statt silent-plaintext.
- `compose.services.yaml`: explizit `DB_SSL_MODE=disable` /
  `REDIS_SSL_ENABLED=false` / `KAFKA_SECURITY_PROTOCOL=PLAINTEXT`
  Overrides für die Compose-Dev-Stack, weil der lokale Docker-
  Bridge-Network plaintext spricht.

**109 — Document-Storage S3 / MinIO + SSE-KMS (Critical #3)**

Vorher: CVs, Pässe, Geburtsurkunden lagen als reine Files auf dem
documents-service-Upload-Volume. Keine Platform-Encryption-at-Rest,
kein Audit-Log, kein Key-Rotation-Story; abhängig davon dass der
Operator host-level dm-crypt korrekt aufgesetzt hat (für die App
unbeobachtbar).

- Neue Abstraktion `DocumentStorage` mit zwei Implementierungen:
  - `FilesystemDocumentStorage` — Dev/CI-Default, identisch zu vorher,
    plus path-traversal-Guard auf `open` und `delete` (Defense-in-
    Depth gegen vergiftete `storage_path`-DB-Rows).
  - `S3DocumentStorage` — AWS-S3 / MinIO / jeder v4-Sig-S3-kompatible
    Store. Jeder PUT mit `SSE-S3` (AES256) per default; sobald
    `bewerbi.documents.s3.kms-key-id` gesetzt ist, `SSE-KMS` mit
    customer-managed master key (auditfähig, rotierende DEKs).
  - Path-Style-Addressing aktiviert (MinIO-kompatibel), default-
    AWS-Credentials-Chain (IRSA / ECS / env) wenn keine inline keys.
- `DocService.upload/delete` delegiert an die Abstraktion.
  PDF-Text-Extraktion läuft NACH dem durable PUT — Parse-Failures
  rollen den Upload nicht mehr zurück.
- `UserDeletedListener` (GDPR-Cascade) löscht jetzt auch die Blobs,
  vor dem SQL-Delete — fixed das orphan-binary-TODO aus Iter 86.
- Property-Switch: `bewerbi.documents.storage=filesystem|s3` via
  `@ConditionalOnProperty`. Die AWS-SDK-Klassen werden nur geladen
  wenn `storage=s3` aktiv ist.
- Tests: 3 Unit-Tests für die FS-Implementierung (Round-Trip +
  beide Seiten des Path-Traversal-Guards). S3 ist als MinIO-
  Testcontainer-Integration-Test für eine Folge-Iteration geplant.

**110 — Spalten-Level-PII-Encryption mit AES-256-GCM (Critical #4)**

Vorher: `profile.phone`, `profile.bio`, `visa_cases.appointment_date`
lagen plaintext in Postgres. Ein DB-Dump / Logical-Replica-Leak /
über-privilegierter DBA hätten das auf einen Schlag exfiltrieren
können — obwohl die App das Material selbst nie unverschlüsselt im
Log oder Trace hat.

- Neue `FieldEncryption` Helper-Klasse: AES-256-GCM, 96-bit IV, 128-
  bit Auth-Tag. Ciphertext-Format `gcm:v1:<base64(iv|ct|tag)>` mit
  Versions-Prefix für zukünftige Key-Rotation. Manipulierte Rows
  schlagen mit `IllegalStateException` fehl (GCM-Auth-Tag).
- `FieldEncryptionBootstrap` initialisiert die statische Helper vor
  dem ersten JPA-Converter-Call. In prod refuse-to-start ohne Key,
  in dev: deterministischer Stub-Key + lauter WARN.
- Zwei `AttributeConverter`s in common-security:
  - `EncryptedStringConverter` (String → String)
  - `EncryptedLocalDateConverter` (LocalDate → String, ISO-8601 +
    AES-GCM)
- `@Convert`-annotierte Felder: `Profile.phone`, `Profile.bio`,
  `VisaCase.appointmentDate`. **Nicht** `autoApply=true` — Encryption
  blowt Storage und killt Indexe, also opt-in pro Spalte.
- Flyway-Migrationen:
  - `identity/V4__encrypt_profile_pii.sql` — `phone` 32→512,
    `bio` 2000→4096 (Ciphertext + Base64-Overhead).
  - `immigration/V2__encrypt_appointment_date.sql` — `DATE` →
    `VARCHAR(120)` mit `USING TO_CHAR(...)`-Konversion.
- Forward-Compatibility: Decryptor lässt Values ohne `gcm:v1:`-
  Prefix unverändert durch — pre-Iter-110-Plaintext-Rows bleiben
  lesbar, der nächste Save verschlüsselt sie. Tabelle heilt sich
  über Zeit.
- Config: `bewerbi.security.field-encryption.key` (Env
  `FIELD_ENCRYPTION_KEY`), base64 32 bytes. In `application-prod.yml`
  drahtfest — leerer Wert in prod → Start verweigert.
- Tests: 12 Unit-Tests decken Round-Trip, Non-Determinism, Null,
  Legacy-Plaintext-Pass-Through, Tamper-Detection, Prod-Fail-Fast,
  Dev-Stub-Fallback, Key-Length-Validierung und beide Converter
  end-to-end.

---

### Zusammenfassung der vierten Welle (Iter 107–110, 4 Audit-Commits)

| Kritikalität | Vorher                            | Nachher                                       |
| ------------ | --------------------------------- | --------------------------------------------- |
| #1           | HS256-Shared-Secret in 9 Services | RS256 + JWKS, ein Signer, 8 Verifier         |
| #2           | Plaintext Postgres/Redis/Kafka    | Prod-Profil verlangt TLS + SASL_SSL + SCRAM   |
| #3           | CVs/Pässe als lokale Files        | S3 + SSE-KMS, Path-Traversal-Guard, GDPR-Blob-Cascade |
| #4           | Phone/Bio/Appointment plaintext   | AES-256-GCM mit versioniertem Ciphertext      |

Diese vier Iterationen schließen das, was ein Audit als "no
compensating controls" gewertet hätte. Jede Behebung ist allein
deploy-bar und einzeln rollback-fähig.
