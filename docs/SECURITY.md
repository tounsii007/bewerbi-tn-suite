# Security Posture

Quick reference for the security controls in the suite — handy for new joiners and external audits.

## Authentication

- **JWTs**: HMAC-SHA256, 60-min access TTL, claims `sub, email, roles, locale, token_type=access`.
- **Refresh-Tokens**: Redis-keyed (`auth:refresh:<userId>:<sha256>`), TTL = refresh-TTL. Plaintext never persisted. Stored alongside `createdAt|lastUsedAt|userAgent` for the active-sessions UI.
- **Refresh-Token reuse detection** (RFC 6819 §5.2.2.3): when `/refresh` sees a JWT whose signature is valid but whose hash is missing from Redis — i.e. has already been rotated — *every* refresh token of the user is revoked. The legitimate client and the attacker are both forced to re-authenticate.
- **Logout**: revokes the supplied refresh token; `/logout-all` clears every refresh hash for the user (used by password reset).
- **Active sessions**: `GET /me/sessions` lists per-device entries (one per refresh hash with createdAt + lastUsedAt + UA); `DELETE /me/sessions/{hash}` revokes one.
- **Password reset**: `POST /password/forgot` always returns 204 (no enumeration). Token is 32-byte random; SHA-256 stored with 30-min TTL; per-account email throttle. `POST /password/reset` rotates the password and revokes every session.
- **Password change**: `POST /password/change` requires the current password (equal-time bcrypt), enforces strength, then revokes every session.
- **Email verification**: same hashed-token pattern as password reset. Plain token delivered via the `UserRegistered` Kafka event; only the hash lives in the DB.
- **Password strength**: backend rejects score < 2 via `PasswordStrength.evaluate()` (shared/lib/password-strength.{ts,dart} + the Java port). Web/mobile/Flutter each ship a live meter that runs the same rubric, so what scores green client-side will also pass the 422 gate.
- **Equal-time login**: `AuthService.login()` runs bcrypt against a `DUMMY_HASH` when the account is missing, so an attacker cannot enumerate accounts via response-latency differences.
- **Per-account lockout**: `LoginAttemptTracker` wired into `AuthService.login` — 10 failures / 10 min triggers a 15-min lockout (tunable via `bewerbi.security.login.*`). 429 with `Retry-After`.
- **Secret validation**: `JwtSecretValidator` fails app startup if the secret is blank, < 32 bytes, or matches the well-known dev default and the `prod` profile is active.

## Authorization

- `oauth2ResourceServer.jwt()` is wired into the default `SecurityFilterChain`. Public routes must be declared explicitly per service.
- Method-level: `@PreAuthorize("hasRole('ADMIN')")` and friends — `@EnableMethodSecurity` is on in `JwtSecurityConfig`.
- Actuator: probes are public; `prometheus/metrics/loggers/env/beans/configprops` require `ROLE_ADMIN` and should be blocked at the cluster ingress for external traffic.

## Rate limiting

- Gateway global: 60 rps burst 120 per user (Redis-backed Spring Cloud Gateway limiter).
- Auth-specific bucket: 5 rps burst 10 on `/auth/login`, `/auth/register`, `/auth/refresh`, `/auth/password/forgot`, `/auth/password/reset`, `/auth/password/change`. The change endpoint is included even though it's authenticated — a stolen access token could otherwise rotate the password unboundedly.
- Per-account brute-force: `LoginAttemptTracker` — 10 failures / 10 min → 15 min lockout. Layered on top of the global rate limiter.

## CORS

- Explicit origin patterns (`bewerbi.security.cors.allowed-origins`).
- Explicit allowed-headers list — no wildcard with credentials.
- Exposed headers: `Content-Language`, `X-Correlation-Id`, `Retry-After`.

## Defense-in-depth headers

`SecurityHeadersFilter` / `SecurityHeadersWebFilter` set on every response:

| Header | Value |
|--------|-------|
| Strict-Transport-Security | `max-age=31536000; includeSubDomains` |
| X-Content-Type-Options | `nosniff` |
| X-Frame-Options | `DENY` |
| Referrer-Policy | `strict-origin-when-cross-origin` |
| Permissions-Policy | `geolocation=(), camera=(), microphone=(), payment=(), usb=()` |
| Cross-Origin-Opener-Policy | `same-origin` |
| Cross-Origin-Resource-Policy | `same-site` |
| Content-Security-Policy | configurable per service via `bewerbi.security.headers.csp` |

## Logging & audit

- All log lines tagged with `traceId`, `spanId`, `correlationId`, `path`, `method`, `userId` via MDC.
- Audit-specific events flow through `tn.bewerbi.audit` (separate logger → downstream routes to long-retention index). Auto-enriched with IP (`X-Forwarded-For` aware) + User-Agent of the current request.
- **PII redaction in logs**: `PiiMaskingConverter` (logback `%mskmsg`) masks emails (`a***@example.com`), Bearer headers (`Bearer ***`), JWT-shaped strings, and hex tokens (≥ 32 chars). Wired into both the dev console pattern and the prod JSON layout.
- Errors never leak stack traces to clients (`GlobalExceptionHandler` returns `ApiError`).
- 5xx responses log with `ERROR`; 4xx log at `DEBUG`.
- **Prod profile** disables `server.error.*` content, the whitelabel error page, Swagger UI, and `/v3/api-docs`. Actuator exposure trimmed to `health,info,prometheus`.

## Data protection

- Schema-per-service in Postgres; no cross-schema FKs.
- Passwords: BCrypt strength 12 (Spring default for new `BCryptPasswordEncoder()` is 10 — override per service).
- Refresh tokens hashed before storage (SHA-256 of the random token).
- Password-reset + email-verification tokens hashed before storage; plain values travel only via Kafka event → notification-service.
- PII columns annotated in DB; export pipeline (out of scope for this doc) honours that.

## Client-side hardening

- **Web**: per-request **nonce-based CSP** (middleware drops `unsafe-inline`/`unsafe-eval` in prod). `safeRedirectPath()` guards against open redirects on `/login?redirect=...`. Auth pages emit `<meta name="robots" content="noindex">`. `/reset-password` and `/verify` set `referrer="no-referrer"` so the `?token=…` can't leak via `Referer`. 20-min idle-timeout auto-logout with cross-tab sync.
- **Mobile (Expo / RN)**: refresh + access tokens persisted via **expo-secure-store** (iOS Keychain / Android EncryptedSharedPreferences). Legacy AsyncStorage entry wiped on first launch.
- **Flutter**: tokens persisted via **flutter_secure_storage**. Android `network_security_config.xml` rejects cleartext + user CAs in release; iOS `NSAppTransportSecurity` disables `NSAllowsArbitraryLoads`.

## CI security scanning

- `.github/workflows/security-scan.yml` — nightly + every push:
  - **Trivy** filesystem scan (HIGH/CRITICAL, fix-available only) across Maven, npm, pubspec deps and IaC. SARIF uploaded to GitHub Code Scanning.
  - **Gitleaks** secrets scan with full-history fetch.

## Account lifecycle

- **New-device sign-in** (`KnownDeviceTracker` + `NEW_DEVICE_SIGN_IN` Kafka event) — first login from a fresh (IP, UA) fingerprint emits a "new sign-in detected" mail with device + IP + deep-link to `/settings`. 180-day TTL per fingerprint, refresh-on-use, so a device that vanishes for half a year is "new" again.
- **GDPR right-to-erasure** (`POST /api/v1/auth/me/delete`) — authenticated, password-confirmed. Wipes Redis refresh tokens + lockout state + known-device fingerprints, deletes the user row, emits `USER_DELETED` for downstream services to anonymise their copies. Audited as `AUTH_ACCOUNT_DELETED` while the email is still resolvable.
- **Audit categories** (extending the list in `AuditEvent.java`): `AUTH_LOGIN_SUCCESS`, `AUTH_LOGIN_FAILED`, `AUTH_LOGIN_LOCKED`, `AUTH_PASSWORD_RESET_REQUESTED`, `AUTH_PASSWORD_CHANGED`, `AUTH_TOKEN_REFRESH`, `AUTH_REFRESH_REUSE_DETECTED`, `AUTH_LOGOUT`, `AUTH_LOGOUT_ALL`, `AUTH_REGISTER`, `AUTH_EMAIL_VERIFY` (success/failure), `AUTH_EMAIL_VERIFY_RESEND`, `AUTH_SESSION_REVOKED`, `AUTH_OTHER_SESSIONS_REVOKED`, `AUTH_NEW_DEVICE_SIGN_IN`, `AUTH_ACCOUNT_DELETED`.

## Reporting

Found a vulnerability? Email `security@bewerbi.tn`. Please don't open a public issue.
