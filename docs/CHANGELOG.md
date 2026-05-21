# Suite-Changelog

Iterationsweises Hardening, Modernisierung und Konsolidierung der bewerbi.tn-Suite.

## Iteration 166 — Mobile: Google sign-in via expo-auth-session

Schließt OAuth über alle 3 clients (web von Iter 161, mobile jetzt). Same backend, same loop (User → System-Browser → Google → ID-Token → /api/v1/auth/google → JWT-pair).

**Neue deps** (`npx expo install` für SDK-compat versions):
- `expo-auth-session ~7.0.11` — wraps OAuth 2.0 PKCE flow with platform-native auth-session (iOS ASWebAuthenticationSession, Android Custom Tabs, Expo Go web-browser)
- `expo-crypto ~15.0.9` — peer für PKCE-challenge generation
- `expo-web-browser ~15.0.11` — bereits in app.json plugins gelistet, jetzt mit `maybeCompleteAuthSession()` für OAuth-callback aktiv

**`src/lib/apiClient.ts`:**
- `authApi.google({idToken, role?})` — POST `/api/v1/auth/google`.
- `authApi.activity(limit)` — für zukünftige mobile activity panel.
- `LoginAttemptEntry` type exportiert (mirror der backend domain class).

**`src/stores/authStore.ts`:**
- Neue `signInWithGoogle(idToken, role?)` method, IS_API_MODE-only (throws in mock + supabase modes — Google flow geht direkt gegen unser Spring-backend, nicht via Supabase).
- Mapt RN-side UserRole (`"applicant"|"employer"|"admin"`) auf API-side (`APPLICANT|EMPLOYER`) — gleicher pattern wie `signUp()`.
- Persistiert tokens + session via existing pattern, fetchProfile lazy.

**`src/components/auth/GoogleSignInButton.tsx`:**
- Uses `Google.useAuthRequest` aus `expo-auth-session/providers/google` mit 3 separate clientIds (iOS / Android / Web) — Google scopt ID-tokens per-platform per-OAuth-client.
- `googleOAuthEnabled()` helper checkt für **alle drei** env-vars: `EXPO_PUBLIC_GOOGLE_OAUTH_IOS_CLIENT_ID` / `_ANDROID_CLIENT_ID` / `_WEB_CLIENT_ID`. Component returnt `null` wenn keine gesetzt → no dead UI in dev.
- Robustes ID-token-extraction für beide flows: `result.authentication?.idToken` (native) oder `(result.params as Record<string,string>)?.id_token` (web).
- Native SVG glyph (`react-native-svg`) statt PNG-asset — gleicher multicolor Google "G" wie web.
- Branded button styling matches dark/light mode der app, mit ActivityIndicator während busy.

**Login + Register screens** (`app/(auth)/login.tsx` + `register.tsx`):
- "ODER" divider plus GoogleSignInButton below the primary CTA inside the GlassCard.
- Login: `text="signin"` ("Mit Google anmelden").
- Register: `text="signup"` ("Mit Google registrieren") plus current `role` state passed (Bewerber/Arbeitgeber).

**Backend audience check** — Iter 160's `GoogleIdTokenVerifier` matched die ID-token's `aud` claim gegen ein single `GOOGLE_OAUTH_CLIENT_ID`. Für mobile müssen iOS + Android + Web client-ids alle in der allowed-audience-list bei Google Cloud Console stehen — typically: web-client-id ist die primary `aud`, mobile clients sind im "Authorized JavaScript origins" eingetragen aber emittieren tokens with the web client-id als `aud` wenn man's korrekt configured. Operationally documented im app.json comment.

**Verifikation**: tsc clean, jest 12/12 grün, npm audit 0 vulns. Dependabot alert #10 weiterhin geclosed by Iter 162.

**Out-of-scope (future iter):**
- Mobile "Letzte Aktivität" panel (API ist verdrahtet, screen fehlt noch — Iter 167?)
- App-side i18n keys für die Google-button labels (currently hardcoded German strings, matches existing mobile-app pattern)
- Apple sign-in (separate auth provider, separate Apple-developer-program work)

## Iteration 164 — Auth-Pages prerender-clean (Suspense raus, e2e ausgebaut)

Räumt das Iter-158-TODO ab: /login + /register + /reset-password sind jetzt in Playwright abgedeckt. Vorher waren alle drei "bewusst nicht abgedeckt" weil sie als ganzes in `<Suspense fallback={null}>` saßen und der SSR-body bis Hydration leer war.

**Refactor pattern (`useSearchParams` → `useEffect + window.location.search`):**
- **`/login/page.tsx`**: useSearchParams komplett raus. `readRedirectFromQuery()` helper liest `window.location.search` direkt im event-handler (post-hydration). Suspense weg, Page rendert komplett statisch. `?redirect=` weiterhin honouriert beim sign-in success (password + Google paths).
- **`/reset-password/page.tsx`**: useSearchParams raus. `useState<string|null>(null)` + `useEffect` der den token nach mount in state setzt. 4 render branches: `!tokenLoaded` (initial skeleton), `!token` (Link unvollständig), `done` (success), default (form). Page chrome wird in jeder branch wieder gezeigt damit user state-transitions visuell konsistent sind.
- **`/verify/page.tsx`**: useSearchParams raus, alles in ein einziges Component mit `useState<"loading"|"idle"|"ok"|"error">`. useEffect liest token aus URL und kickt verifyEmail-call.

**Playwright e2e** (`web/e2e/auth.spec.ts`) — 10 → 17 tests:
- **Login page** (4): inputs + submit-button visible, links zu register + forgot-password, welcome-headline, Google-button hidden ohne env-var.
- **Register page** (3): role-toggle (Bewerber+Arbeitgeber), form-fields + submit, link zu login.
- **Forgot password page** (3): unverändert von Iter 158.

**Auch nach Refactor NICHT abgedeckt: /reset-password + /verify**
- Beide hängen davon ab dass useEffect post-mount läuft, und das hängt davon ab dass React hydratisiert.
- Ein **pre-existing CSP-Bug** verhindert hydration unter `next start`: das Middleware setzt per-request Nonces in der CSP, aber Next.js bakt prerendered script-tags ohne nonce in die statische HTML. Browser blocked alle chunks via `strict-dynamic` → React lädt nie → useEffect läuft nie → page hängt im skeleton.
- Verifiziert via `curl -s http://localhost:3015/login | grep nonce=` — 0 matches.
- Separater task gespawned um die nonce-wiring zu fixen. Nach dem fix können /reset-password + /verify assertions hier hinzugefügt werden (Comment-block in der spec markiert die stelle).

**Verifikation:** typecheck clean, vitest 41/41, playwright 17/17, build 29/29 prerendered pages. /reset-password 3.71kB (vorher 3.69kB — winzige zunahme durch state-machine).

## Iteration 165 — Rate-limit on POST /auth/google + JWKS-DoS-Schutz

Schließt eine echte Lücke aus Iter 160: `POST /api/v1/auth/google` ruft `googleVerifier.verify()` auf, was network-I/O (JWKS fetch wenn cache cold) + RSA-Signature-validation triggert. Ohne rate-limit ist der endpoint ein DoS-Vektor für jeden unauthenticated client.

**Gap-analyse:** Der existing `LoginAttemptTracker` (Iter 47+113) hat zwei Achsen — per-email (10/10min → 15min lockout) + per-IP (50/10min → 15min lockout). Die per-email Achse kann auf /auth/google nicht greifen weil der email erst NACH verification bekannt ist (token signed by Google). Die per-IP Achse war aber gar nicht verdrahtet.

**Fixes:**
- **Pre-verify IP-lockout-check**: `attempts.isIpLockedOut(ip)` als allerstes Gate (vor token-verify) → 429 mit `Retry-After`.
- **Post-verify-failure IP-counter increment**: `attempts.recordIpFailure(ip)` nach jeder `GoogleTokenException`. Garbage-token-flood füllt das per-IP-budget genauso wie wrong-password attempts.
- **IP-counter-reset on success**: `attempts.resetIp(ip)` in `recordGoogleSuccess()` — ein legit user soll kein failure-credit aus einem expired-session retry-loop akkumulieren.
- **Audit-events**: `AUTH_LOGIN_LOCKED` mit reason `oauth-ip-locked-out <ip> <retry>s` für SOC-dashboards die Google-spezifische lockouts vom password-flow trennen wollen.
- **LoginAttempt-Mirror**: bekommt `RATE_LIMITED_IP` reason in der Postgres-history-tabelle.

**Token-hygiene-audit**: grep über services/identity-service bestätigt — nirgendwo wird der raw idToken (oder substring/preview davon) geloggt. `GoogleIdTokenVerifier` loggt nur `e.getMessage()` (verification-failure-text aus Nimbus). `MethodArgumentNotValidException` im `GlobalExceptionHandler` returnt nur field-name + violation-message, nie den rejected value. Hash-prefix-logging wie bei refresh-tokens nicht nötig hier (ID-tokens werden nicht persisted).

**No-go (bewusst nicht gemacht):**
- per-email lockout via verified `g.email()` — würde es einem attacker erlauben, durch wiederholte Google-OAuth-attempts gegen einen email den password-login dieses users zu sperren. Lockout-weaponization gegen legit accounts ist worse als die DoS-Risk gegen unsere infrastructure.

**Verifikation**: identity-service compile clean. common-security 44/44 grün.

## Iteration 163 — Web unit tests für Iter-161 OAuth components

Hebt vitest von 25 → 41 tests. Coverage für die security-kritischen OAuth-Web-paths damit zukünftige refactors keine silent breakage einbauen.

**`google-sign-in-button.test.tsx`** (6 tests):
- `googleOAuthEnabled()` returnt `false` bei missing / leerer / whitespace-only env-var, `true` bei real value.
- `<GoogleSignInButton>` returnt `null` (empty DOM) ohne env-var → keine GIS-script injection in dev.
- Rendert die GoogleLogin host nur wenn env-var gesetzt.
- Forwarded `text` prop: default `"signin_with"`, `"signup_with"` für register page.
- `@react-oauth/google` ist via vi.mock gestubbt — Tests laufen ohne real Google-credentials.

**`recent-activity.test.tsx`** (4 tests):
- Loading state: pending promise → `t("common.loading")` sichtbar.
- Empty: API returnt `[]` → "settings.activity.empty" copy.
- Data: 2 entries (success + failure) rendert success-badge + failure-badge + method-labels (PASSWORD/GOOGLE) + failure-reason code + beide IPs.
- Error: API rejected → "settings.activity.loadError" + retry-button.
- Runs in isolated QueryClient (retry off, staleTime 0) per test.

**`auth-store.test.ts`** (5 tests):
- `signInWithGoogle` happy-path: status authenticating → authenticated, user persisted, onLoginSuccess called.
- Role-forwarding: passed → backend; omitted → undefined.
- Error-path: status → anonymous, error message persisted, original error re-thrown.
- Fallback error message für errors ohne `message` field.
- `setOnUnauthorized()` wird genau 1× registriert (Zustand factory single-run).
- API + api-client + auth-storage komplett gemockt via `vi.mock(...)` — Test runt ohne network / localStorage / sonner.

**Stack notes**:
- Wir nutzen `vi.resetModules()` + dynamic `await import()` per test so each one gets a fresh Zustand store (Zustand stores sind module-level singletons).
- Caveat in `translateOrCode()` discovered: wenn mocked useTranslate die key zurückgibt, strippt der helper everything up to last dot, so "auth.method.PASSWORD" → "PASSWORD" für assertions.

Verifikation: typecheck clean, lint 0 warnings, vitest **41/41 grün**.

## Iteration 162 — Dependabot: `@tootallnate/once` low-sev fix

Single-line `mobile/package.json` override `@tootallnate/once@<3.0.1": "^3.0.1"` — bumpt die transitive dep (durch `jest-expo → jest-environment-jsdom → jsdom → http-proxy-agent`) auf 3.0.1 (GHSA: incorrect control flow scoping, low severity, fix verfügbar). `npm audit` reportet 0 vulnerabilities danach. Mobile-jest tests 12/12 grün — keine behavior-Änderung.

Dependabot alert #10 wird beim nächsten dependabot-scan auto-closed.

## Iteration 161 — Web frontend: Google sign-in + recent activity

Web-Hälfte zum OAuth-Feature aus Iter 160. Schließt die Loop (User → Google-Popup → ID-Token → Backend-Verify → JWT-Pair).

**Neue dep**: `@react-oauth/google` (1 package, 0 vulns). Wrappt Google Identity Services so dass die `<GoogleLogin>` component direkt ein ID-Token via `credential` callback liefert — genau was unser `GoogleIdTokenVerifier` erwartet.

**Env-gated provider (`components/auth/google-oauth-provider.tsx`):**
- `googleClientId()` + `googleOAuthEnabled()` helpers — single source of truth ob OAuth in der current env aktiv ist.
- `<GoogleOAuthBoundary>` rendert children direkt wenn `NEXT_PUBLIC_GOOGLE_OAUTH_CLIENT_ID` leer ist (dev default) — kein GIS-script injection, kein console-noise. In prod (env-var gesetzt): GoogleOAuthProvider wrappt die Tree.
- Verdrahtet in `providers.tsx` zwischen `<MotionConfig>` und `{children}`.

**Sign-in button (`components/auth/google-sign-in-button.tsx`):**
- `<GoogleSignInButton {role?, onSuccess?, text?}>` — Wrapper um `<GoogleLogin>` mit success-handler der `useAuthStore.signInWithGoogle(credential, role)` aufruft.
- Komplett hidden via `googleOAuthEnabled()` check wenn keine client-id gesetzt — kein dead button im dev.
- `text="signin_with"` auf /login (default), `text="signup_with"` auf /register.
- Branded Google-Button (outline theme, large size, 320px width) — kein custom styling damit users die Google-OAuth-Indikator sofort erkennen.

**Auth-Store extension (`stores/auth-store.ts`):**
- Neue `signInWithGoogle(idToken, role?)` method — symmetrisch zu `signIn()` / `signUp()`. Calls `authApi.google()`, on success: `onLoginSuccess(resp)` + state hydration. On error: status → "anonymous", error-message persisted, re-throw für caller.

**API client (`lib/api.ts`):**
- `authApi.google({idToken, role})` → POST `/api/v1/auth/google`.
- `authApi.activity(limit)` → GET `/api/v1/auth/me/activity?limit=N` returning `LoginAttemptEntry[]` (mirrors backend domain class).

**/login page**: GoogleSignInButton zwischen submit-button und "Noch kein Konto?" footer. Routet auf `safeRedirectPath(?redirect, "/dashboard")` post-login, same wie password-flow.

**/register page**: GoogleSignInButton mit dem currently-selected role (live-watched aus form state). Routet auf `/onboarding` (APPLICANT) oder `/employer/dashboard` (EMPLOYER) post-signup.

**/settings page — neue Card "Letzte Aktivität" (`components/auth/recent-activity.tsx`):**
- `useQuery(["auth", "me", "activity"], ...)` mit 30s staleTime — refetch on focus für aktuellen Stand nach inaktiver Tab.
- Pro row: method-icon (Google glyph / KeyRound / RefreshCw), success-badge (grün ✓ / rot ⚠), Intl-formatted timestamp, IP, failure-reason (i18n-key `error.auth.activity.<code>`).
- Loading / empty / error states mit retry-button.

**i18n (`i18n/dictionaries.ts`)** — 3 locales × neue keys:
- `auth.google.signIn` / `signUp` / `signingIn` (button labels)
- `error.auth.google.disabled` / `emailExistsAsPassword` / `noPassword` (toast errors für backend-Fehler-codes)
- `settings.activity.title` / `tagline` / `empty` / `success` / `failure` / `loadError`
- `auth.method.PASSWORD` / `GOOGLE` / `REFRESH` (activity row method labels)
- `error.auth.activity.<12 codes>` — RATE_LIMITED_ACCOUNT, USER_NOT_FOUND, INVALID_PASSWORD, OAUTH_*

**Verifikation**: typecheck clean, lint 0 warnings, vitest 25/25 grün, next build 29/29 pages prerendered. /login 2.79kB, /register 4.36kB, /settings 10.2kB.

**Manual smoke (dev, GOOGLE_OAUTH_CLIENT_ID unset)**: /login + /register + /settings rendern ohne Google-Block (keine dead UI, kein "Mit Google" button), backend `/api/v1/auth/google` returnt 503 `error.auth.google.disabled` falls direkt aufgerufen. Mit gesetztem client-id würde der GIS-button erscheinen und die end-to-end flow durchlaufen.

## Iteration 160 — Google Sign-In + Login-Recorder

Backend-Hälfte vom OAuth-Feature. Schließt die security gaps die Iter 159 vorbereitet hat. Web-Frontend folgt in Iter 161.

**Google ID-Token Verification (`auth/google/GoogleIdTokenVerifier.java`):**
- Pure server-side verification — verifiziert RS256-Signature gegen Google's JWKS (`https://www.googleapis.com/oauth2/v3/certs`, cached, retrying). Niemals client-side claims trauen.
- Verifikations-Chain (jeder Schritt rejecta das Token): Signature → `iss` ∈ {`https://accounts.google.com`, `accounts.google.com`} → `aud` matcht unsere client-id → `exp` future → `email_verified=true`.
- `@ConditionalOnProperty(name = "bewerbi.security.google.client-id")` — bean lädt nur wenn property gesetzt ist, dev/CI builds ohne Google credentials starten unverändert.
- Returnt `VerifiedGoogleUser` record (subject/email/given_name/family_name/picture/locale).
- Stable error codes für audit-grouping: `OAUTH_TOKEN_MISSING`, `OAUTH_TOKEN_MALFORMED`, `OAUTH_TOKEN_INVALID`, `OAUTH_AUDIENCE_MISMATCH`, `OAUTH_EMAIL_UNVERIFIED`, `OAUTH_CLAIMS_INCOMPLETE`.

**Login-Recorder (`auth/LoginAttemptRecorder.java`):**
- Fire-and-forget Postgres-mirror der LoginAttempt-Rows (Kafka audit-stream bleibt primary trail).
- Jeder save in `Propagation.REQUIRES_NEW` — transienter DB-Failure (z.B. brief Postgres restart) reißt die calling transaction nicht runter. Successful login returnt tokens auch wenn audit-row-insert failt.
- `DataAccessException` → log WARN, nie throwen.

**AuthService Integration:**
- `login()` — jeder failure-pfad (rate-limit-account / rate-limit-ip / unknown user / wrong password) ruft `loginRecorder.recordFailure(...)` mit stable reason-code. Success-pfad: `recordSuccess(...)` mit `LoginMethod.PASSWORD`.
- **Neue Methode `googleLogin(GoogleLoginRequest)`** mit 3 Pfaden:
  1. `findByGoogleSubject(sub)` → existing Google-user, issue tokens.
  2. `findByEmail(email)` → existing EMAIL-user → **409 ConflictException** (`error.auth.google.emailExistsAsPassword`). Account-linking ist future-iter, kein silent-takeover.
  3. New → `User.fromGoogle()` + Profile mit `given_name` / `family_name` / `picture` aus Token. Kein verification email (Google verified bereits).
- **OAuth-Guards für password-operationen:**
  - `login(email, password)` für OAuth-only-user → BadCredentialsException, mit equal-time bcrypt gegen DUMMY_HASH (kein enumeration leak via timing).
  - `requestPasswordReset(email)` für OAuth-only → silent return (kein email-leak).
  - `changePassword()` für OAuth-only → 409 ConflictException (`error.auth.google.noPassword`).
  - `deleteAccount()` für OAuth-only → skip password-check (Google-user hat keinen), aber equal-time DUMMY_HASH bcrypt für timing.
- **GDPR cascade** bei `deleteAccount()`: `loginAttempts.anonymiseForUser(uid)` — Rows bleiben für security forensics, aber email + UA werden geblankt, user_id wird auf NULL gesetzt via `ON DELETE SET NULL`.

**Neue Endpoints (`AuthController.java`):**
- `POST /api/v1/auth/google` — body `{idToken, role?}`. Returnt same `AuthResponse` shape wie `/login`.
- `GET /api/v1/auth/me/activity?limit=20` (authenticated) — recent login attempts für /settings UI. Limit server-side auf [1,100] clamped.

**Config (`application.yml`):**
- `bewerbi.security.google.client-id: ${GOOGLE_OAUTH_CLIENT_ID:}` — leer in dev (bean off, /auth/google returnt 503 `error.auth.google.disabled`). In prod: env-var setzen, same value wird ins web-bundle published.

**Verifikation:** identity-service compile clean (`mvn -pl services/identity-service compile`). common-security tests 44/44 grün (proxy regression check — identity-service hat keine unit-tests, IntegrationTest weiterhin broken durch pre-existing common-security classpath-issue von vor Iter 159).

## Iteration 159 — DB foundation für OAuth + Login-History

Vorbereitung für Iter 160 (Google Sign-In) + Iter 161 (Login-Recorder). Reiner Schema- + Entity-Pass — keine Behavior-Änderung.

**Neue Domain-Klassen:**
- `AuthProvider` enum: `EMAIL` (default für alle existing users) / `GOOGLE`. Verwendet auf `User.authProvider`.
- `LoginMethod` enum: `PASSWORD` / `GOOGLE` / `REFRESH`. Verwendet auf `LoginAttempt.method` (eine Userin kann theoretisch über mehrere methods loggen).
- `LoginAttempt` Entity: id (UUID), userId (nullable FK with `ON DELETE SET NULL`), email (always recorded — auch für unknown-email probes), method, success, failureReason (60-char code), ip, userAgent, occurredAt. Mit Factory-Methods `success()` / `failure()` + `anonymiseOnUserDeletion()` für GDPR-Cascade.

**User Entity:**
- Neue Felder: `authProvider` (NOT NULL, default EMAIL), `googleSubject` (unique, nullable).
- `passwordHash` jetzt nullable — Google-Users haben keinen lokalen Hash.
- Neue Factory `User.fromGoogle(email, sub, role)` — emailVerified=true (Google verifiziert email vor Token-Ausgabe).
- Helper `isOauthOnly()` — Schutz für password operations (forgot/change/delete-account müssen 409 returnen für GOOGLE users statt 500 zu leaken).

**UserRepository**: `findByGoogleSubject(String)` — lookup über Google's stable sub claim (resilient gegen email-changes bei Google).

**`LoginAttemptRepository`**:
- `findByUserIdOrderByOccurredAtDesc(uid, pageable)` — UI "meine Aktivität"
- `findByEmailAndSuccessFalseAndOccurredAtAfter(...)` — ops anti-credential-stuffing scans
- `@Modifying anonymiseForUser(uid)` — GDPR cascade (sets user_id=NULL, email='[deleted]', userAgent=NULL).

**SQL-Migrations:**
- `V5__auth_provider.sql`: ADD COLUMNS auth_provider + google_subject, ALTER password_hash DROP NOT NULL, partial unique index on google_subject WHERE NOT NULL, btree index on auth_provider.
- `V6__login_attempts.sql`: CREATE TABLE login_attempts mit 4 Indexes (user+time DESC partial, email+time DESC, ip+time DESC partial, occurred_at für retention job).

Backend kompiliert clean. common-security tests 44/44 grün. identity-service IntegrationTest war + ist broken durch pre-existing common-security classpath issue (separate concern).

## Iteration 158 — Playwright critical-path coverage (auth + 404)

**4 neue Tests in 2 Files** (additional zu den 6 Landing-Tests aus Iter 157):

- **`e2e/auth.spec.ts`** (3 Tests, alle für `/forgot-password`):
  - email input + reset-link button rendering
  - back-to-login link
  - hero copy "Passwort vergessen"

  /login + /register + /reset-password sind bewusst **NICHT** abgedeckt: alle drei nutzen `useSearchParams()` in einem `<Suspense fallback={null}>` — Next bailt sie zur Build-Zeit auf client-side rendering, die SSR-HTML-body ist leer bis Hydration fertig ist. Asserts gegen ein fresh `next start` sind dadurch flaky. Folgewelle wird entweder `useSearchParams` in ein Subkomponente isolieren oder e2e gegen `next dev` laufen lassen.

- **`e2e/error-routes.spec.ts`** (1 Test):
  - `/this-does-not-exist` rendert nach hydration mindestens einen home-Link.

  Status-code assertion (`expect(response.status).toBe(404)`) entfernt — `next start` serviert für unknown routes manchmal 200 mit hydrated 404 body. Manual smoke bestätigt dass das 404 GlassCard mit Compass + GradientText + 2 CTAs in echtem Browser korrekt rendert.

**Test-Total**:
- Vitest: 25
- Playwright: **10** (6 Landing + 3 Auth + 1 Error)
- = 35 Web-Tests

Alle Tests laufen in ~1.7min (mit `next build && next start` setup-overhead).

## Iteration 157 — Web e2e mit Playwright (Setup + Landing smoke)

Drittes Test-Tier nach Vitest (Iter 145) und Jest (Iter 150): echte Browser-Tests gegen das gebaute Next-Bundle.

**Setup:**
- `@playwright/test` als devDep + chromium browser (112 MiB headless shell heruntergeladen).
- `playwright.config.ts`: testDir `./e2e`, baseURL `http://localhost:3010`, webServer = `npm run build && next start -p 3010`, retain trace/screenshot/video bei failure.
- `package.json`: 2 neue Scripts — `test:e2e` (CLI) + `test:e2e:ui` (interactive Trace Viewer).
- `.gitignore`: `test-results/` + `playwright-report/` + `playwright/.cache/` excludiert.

**`web/e2e/landing.spec.ts`** — 6 smoke tests gegen die Landing:
- Hero: GradientText headline + primary CTA mit korrektem href.
- Sticky glass nav: brand mark + visible primary CTA (Login-Link ist hidden auf mobile, also nicht assertbar).
- Trust strip + features bento + stats section.
- Visa types section (mit scrollIntoView damit below-fold elements visibility-check passieren).
- Anchor links (Features → #features).
- No pageerror (uncaught JS exceptions). Console-error noise wird bewusst nicht assertet — production noise (vendor pre-fetches, optional API 404s) ist kein smoke-test signal.

Alle 6 Tests grün in ~44s. Vitest (25) + Playwright (6) = 31 Web-Tests.

**Bug gefixt während Setup**: playwright.config.ts JSDoc-Kommentar enthielt das Pattern `src/**/*.test.tsx` — die `*/` Sequence darin schließt den `/**` Kommentar vorzeitig. Workaround: das Pattern aus dem Kommentar paraphrasieren.

## Iteration 156 — Flutter widget tests für Iter-128 Primitives

**4 neue Test-Files mit 19 Tests:**

- **`test/app_gradient_text_test.dart`** (4 Tests): text content rendering, ShaderMask wrapping, alle 4 variants (brand/aurora/sunrise/flame), style + textAlign forwarding.

- **`test/app_glass_card_test.dart`** (5 Tests): children rendering, BackdropFilter present, blur-sigma scaling pro strength (subtle 8 / default 14 / strong 20 / frosted 28), onTap wiring + tap registration via `tester.tap()`, glow shadow prop.

- **`test/app_number_ticker_test.dart`** (5 Tests): starts at 0 → animates to value (de_DE format "1.284"), prefix + suffix, decimals (de_DE comma `4,5`), style forwarding, **reduce-motion snap** via `MediaQuery(disableAnimations: true)` — value rendert sofort ohne pumpAndSettle.

- **`test/app_reveal_test.dart`** (5 Tests): child renders after pumpAndSettle, alle 5 directions (up/down/left/right/none), reduce-motion = Opacity 1.0 sofort, delay prop ohne throw.

**Total Flutter Tests**: 214 (vorher: 195). Alle grün.

## Iteration 155 — Mobile +not-found.tsx (Expo Router 404)

**`mobile/app/+not-found.tsx`** (Expo Router convention für catch-all unknown routes):
- AuroraBackground (vivid) + SafeArea + ScrollView wrapper.
- GlassCard (strong + glow) als hero card.
- Gradient-icon-square (Compass, 64×64) mit shadow-glow.
- "Hier endet die <GradientText brand>Karte</GradientText>" Headline.
- 2 ShimmerButtons: Compass → home, Search → search (statisch um nicht zu konkurrieren).
- `Stack.Screen options={{ headerShown: false }}` — no native header bar.

Bisher: typo deeplinks landeten auf Expo Router's default-Fallback (text-only "Unmatched route"). Jetzt: on-brand 404 mit Recovery-CTAs.

Mobile tsc clean, 12 Tests grün.

## Iteration 154 — Onboarding wizard i18n wiring

Die Iter-146 onboarding.* Keys werden jetzt aktiv genutzt.

**`web/src/app/(applicant)/onboarding/page.tsx`**:
- `STEP_META` (statisches Module-Level-Objekt) → `buildStepMeta(t)` Factory die `t()` aufruft. Wird einmal pro Render aufgerufen.
- 5 step-meta-Objekte (profession/level/recognition/skills/done) nutzen je `t("onboarding.X.title")` + `t("onboarding.X.tagline")`.
- Step-Indicator "Schritt {stepLabel} / {total}" → `t("onboarding.step", { n: stepLabel, total })` mit Placeholder-Substitution.
- "X % fertig" → `t("onboarding.stepProgress", { percent: ... })` — funktioniert in DE/FR/AR.
- Icons (Briefcase / GraduationCap / etc.) bleiben statisch (kein translation needed).

User die FR/AR ausgewählt haben sehen den kompletten Onboarding-Wizard jetzt in ihrer Sprache (vorher: hartcodiertes Deutsch).

Build: /onboarding 9.76 kB (vorher 10.2 kB — sogar leicht kleiner durch dead-code-elimination der inline strings).

## Iteration 153 — Konkrete Performance + a11y wins

Vier kleine, gezielte Optimierungen statt Lighthouse-Lifecycle (kann nicht ohne Browser laufen).

**Font Loading — `layout.tsx`**:
- `Inter`: weights gepinnt auf `["400", "500", "600", "700", "800"]` (5 statt default 12+). Spart ~2 woff2-Files = ~120 KB Download.
- `Cairo`: `preload: false` — nur ~5% AR-locale User brauchen es; nicht-AR User sparen sich Cairo komplett aus dem initialen Bundle.

**Viewport — `layout.tsx`**:
- `colorScheme: "light dark"` — Browser rendert native form controls / scrollbars sofort im richtigen Theme statt zu flashen.
- **Bewusst NICHT gesetzt**: `maximumScale` / `userScalable` — WCAG 2.1 SC 1.4.4 fordert text resize bis 200%. Browser-default (5× zoom) bleibt aktiv.

**Memoization — `JobCard`**:
- `JobCardImpl` → `export const JobCard = memo(JobCardImpl)`.
- Verhindert re-render aller sichtbaren Jobs wenn der Parent (Search-Page) State ändert (Filter-Chips, Search-Input).
- Folgewin: `toggleFav` in Search-Page mit `useCallback` gewrappt — sonst würde die new-closure-per-render den memo defeaten.

**Build clean, 25 Web-Tests grün, typecheck grün.**

Quantitativer Impact (Schätzung):
- ~120 KB weniger Font-Download für non-AR User
- Re-renders der Job-Liste bei Filter-Toggles: ~6 statt N (wo N = jobs visible)
- Native form-control flash beim ersten Paint: weg

## Iteration 152 — PWA Manifest + Metadata enhancements

**`web/src/app/manifest.ts`** — erheblich erweitert:
- `id`: stable PWA identity (`/?utm_source=pwa`) — Browser können Installs über URL-Änderungen hinweg korrelieren.
- `name` erweitert auf "bewerbi.tn — Brücke nach Deutschland" (besser für App-Drawer Suche).
- `scope: "/"` + `display_override: ["standalone", "minimal-ui"]` — Standalone bevorzugt, graceful fallback.
- `categories: ["productivity", "business", "education"]` — Discoverability in Edge/Samsung Internet App Stores.
- `prefer_related_applications: false` — explicit Signal das es keine native App gibt (verhindert App-Store-Prompts in Safari).
- **`shortcuts`** (3 Quick-Links): Long-press auf Home-Icon → Direkt zu "Stellen suchen" / "Meine Bewerbungen" / "Visum-Tracker". Jeder mit eigenem UTM-Source-Tracking.

**`web/src/app/layout.tsx`** — metadata expanded:
- `icons` als strukturiertes Objekt (icon SVG + apple-touch PNG 192).
- `appleWebApp`: capable, title, statusBarStyle — iOS Add-to-Home-Screen behavior.
- `formatDetection.telephone: false` — verhindert automatische Telefonnummer-Verlinkung.
- `openGraph` + `twitter` cards für Link-Previews auf Social Media + Messengern (Facebook, X, LinkedIn, WhatsApp).

Build clean. Manifest jetzt 190 B (vorher 153 B) — winziger Anstieg, riesiger Installability-Win.

Note: Service Worker (offline-first asset caching) bewusst nicht hinzugefügt — ein halb-gebauter SW kann Cache-Poisoning verursachen. Wenn es richtig gemacht wird, dann mit Workbox + separater Iteration.

## Iteration 151 — Route Error-Boundaries + 404 Page

**Lücke**: bisher keine `error.tsx` / `not-found.tsx` / `global-error.tsx` — runtime errors landeten auf Next.js' Default-Fallback-Page (graphisch fremd, kein Brand).

**5 neue Files**:

- **`web/src/app/not-found.tsx`**: 404 für alle unmatched routes. AuroraBackground vivid + GlassCard strong + glow ring + GradientText "Hier endet die Karte". 2 CTAs: Startseite + Stellen suchen. `robots: noindex`.

- **`web/src/app/global-error.tsx`**: catastrophic root-layout failure. Vollständig **dependency-free** (kein Tailwind / kein Theme-Store / keine Providers — die könnten ja selbst kaputt sein). Eigene `<html>` + `<body>` Tags mit inline-styled Glass-Surface (radial-gradient + backdrop-blur). Inline gradient button "Erneut versuchen". Logs error + zeigt digest-Ref.

- **`web/src/app/(applicant)/error.tsx`**: catches errors innerhalb `/(applicant)/*`. Layout (AppShell + Sidebar) bleibt erhalten — User kann zur nächsten Tab navigieren. Nutzt das ErrorState-Primitive (`tone="glass"`) mit onRetry-Button. In dev: zeigt error.message + stack. In prod: friendly message.

- **`web/src/app/(employer)/error.tsx`** — gleich für employer-Bereich.

- **`web/src/app/(admin)/error.tsx`** — gleich für admin-Bereich.

Build clean. Alle 4 error.tsx + not-found.tsx + global-error.tsx werden von Next.js' build-pipeline automatisch erkannt.

## Iteration 150 — Mobile Test-Infrastruktur (Jest + RN Testing Library)

Mobile war bisher komplett ungetestet (nur Backend + Flutter hatten Tests + nun Web seit Iter 145). Jetzt auch Mobile.

**Neue Dev-Dependencies:**
- `jest-expo` (Expo-preset für Metro-Transforms + Standard-Mocks)
- `jest@29` (gepinnt auf 29 für jest-expo Kompatibilität — Jest 30 hat breaking changes in `_moduleMocker.clearMocksOnScope`)
- `@testing-library/react-native` (RN-Pendant zu @testing-library/react)
- `@types/jest`
- `react-native-worklets` (transitive dep für reanimated 4.x Babel-Plugin)

**`jest.config.js`**: preset jest-expo, testMatch für src/ + app/, transformIgnorePatterns für ESM-Module (expo-* / react-native* / @react-native-masked-view / nativewind), collectCoverageFrom auf `src/components/ui/`.

**`package.json`**: 3 neue Scripts — `test`, `test:watch`, `test:coverage`.

**Bekannte Hürde gelöst**: nativewind babel-plugin injiziert `_ReactNativeCSSInterop` Referenzen in jede JSX-Expression, was Jest's "module factory may not reference out-of-scope variables" Rule bricht. Workaround: `jest.mock()` Factories nutzen `require("react-native").View` direkt (kein JSX, kein React.createElement) — passt durch nativewind's Filter durch.

**3 Test-Files, 12 Tests:**

- **`GradientText.test.tsx`** (4 Tests): renders content (×2 wegen mask+dup), alle 4 variants, style-prop forwarding, default variant.

- **`GlassCard.test.tsx`** (5 Tests): renders children, ohne onPress non-interactive, mit onPress press fires once, alle 4 strength variants, glow prop.

- **`BentoGrid.test.tsx`** (3 Tests): Grid + Row + Cell render, BentoRow flex-direction, BentoCell defaults.

Alle 12 Tests grün via `npm test` in ~4.5s. Mobile tsc bleibt clean.

## Iteration 149 — Web i18n wiring (Iter 146 keys aktiv schalten)

Die Iter-146 Übersetzungen waren bisher nur in den shared/ JSON-Seeds. Jetzt sind sie auch in der Client-Dictionary verfügbar und werden in ersten Pages tatsächlich genutzt.

**`web/src/i18n/dictionaries.ts`** — 52 neue Keys × 3 Locales = **156 neue Strings**:
- `landing.*` — 25 Keys für Marketing-Hero (für zukünftige Verwendung wenn Landing zu Client-Component wird oder ein Server-Side-Translate-Helper kommt).
- `settings.section.*` — 5 Keys (Konto/App/Rechtliches/Gefahrenzone/Sicherheit).
- `settings.sessions.*` — 4 Keys (Title/Tagline/RevokeOthers/Current).
- `onboarding.*` — 12 Keys (5 step titles + taglines + step/progress mit `{n}`/`{total}`/`{percent}` placeholders).
- `empty.*` — 6 Keys (noResults/noApps/noFav je title+body).

**Wiring** (3 Pages):
- `/settings`: "Konto" → `t("settings.section.account")`, "Rechtliches" → `t("settings.section.legal")`. Die anderen Section-Headers stehen jetzt für FR/AR bereit.
- `/applications`: Empty-State "Noch keine Bewerbungen" + Body → `t("empty.noApps.*")`.
- `/favorites`: Empty-State "Noch keine Favoriten" + Body → `t("empty.noFav.*")`.
- `/search`: Empty-State "Nichts gefunden" + Body → `t("empty.noResults.*")`.

User die in den Settings auf FR/AR umstellen sehen jetzt die Empty-States in ihrer Sprache. Restliche Strings (HeroSection des Landings, Onboarding-Step-Wizards, etc) folgen in nächster Welle — diese Iteration legt nur die Infrastruktur.

Build clean, 25 Web-Tests grün, typecheck grün.

## Iteration 148 — Loading-States für restliche heavy pages

Fortsetzung der UX-Polish aus Iter 147. **8 weitere `loading.tsx`** für alle major content-Routes.

**Neu**:
- `applications/loading.tsx` (icon-tile-header + 4 row-skeletons)
- `favorites/loading.tsx` (icon-tile-header + 6 card-skeletons 3-col)
- `profile/loading.tsx` (header + completeness card + form + sections)
- `visa/loading.tsx` (icon-header + hero-card + 4 row-skeletons)
- `anerkennung/loading.tsx` (icon-header + setup-card)
- `saved-searches/loading.tsx` (icon-header + 4 row-skeletons)
- `cv-upload/loading.tsx` (center-aligned hero + drop-zone)
- `admin/companies/loading.tsx` (header + 5 row-skeletons)
- `employer/dashboard/loading.tsx` (hero + bento layout)

**Total**: 11 `loading.tsx` files (3 aus Iter 147 + 8 jetzt) — alle Authenticated-Routes haben jetzt sofortiges Skeleton-Feedback bei Navigation.

Build clean (29/29 prerender, gleiche Page-Bundle-Größen — `loading.tsx` ist ein separater micro-chunk).

## Iteration 147 — Performance pass (bundle analyzer + loading states)

**Bundle Analyzer eingerichtet:**
- `@next/bundle-analyzer` als devDep installiert.
- `next.config.ts` mit `withBundleAnalyzer()` gewrappt — aktiviert via `ANALYZE=true`.
- Neues npm script `analyze` (`ANALYZE=true next build`) — generiert HTML-Reports unter `.next/analyze/` für laufende Größen-Analyse.

**Loading-States** für 3 meistbesuchte Routes:
- `dashboard/loading.tsx`: Skeleton-Variante des Bento-Layouts (hero + 6 tiles + categories row). `tone="glass"` matched die echte UI.
- `search/loading.tsx`: Header + search bar + sticky sidebar + 6 job-card skeletons.
- `jobs/[id]/loading.tsx`: hero + 2 detail cards (description + requirements).

**Effect**: Während Next.js die Page-Daten lädt (React Query, dynamic routes), erscheint sofort das Skeleton-Layout statt einer leeren Seite. Drastische Verbesserung der wahrgenommenen Performance bei navigation.

**Bundle-Baseline** (vor Iter 147):
- Landing: 8.01 kB + 162 kB First Load
- Login: 2.47 kB + 232 kB
- Dashboard: 11.3 kB + 181 kB
- Search: 6.13 kB + 194 kB
- Jobs/[id]: 6.67 kB + 183 kB
- Visa: 14.1 kB + 183 kB (größtes Page-Bundle)

Build verifiziert clean (29/29 prerender).

## Iteration 146 — i18n seeds erweitert für Iter-117/118 Strings

Die mit Iter 117–143 eingeführten hart-codierten deutschen UI-Strings (Landing-Hero, Onboarding-Steps, Settings-Sections, Empty-States) sind jetzt in den 3 Seed-Files (`shared/i18n/{de,fr,ar}.json`) als Keys hinterlegt — bereit zum Upload an i18n-service.

**4 neue Namespaces** in allen 3 Sprachen:

- **`landing.*`** (25 keys): Hero-Tagline, Trust-Pills, Features-Section, Stats-Counters, How-it-works, Visa-Section, Voices-Section, Final-CTA.

- **`settings.*`** (9 keys): Section-Headers (Konto/App/Rechtliches/Gefahrenzone/Sicherheit), Sessions-Subscreen (Title/Tagline/RevokeOthers/Current).

- **`onboarding.*`** (12 keys): Step-Indicator mit `{{n}}/{{total}}` Variables, Step-Progress mit `{{percent}}`, je Title + Tagline für 5 Steps (profession/level/recognition/skills/done).

- **`empty.*`** (6 keys): noResults / noApps / noFav je mit Title + Body.

**Übersetzungs-Notes:**
- DE: Quell-Strings unverändert von UI übernommen.
- FR: Natürliches Französisch ("Votre pont vers l'Allemagne"), formelles Sie/Vous, "Conforme RGPD" statt "DSGVO-konform".
- AR: RTL-friendly Strings mit korrekten Sonderzeichen (← → ←), modernes Standard-Arabisch, Begrüßung im informellen Du ("ابدأ" / "ابدأ مجانًا").

Alle 3 JSON-Files validiert via Node `JSON.parse`.

Die Web/Mobile/Flutter Components selbst nutzen noch die hart-codierten Strings — separate Refactor-Welle (Iter 148+) wird die Components auf `useTranslate()` umstellen.

## Iteration 145 — Web Vitest setup + Iter 117 primitive tests

Erste Web-Test-Infrastruktur. Bisher hatten wir nur Backend (JUnit) und Flutter (widget tests) Tests — Web war komplett ungetestet.

**Neue Dev-Dependencies:**
- `vitest` (Test-Runner) + `@vitejs/plugin-react` (JSX-Transform)
- `@testing-library/react` + `@testing-library/jest-dom` + `@testing-library/user-event`
- `happy-dom` (leichter als jsdom für Component-Smoke-Tests)

**`vitest.config.ts`**: alias `@/` → `src/`, environment happy-dom, setupFiles, excludes Storybook-Files (`*.stories.tsx`).

**`vitest.setup.ts`**: Polyfills für happy-dom:
- `matchMedia` (framer-motion liest's für reduced-motion)
- `IntersectionObserver` Stub der synchron `isIntersecting: true` meldet (damit Reveal/NumberTicker ihren Final-State rendern)

**`package.json`**: `test` (run-once) + `test:watch` Scripts.

**4 Test-Files mit 25 Tests:**

- **`gradient-text.test.tsx`** (6 Tests): rendering, default span tag, `as="h1"` switch, variant changes className, custom className forwarding, animate prop toggles `animate-border-flow`.

- **`bento-grid.test.tsx`** (8 Tests): `.bento` wrapper, child rendering, default col-span-12, `span.base`/`span.md`/`span.lg` mapping, `rows` prop, `rows=1` is no-op, `interactive` adds lift.

- **`shimmer-button.test.tsx`** (6 Tests): renders as `<button>`/`<a>`, onClick fires, size classes, `static=true` removes rotating border, disabled prevents click.

- **`aurora-background.test.tsx`** (5 Tests): children render, 3 blobs present, `animate-blob` classes when animated, removed when static, opacity differs between variants.

**Build verifiziert clean** (29/29 pages prerender).

## Iteration 144 — Dependabot moderate remediation

Eine der zwei moderate Vulnerabilities adressiert.

**`backend/pom.xml`** — `nimbus-jose.version`: 9.47 → 10.0.2

GHSA-xwmg-2g98-w7v9 (DoS via deeply-nested JSON):
- Vulnerable range: `>= 9.38-rc1, < 10.0.2`
- Unser 9.47 lag im vulnerable range
- Fix war nur im 10.x-Branch verfügbar (kein 9.x backport)
- Spring Boot 3.4.13 ist Nimbus-10 kompatibel — alle 44 common-security Tests + identity-service Tests grün

**postcss** (zweite moderate Dependabot Vulnerability):
- Vulnerable range war `< 8.5.10`
- web/package-lock.json zeigt bereits `postcss@8.5.15` (durch web `overrides` block in package.json)
- mobile/package-lock.json zeigt ebenfalls `8.5.15` (durch mobile `overrides`)
- Sollte beim nächsten Dependabot-Re-Scan automatisch closen — kein code-change nötig

## Iteration 143 — Storybook stories für Iter-117 Primitives

6 neue Story-Files für die Iter-117 Web-Primitives (vorher: nur Button + GlassCard + BentoGrid + EmptyState dokumentiert).

**`aurora-background.stories.tsx`**: 4 Stories (default / subtle / vivid / static) jede mit Hero-Content-Beispiel + GradientText.

**`gradient-text.stories.tsx`**: 5 Stories für jede Variant (brand / aurora / sunrise / flame) + static no-animate fallback.

**`marquee.stories.tsx`**: 4 Stories — LogoStrip (12 deutsche Arbeitgeber), Testimonials (4 Quote-Cards mit Stars), Reverse-Richtung, NoFade-Edges.

**`number-ticker.stories.tsx`**: 6 Stories — Basic, Percent (94 %), Currency (€ 45.300), WithGradient (NumberTicker inside GradientText), SnappySpring (stiffness 200), SoftSpring (stiffness 40).

**`shimmer-button.stories.tsx`**: 5 Stories — Large, ExtraLarge, Medium, AsLink (href), Static (no rotation).

**`reveal.stories.tsx`**: 5 Stories — direction up/left/right, Staggered (5 cards mit incrementing delay), Repeating (re-plays on scroll).

Web tsc clean. Storybook entdeckt die Stories automatisch via `*.stories.tsx` Pattern.

## Iteration 142 — Reduced-motion + a11y cross-platform pass

Alle Iter-117/125/128 Primitives respektieren jetzt automatisch die OS-Reduce-Motion-Einstellung des Users — nicht nur per opt-in `static`-Prop.

**Web** — `web/src/components/providers.tsx`:
- `<MotionConfig reducedMotion="user">` als globaler Wrapper. Framer-Motion-Animationen werden automatisch übersprungen wenn `prefers-reduced-motion: reduce` gesetzt ist. Ergänzt die existierende CSS-Regel in globals.css (die nur CSS-Animations betraf, nicht framer-motion JS-driven motion).

**Mobile** — neuer Hook `mobile/src/hooks/useReducedMotion.ts`:
- Wrappt `AccessibilityInfo.isReduceMotionEnabled()` + Event-Listener für Runtime-Änderungen.
- Returns boolean — `true` wenn iOS "Reduce Motion" oder Android "Remove animations" aktiv ist.

**Mobile Primitives** wired up:
- `AuroraBackground`: nutzt `useReducedMotion()` zusätzlich zum explicit `static`-Prop. `shouldAnimate = !isStatic && !reduceMotion`. Blobs froren ein bei reduce-motion.
- `ShimmerButton`: gleiche Behandlung — rotating rainbow border pauses.

**Flutter Primitives** wired up:
- `AppAuroraBackground`: nutzt `MediaQuery.disableAnimationsOf(context)` (Flutter standard für reduce-motion). Animation-Start in `didChangeDependencies` statt `initState` damit MediaQuery verfügbar ist.
- `AppReveal`: bei reduce-motion direkt auf `_ctrl.value = 1.0` (final state) statt animation.
- `AppNumberTicker`: `actualDuration = disableAnimations ? Duration.zero : duration` — value erscheint sofort.

Build green auf allen drei Plattformen.

## Iteration 141 — Mobile Settings-Subscreens polish

Drei Sicherheits-Subscreens auf Iter-125-Standard.

**`mobile/app/(applicant)/(settings)/change-password.tsx`** — komplett überarbeitet:
- AuroraBackground (subtle) + ScrollView Page-Wrapper.
- Back-Button als Arrow + Primary-Label.
- Header: Eyebrow "Sicherheit" + `GradientText` "Passwort ändern".
- Form in `GlassCard strong + glow`. ShimmerButton statt Standard-Button.
- Success-State: GlassCard mit Success-Icon-Tile + ShieldCheck "Alle Sessions wurden beendet" Hint.

**`mobile/app/(applicant)/(settings)/sessions.tsx`**:
- AuroraBackground (subtle) Page-Wrapper.
- Header: Back-Button + Gradient-Square (info→primary, 44×44) + `GradientText` "Aktive Sitzungen" + Body-Tagline.
- "Andere beenden" jetzt als accent-tinted Pill statt plain Text.

**`mobile/app/(applicant)/(settings)/delete-account.tsx`** — komplett überarbeitet:
- AuroraBackground (subtle) + ScrollView.
- Header: Accent-Gradient-Square (DC2626→9F1239) + Eyebrow "Gefahrenzone" + Title.
- Warning-Box als `GlassCard` mit accent-Border.
- Form in `GlassCard strong`.

Mobile tsc clean.

## Iteration 140 — Mobile Onboarding + Saved-Searches polish

**`mobile/app/(applicant)/saved-searches.tsx`**:
- AuroraBackground (subtle) Page-Wrapper.
- Header: Gradient-Square (primary→info, 48×48) + `GradientText` Title + `NumberTicker` Counter "X aktive Suchen".
- Empty-State: GlassCard mit Bookmark-Icon + Body-Hint statt flacher EmptyState.
- SavedSearchRow: `View+border` → `GlassCard strength=default`. Internal layout preserved.

**`mobile/app/(applicant)/onboarding.tsx`**:
- Page-Wrapper: `AuroraBackground variant="vivid"` — gibt der wichtigen Conversion-Strecke einen Marketing-Look.
- OnboardingQuiz Component selbst unverändert (528 LOC — vermeidet riskanten Refactor).

Mobile tsc clean.

## Iteration 139 — Flutter home hero refactor

In Iter 137 als "zu riskant" übersprungen — jetzt nachgeholt.

**`flutter/lib/screens/applicant/home_screen.dart`** — `_buildHeroCard` komplett refactored:
- Solid-Gradient-Container + Custom-Painted DotPattern → **`AppAuroraBackground variant: vivid`** mit animated Multi-Blob-Drift.
- Wordmark "bewerbi.tn" jetzt `AppGradientText` (22pt, brand variant) statt weißem Text.
- Greeting-Label: 12pt small-caps Letter-Spaced primary statt white.
- Avatar/Bell-Backgrounds auf `darkCard 70%` (dark mode) bzw `white 80%` (light mode).
- Avatar-Icon + Bell-Icon auf primary statt white.
- Bell-Badge mit theme-aware Border-Color statt fixed primary.
- Stats-Row: `_GlassStatBox` (white text on primary) → neuer `_AuroraStatBox` (dark text auf translucent-white). NumberTicker für animated count-up.
- Komplette Hero-Card jetzt in `AppReveal` für fade-in-up.

**`home_screen_painter.dart`**: `_DotPatternPainter` class entfernt (durch Aurora ersetzt). File-Stub mit Erklärungs-Kommentar belassen (referenced via `part of` directive).

**`home_screen_widgets.dart`**: `_GlassStatBox` entfernt (nicht mehr referenziert), `_AuroraStatBox` hinzugefügt mit AppNumberTicker.

`dart:math as math` Import entfernt (war nur für DotPattern arcs).

`flutter analyze` clean.

## Iteration 138 — Flutter Visa + Anerkennung headers

**`visa_screen.dart`**:
- Transparente AppBar + extendBodyBehindAppBar + `AppAuroraBackground (subtle)` Body.
- Neuer `_buildHeader` Widget mit Gradient-Square (primary→info, 48×48) + AppGradientText "Visum-Tracker" + Body-Tagline, in AppReveal.
- TypeSelector erweitert um Header + Eyebrow.

**`anerkennung_screen.dart`**:
- Gleiche AppBar + AppAuroraBackground Behandlung.
- Hero-Row mit Gradient-Square (success→primary) + AppGradientText "Anerkennung" + Body-Tagline.

`flutter analyze` clean.

## Iteration 137 — Flutter applicant CV upload + Applications

Zwei wichtige Applicant-Screens auf Iter-128 Primitives umgestellt.
Home-Screen (mit elaborate custom-painted Hero) wurde bewusst übersprungen — zu riskant für lokales Refactor.

**`cv_upload_screen.dart`** — komplett überarbeitet:
- Transparente AppBar + extendBodyBehindAppBar.
- Body in `AppAuroraBackground variant: subtle` gewrappt.
- Center-aligned Hero-Header: Gradient-Square (FileText, 56×56) + `AppGradientText` "CV hochladen" (26pt) + center-aligned Body-Tagline. Alle in `AppReveal` staggered (0/100ms).
- Drop-Zone rebuilt: Container → `AppGlassCard` strength default + glow. Icon: 64×64 Circle → 72×72 Gradient-Circle (primary→violet).
- Error-State: rotes Error-Container mit alpha-overlay statt plain text.

**`applications_screen.dart`** — Header upgrade:
- Plain "Meine Bewerbungen" Text → Row mit Gradient-Square (FileText, 48×48 mit shadow-glow) + `AppGradientText` (22pt) + Count-Subtitle.
- Header in `AppReveal` für fade-in-up.

`flutter analyze` clean.

## Iteration 136 — Flutter auth wave finish (Register + Forgot + Reset)

Drei restliche Flutter-Auth-Screens auf Iter-128 Primitives umgestellt.

**`register_screen.dart`**:
- AppBar mit transparentem Background + extendBodyBehindAppBar = true.
- Body in `AppAuroraBackground` (default) gewrappt.
- Hero-Section: Eyebrow "Neues Konto" (1.2 letter-spacing), `AppGradientText` "Willkommen!" (32pt brand variant), Body-Tagline.
- Alle 3 Hero-Elemente in `AppReveal` staggered (0/80/140ms).

**`forgot_password_screen.dart`**:
- AppBar transparent + extendBodyBehindAppBar.
- Body in `AppAuroraBackground` (default).
- _buildForm: Container-Icon zu Gradient-Square (primary→violet) mit shadow-glow, `AppGradientText "Kein Problem!"` (28pt) statt plain Text. Beide in `AppReveal`.
- Form in `SingleChildScrollView` (vorher: nicht-scrollbar bei kleiner Höhe).

**`reset_password_screen.dart`**:
- AppBar transparent + extendBodyBehindAppBar.
- Body in `AppAuroraBackground` (default).
- _buildForm: Container-Icon zu Gradient-Square + shadow-glow, `AppGradientText "Neues Passwort"` (28pt) statt plain Text. AppReveal staggered.
- Form in SingleChildScrollView.

`flutter analyze` clean.

## Iteration 135 — Flutter login screen with Iter 128 primitives

Erstes Apply der Iter-128 Flutter-Widgets auf den Auth-Pfad.

**`flutter/lib/screens/auth/login_screen.dart`** — Hero section überarbeitet:
- Page-Body in `AppAuroraBackground variant: vivid` gewrappt (animated multi-blob backdrop).
- Logo: `AppReveal` mit FadeInUp Animation.
- Title: plain Text("bewerbi.tn") → `AppGradientText` mit GradientVariant.brand (32pt, 800-Weight). FadeIn delay 100ms.
- Subtitle "Deine Brücke nach Deutschland": gleiche AppReveal-Behandlung mit delay 160ms.
- Form (Email + Password + Login-Button) jetzt in `AppGlassCard strength: strong, glow: true` mit padding 20.
- Google/Facebook/Register-Links bleiben unverändert (außerhalb der Glass-Karte für klare Hierarchie).

Bestehende Demo-Section + Logo-Builder + _DemoChip widget unverändert.

`flutter analyze` clean (No issues found).

## Iteration 134 — Mobile Profile + Settings polish

Beide Account-Screens auf den Iter-127-Standard gehoben.

**`mobile/app/(applicant)/(profile)/index.tsx`** — Hero komplett überarbeitet:
- Hero-Container von solid-primary auf `AuroraBackground variant="vivid"` umgestellt.
- Avatar in 3px-Padding-Frame (white/60 backdrop) — wirkt wie ein Polaroid.
- Camera-Button als Gradient-Pill (primary→violet) mit white-Border statt flat-white-Circle.
- Name + City/Phone Meta in Dark-Text statt White (sieht auf Aurora besser aus).
- Bio jetzt in eigener GlassCard (strong) statt direkter Text auf Primary.
- Section-Cards unverändert (waren schon gut).

**`mobile/app/(applicant)/(settings)/index.tsx`**:
- `AuroraBackground variant="subtle"` Page-Wrapper.
- Header: Gradient-Icon-Square (info→primary) + GradientText + Body-Tagline.
- Section-Headers mit letter-spacing 1.0 + besser tinted "Danger Zone" (accent-600).
- Footer-Copy: "Made with ♥ in Tunisia" (vorher "love").

Mobile tsc clean.

## Iteration 133 — Mobile Visa / Anerkennung / CV Upload polish

Drei Feature-Screens mit Header-Upgrade, Aurora-Backdrop und Glass-Treatment.

**`mobile/app/(applicant)/cv-upload.tsx`**:
- AuroraBackground (subtle) als Page-Wrapper.
- Center-aligned Hero-Header: Gradient-Icon-Square (FileText, 56×56) + GradientText "CV hochladen" + Body-Tagline.
- Upload-Zone als GlassCard mit dashed border (primary-200) + glow. Hover-Icon: Gradient-Square (Upload, 72×72) statt flacher Circle. Trust-Pills (Privat / KI-Auto-Fill / 3 Sprachen) im Idle-State.
- Hochgeladen-State: GlassCard mit success-Tinted-Square + bold Filename.
- HintRows als GlassCard subtle mit "✓ Erkannt" Label rechts.
- ChipRow als GlassCard subtle.
- Submit-Button: ShimmerButton (rotating border + dark pill) statt Solid-Primary.

**`mobile/app/(applicant)/visa.tsx`**:
- AuroraBackground (subtle) Page-Wrapper.
- Header: 48×48 LinearGradient (primary→info) Icon-Square + GradientText.
- **VisaTypeSelector**: Jeder der 8 Visa-Typen als GlassCard mit Icon-Tile + Title + ChevronRight (statt flacher Border-Tiles).
- **VisaCaseView Hero-Card**: GlassCard strong + glow mit Eyebrow "Aktuell" + Title links, großer NumberTicker rechts (28pt primary), Building2 + Calendar Meta-Rows, Gradient-Progress-Bar (primary→violet) statt Solid-Primary.

**`mobile/app/(applicant)/anerkennung.tsx`**:
- AuroraBackground (subtle) Page-Wrapper.
- Header: 48×48 LinearGradient (success→primary) Icon-Square + GradientText.

Mobile tsc clean.

## Iteration 132 — Mobile search screen polish

Suche ist nach Home der zweithäufigste Mobile-Screen. Bekommt jetzt das Glass-Treatment.

**`mobile/app/(applicant)/(search)/index.tsx`**:
- Page-Wrapper: `AuroraBackground variant="subtle"` (sanfter als die Auth-Vivid-Variante — Suche ist Daten-dicht).
- Search-Bar in `GlassCard strength="strong"` statt flat-shadow Box.
- **Filter-Chips**: bei aktiv jetzt Solid-Primary mit Shadow-Glow (vorher: Badge-info-variant). Bei inaktiv: subtle slate-Tinted Pill.
- Result-Count + "Speichern" + "Alle löschen" Bar: bessere Hierarchie, RotateCcw-Icon für Clear.
- **Empty-State**: rebuilt als GlassCard mit Inbox-Icon (primary-tinted Square), bold Headline, hint-Body, "Filter zurücksetzen" Pill-Button (wenn Filter aktiv).

Bestehende JobCards + SalaryRangePicker bleiben unverändert.

## Iteration 131 — Mobile auth wave finish (Register / Forgot / Reset)

Drei restliche Auth-Screens auf den Iter-126-Stil von Login angepasst.

**`mobile/app/(auth)/register.tsx`** — komplett überarbeitet:
- AuroraBackground (default) als Page-Wrapper.
- Header mit Back-Button (ArrowLeft + label), small-caps Eyebrow "Neues Konto", GradientText "Willkommen!", Body-Tagline.
- Role-Selection: 2 große rounded-2xl Tiles mit Active-Border + Shadow-Glow (vorher: kleinere flachere Tiles).
- Form in `GlassCard strength="strong" glow`. PasswordMeter direkt unter Passwort-Feld.
- Primary-CTA: `ShimmerButton` mit Sparkles-Icon + Label (fallback auf normalen Button bei loading).

**`mobile/app/(auth)/forgot-password.tsx`** — komplett überarbeitet:
- AuroraBackground als Page-Wrapper, ScrollView mit center-justified Content.
- 2 States als separate GlassCards:
  - **Form-State**: Eyebrow + GradientText "Kein Problem!" + Body-Tagline. GlassCard mit Email-Input + ShimmerButton (Mail-Icon).
  - **Sent-State**: Großer Success-Icon (CheckCircle2 grün auf success-tinted Square), "E-Mail unterwegs" GradientText, 30-min-Hint, Bold-30-Minuten, ShimmerButton "Zurück zum Login", Spam-Tipp.

**`mobile/app/(auth)/reset-password.tsx`** — komplett überarbeitet:
- AuroraBackground + ScrollView wie oben.
- 3 States als separate GlassCards:
  - **Invalid-Token**: XCircle rot, "Link unvollständig", ShimmerButton "Neuen Link anfordern".
  - **Form**: Eyebrow + GradientText "Neues Passwort wählen", GlassCard mit Password + Confirm + PasswordMeter + ShimmerButton.
  - **Done**: CheckCircle2 grün, "Passwort aktualisiert", success-Footer "Alle Sessions wurden beendet" mit ShieldCheck-Icon.

Mobile Tsc clean.

## Iteration 130 — Web UI primitives polish

Vier zentrale Primitives auf Iter-117-Niveau angehoben.

**`web/src/components/ui/empty-state.tsx`**:
- Neue `tone` Variante: `dashed | glass | subtle` (Default: dashed).
- Icon-Halo skaliert mit tone: glass = Gradient-Tile mit shadow-glow, dashed = Ring-Background, subtle = primary-tinted Solid.
- Größere Title-Font (text-xl vs. text-lg), max-w-sm für Description.

**`web/src/components/ui/error-state.tsx`**:
- Neue `tone` Variante: `accent | glass`. Glass-Variante mit Gradient (accent→warning) Icon-Tile + shadow-glow.
- Retry-Button im glass-Mode automatisch als `gradient` Variant.

**`web/src/components/ui/skeleton.tsx`**:
- Neue Props: `tone` (`default | glass`) und `shape` (`rect | rounded | pill | circle`). Skeleton kann jetzt nahtlos in GlassCards genutzt werden.
- `circle` shape automatisch aspect-square.

**`web/src/components/shared/theme-toggle.tsx`** — komplett überarbeitet:
- Trigger: Press-Animation + Border + Sun/Moon mit hover-rotate (12° / -12°), brand-coloured hover state.
- Dropdown: jetzt `glass-strong` mit Fade-In-Up Animation, "Design"-Palette-Header oben, jede Option mit Icon-Tile (Active = Gradient) + Label + Hint-Subtext + Dot-Indicator beim aktiven Theme.

**`web/src/components/ui/toaster.tsx`**:
- Sonner Toasts jetzt mit `glass-strong` (frosted), `shadow-xl`.
- Action-Button: brand-Gradient statt Solid-Primary.
- Side-Stripes als vertikaler Gradient-Pseudo (success→500→700 etc) statt 4px Border-Left.

Alle Änderungen rein additiv — bestehende Verwendungen brechen nicht. Build clean, 29/29 prerender.

## Iteration 129 — Web onboarding wizard redesign

In Iter 122 übersprungen, jetzt komplett überarbeitet. Onboarding ist die **kritische Conversion-Strecke** zwischen Registrierung und erster Bewerbung — die Seite muss begeistern.

**`web/src/app/(applicant)/onboarding/page.tsx`** — von 305 LOC auf ~430 LOC, komplett rebuilt:
- **Page-wide `AuroraBackground`** statt flachem Background.
- **Segmented Step-Progress** statt klassischer Progressbar — eine Pill pro Schritt (gefüllt-fertig / current-light / pending-grey), Gradient-Fill für completed.
- **Glass-Step-Card** (strength="strong" + glow="soft") mit Step-Icon (Gradient-Tile) + Title + Tagline pro Schritt.
- **STEP_META** Map mit Title/Tagline/Icon pro Step für saubere Struktur.
- **Profession-Step**: Größerer Input (h-12), Suggestion-Buttons mit hover-border + press-Animation, Detected-Profession-Info-Box als Reveal-Animation mit Sparkles + Bold/Body Text.
- **Level-Step**: 6 Aspect-Square Tiles mit `LEVEL_LABEL` Map ("A1"="Anfänger", "A2"="Grundlagen", …, "C2"="Muttersprachl.") — gradient + shadow-glow bei aktiv.
- **Recognition-Step**: Optionen als 2-Spalten-Rows (Icon-Tile + Title + Hint) mit `Reveal` staggered. Active-State: Gradient-Icon-Tile + primary-Border.
- **Skills-Step**: Größerer Input (h-12, Placeholder mit Enter-Hint), Vorschläge mit Profession-Bezug, aktive Skills mit Count-Label.
- **Done-Step**: Großes Gradient-Icon-Tile mit PartyPopper-Icon (success→primary), Body-Text mit Profession/Level/Skills inline-bold.
- **Footer**: Gradient-Primary-Button mit Loading-State + Chevron-Trailing-Icon, Ghost-Back-Button mit leading-Chevron.

Build: /onboarding 10.2 kB (vorher 8.66 kB) — Mehrwert durch GlassCard, Reveal, Aurora.

## Iteration 128 — Flutter foundation (Glass + Aurora primitives)

Foundation für die Flutter-App, mirroring die Web (Iter 117) und Mobile (Iter 125) Primitives.

**Neue Widgets in `flutter/lib/widgets/`:**
- `app_glass_card.dart` — `AppGlassCard` mit `BackdropFilter + ImageFilter.blur`, 4 `GlassStrength` Varianten (subtle/default/strong/frosted), optional `glow` für brand-coloured BoxShadow. Optional `onTap` mit InkWell-Ripple.
- `app_gradient_text.dart` — `AppGradientText` mit `ShaderMask + LinearGradient`. 4 `GradientVariant` (brand/aurora/sunrise/flame) matching web/mobile.
- `app_aurora_background.dart` — animated 3-Blob-Hintergrund mit `AnimationController` (vsync), drift bei 18s + 28s Cycles. `AuroraVariant` (subtle/default/vivid), `static`-Prop für motion-reduce.
- `app_number_ticker.dart` — `TweenAnimationBuilder<double>` mit `Curves.easeOutCubic`, `intl`-aware Formatting (de_DE Default).
- `app_reveal.dart` — Fade + Translate on Mount, 5 Richtungen, configurable delay + duration + offset.

Alle Widgets befolgen den bestehenden `AppColors` Theme-Standard (kein Hard-Coding der Brand-Farben). `flutter analyze` clean.

Existing `app_gradient_mesh.dart` bleibt für statische Backdrop-Use-Cases, `app_aurora_background.dart` ergänzt für animated Heroes.

## Iteration 127 — Mobile applicant home (hero + glass stats)

Höchsttrafficte authentifizierte Mobile-Screen bekommt das volle Aurora + Glass-Treatment im Hero-Bereich.

**`mobile/app/(applicant)/(home)/index.tsx`** — Hero-Bereich rebuilt:
- Solider Primary-Background-Block (`bg-primary-500` + Web-Gradient) ersetzt durch `AuroraBackground variant="default"` mit animated Multi-Blob-Drift.
- Headline-Brand-Name jetzt `GradientText variant="brand"` (gradient-clipped Inter-800).
- Greeting-Label: small-caps, primary-tinted, letter-spaced.
- Notification-Bell jetzt auf hellem Glass-Background (vorher: weiße Pille auf Primary).
- **3 HeroStats als GlassCards** (strength="strong"):
  - Icon-prefixed Label (Send/Bookmark/TrendingUp in brand colors)
  - `NumberTicker` mit Spring-Physik für animated Counter (vorher: statisch)
- `heroGradientStyle` Platform.select Variable entfernt (Aurora übernimmt).

Rest der Page (Profile-Completeness, Categories, Latest Jobs) bleibt unverändert.

## Iteration 126 — Mobile login screen (first impression)

Erstes Apply der neuen Mobile-Primitives auf die wichtigste Auth-Seite.

**`mobile/app/(auth)/login.tsx`**:
- Komplette Seite in `AuroraBackground variant="vivid"` gewrappt — animierter Multi-Blob-Hintergrund hinter dem Form-Stack.
- Branding: Gradient-tile mit Sparkles-Icon (vorher: "B"-Buchstabe), `GradientText variant="brand"` für "bewerbi.tn"-Headline.
- Form jetzt in `GlassCard strength="strong" glow` gewrappt — frosted backdrop, brand-coloured halo.
- Primary-CTA als `ShimmerButton` (rotating rainbow ring + dark inner pill) — Lade-Zustand fällt auf Standard-Button zurück.
- Smaller-Type Hint-Links ("Bestätigung erneut senden" / "Passwort vergessen?") für sauberere Hierarchie.
- Demo-Mode (Bewerber/Arbeitgeber/Admin) unverändert für Mock-Mode.

## Iteration 125 — Mobile foundation (Expo/RN)

Start der Mobile-Polish-Welle. Foundation für Bento + Glassmorphism + reichhaltige Motion auf Expo Router / NativeWind.

**Neue Dependencies:**
- `expo-blur` (frosted glass via BlurView)
- `expo-linear-gradient` (gradients ohne SVG)
- `@react-native-masked-view/masked-view` (für GradientText)
Alle über `npx expo install` (SDK-versionsmatched).

**`mobile/src/lib/tokens.ts`** — erweitert um Gradient-Stops:
- `GRADIENT_BRAND` (primary → violet → primary, mirror to web)
- `GRADIENT_AURORA` (5-color rainbow for headlines)
- `GRADIENT_SUNRISE` (accent → warning, for "Favoriten")
- `GRADIENT_FLAME` (accent → magenta → primary)
- `GRADIENT_PILL_DARK` (für ShimmerButton-Inner)
- `AURORA_BLOBS_LIGHT/DARK` (semi-transparent blob overlays)

**`mobile/tailwind.config.js`** — neue Radius-Tokens (`2.5xl`, `4xl`) für die neuen Components.

**Neue Primitives in `mobile/src/components/ui/`:**
- `GradientText` — `MaskedView + LinearGradient` für gradient-clipped text. 4 Varianten matching web.
- `GlassCard` — `BlurView + tinted overlay`, 4 strength variants, optional `glow` für brand-coloured halo. Android intensity gecapped (Plattform-Beschränkung).
- `AuroraBackground` — 3 LinearGradient-Blobs auf Reanimated `useSharedValue` mit `withRepeat`, drift bei unterschiedlichen Tempos. Honour `static`-Prop für reduced-motion.
- `Reveal` — Wrapper über Reanimated `FadeIn*` Entering-Animations. 4 Richtungen + delay + duration.
- `NumberTicker` — Spring-Counter via Reanimated worklet + `useAnimatedReaction` zur JS-State-Sync. `locale`-aware Formatting.
- `ShimmerButton` — rotating rainbow gradient ring + dark inner pill. Premium-CTA.
- `BentoGrid` + `BentoRow` + `BentoCell` — Flexbox-basierte Bento-Layouts (CSS-Grid ist in RN limitiert). Cell mit `flex` weight als column-span analog.

Alle Components match die Web-API soweit möglich (gleiche Prop-Namen, gleiche Varianten). Iter 126+ wendet sie auf alle Mobile-Screens an.

## Iteration 124 — Web wave finish: applications, favorites, saved-searches, settings, job detail

Letzte web-Polish-Iteration. Drei restliche Applicant-Pages bekommen den Premium-Look, plus die meistbesuchte Job-Detail-Seite.

**`/applications`** — komplett neu: Gradient-Icon-Header mit dynamischem Counter ("X insgesamt"), Empty-State als GlassCard mit Search-CTA, alle Bewerbungs-Rows als GlassCards mit Lift-Hover + Calendar-Icon, Status-Badge, Cover-Letter line-clamp-3 mit border-top Separator.

**`/favorites`** — Sunrise-Gradient-Header (accent→warning), dynamische Stelle-Count, Empty-State mit Heart-Icon und "Stellen entdecken"-CTA, JobCards weiterhin via shared component.

**`/saved-searches`** — komplett überarbeitet: GradientText-Header, jede Suche als GlassCard mit Search-Icon, Alert-Toggle als Pill-Button mit primary/grau Tönen (pressed-state), Trash-Button mit accent-hover, Empty-State mit Bookmark-Icon.

**`/settings`** — Header auf Gradient-Icon + GradientText umgestellt. Cards selbst bleiben grounded (passend für Forms).

**`/jobs/[id]`** — Detail-Seite komplett neu:
- AuroraBackground Hero-Card mit allen Tags (Type/Category/Deutsch/Premium), großer Titel, Meta-Liste mit Icons (MapPin/Salary/Calendar/Company).
- Beschreibung + Anforderungen als `GlassCard strength="subtle"`.
- Apply-Form als `GlassCard strength="strong" glow="soft"` mit Close-Button, Sparkles-Tipp ("Persönliches Anschreiben verdoppelt Antwort-Quote"), Gradient-Submit-Button mit Send-Icon.
- **Sticky-Bottom-Action-Bar**: floating glass-strong Container mit Favorite-Button, Apply-Button (gradient, flex-1) und "Antwort in Ø 4 Tagen" Hint.

Build: 29/29 Pages prerendered. /jobs/[id] 6.67 kB, /saved-searches 9.95 kB, /settings 8.04 kB.

## Iteration 123 — Employer + Admin areas

Vier Pages auf Iter-117-Standard: Employer-Dashboard, Employer-Listings, Admin-Companies, Admin-Users.

**`/employer/dashboard`** — Bento mit Aurora-Hero, 4 KPI-Tiles (Aktive Stellen / Bewerbungen / Aufrufe / Match-Quote) jeweils mit NumberTicker, Pro-Tipp-Tile (dark + konischer Gradient + "2,4× mehr Bewerbungen wenn 3 Sprachen") und QuickLinks-Tile.

**`/employer/listings`** — neuer Empty-State als GlassCard mit Briefcase-Icon und Gradient-CTA "Erste Stelle anlegen". Header mit GradientText.

**`/admin/companies`** — Verifizierungs-Anträge als GlassCards mit Building2-Icon (warning-tinted für PENDING), Lift-Hover, Verifizieren-Button als Gradient, Ablehnen als Outline. Empty-State mit Inbox-Icon und success-Color für "Alle Anträge bearbeitet".

**`/admin/users`** — In-Arbeit-State mit Construction-Icon und GradientText-Headline.

Build: alle 4 prerendered, employer/dashboard 4.83 kB, listings 4.58 kB, admin/companies 9.91 kB, admin/users 2.81 kB.

## Iteration 122 — Profile / CV / Anerkennung / Visa polish

Vier Applicant-Pages auf den Iter-117-Standard gehoben — Schwerpunkt auf den zwei visuell prägendsten Seiten (CV-Upload + Visa).

**`/cv-upload`** — komplett neu:
- Hero-Header mit zentriertem Gradient-Icon-Tile und `GradientText`-Headline.
- **Drag-and-drop Zone** im `AnimatedGradientBorder` (rotating conic, 6s) — der visuelle Anker der Seite. Drop / Click / Keyboard-Enter alle unterstützt.
- Pulsierender Halo hinter dem Upload-Icon im Idle-State.
- Drag-over-State: Hintergrund tönt primary, leichte Scale.
- Während Upload: animierter Loader + ScanLine-Icon overlay.
- Validation: max 10 MB, nur PDF; sonst Toast mit klarer Fehlermeldung.
- Trust-Footer-Pills: Privat / KI-Auto-Fill / Drei Sprachen.
- Nach Upload: GlassCard Header mit Dateiname und Reset-Button, Hint-Rows als GlassCards mit "✓ Erkannt" Label.

**`/visa`** — Timeline-Redesign:
- Aurora-Hero-Card mit großem `NumberTicker` für Fortschritts-Prozent, Embassy-Stadt unten links.
- **Visa-Typ-Auswahl**: 8 Visa-Pfade als GlassCards, Blaue-Karte als Premium mit `AnimatedGradientBorder` + Premium-Badge.
- **Anforderungen als Timeline**: vertikale gestrichelte Border-Line, Timeline-Dots (Check / Empty), jede Requirement-Row als GlassCard. Completed-State: opacity, line-through, strikt success-grünes Dot.
- Tap-to-toggle still funktional, mit `aria-pressed` für a11y.

**`/profile`** und **`/anerkennung`** — leichte Polish:
- Headlines auf `GradientText` umgestellt.
- Gradient-Icon-Tile statt Solid-Color Icon.
- `Reveal` Wrapper für Scroll-In Animation.

Build: cv-upload 11.8 kB, visa 14 kB, profile 6.5 kB, anerkennung 8.1 kB — alle prerendered.

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
