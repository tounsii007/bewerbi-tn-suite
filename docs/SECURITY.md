# Security Posture

Quick reference for the security controls in the suite — handy for new joiners and external audits.

## Authentication

- **JWTs**: **RSA-2048 / RS256** (Iter 107 — migrated from HS256 shared secret to address Audit Critical #1). 60-min access TTL, claims `sub, email, roles, locale, token_type=access`. The identity-service is the only signer; every other service is verify-only.
- **JWKS endpoint**: `GET /.well-known/jwks.json` on identity-service exposes the current public key with its `kid`. External consumers / future verifiers fetch it there; internal verifiers can also load the public PEM directly via `bewerbi.security.jwt.public-key-path`.
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
- **Key validation**: `RsaKeyProvider` fails app startup in the `prod` profile if `bewerbi.security.jwt.public-key-path` (verifier services) or `bewerbi.security.jwt.private-key-path` (identity-service signer) is missing. In dev, an ephemeral 2048-bit pair is auto-generated per process so local work is zero-config. The legacy `bewerbi.security.jwt.secret` property still triggers a deprecation `WARN` from `JwtSecretValidator` so it gets noticed and removed.

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

### Transport TLS (Iter 108 — Audit Critical #2)

The `prod` Spring profile demands TLS for every east-west connection. The defaults are deliberately strict so a misconfigured prod deploy fails loud instead of silently falling back to plaintext.

| Hop | Default in `prod` | Override env var |
|-----|-------------------|------------------|
| App ↔ Postgres | `sslmode=require` | `DB_SSL_MODE` (recommend `verify-full` + `DB_SSL_ROOT_CERT`) |
| App ↔ Redis | TLS on, AUTH password required | `REDIS_SSL_ENABLED`, `REDIS_PASSWORD` |
| App ↔ Kafka | `SASL_SSL` + `SCRAM-SHA-512` + `https` endpoint identification | `KAFKA_SECURITY_PROTOCOL`, `KAFKA_SASL_*`, `KAFKA_SSL_TRUSTSTORE_*` |

The dev compose stack runs plaintext on the bridge network — `compose.services.yaml` carries explicit `DB_SSL_MODE=disable` / `REDIS_SSL_ENABLED=false` / `KAFKA_SECURITY_PROTOCOL=PLAINTEXT` overrides for that. Real deploys MUST drop those overrides and provide cert material instead.

### Document storage (Iter 109 — Audit Critical #3)

Documents are the highest-value PII the suite holds — CVs, passport scans, birth certificates. The `documents-service` writes them through a `DocumentStorage` interface with two implementations:

- `FilesystemDocumentStorage` — dev / CI default. Adds a path-traversal guard on `open` and `delete` so a poisoned `storage_path` DB row can't be used to escape the upload root.
- `S3DocumentStorage` — AWS S3 / MinIO / any v4-signature S3-compatible store. Every PUT goes out with `SSE-S3` (AES256) by default and `SSE-KMS` the moment `bewerbi.documents.s3.kms-key-id` is configured. KMS is the audit-defensible option: per-object data keys wrapped by a customer-managed master key with an explicit rotation schedule and CloudTrail audit.

Switch the backend with `bewerbi.documents.storage=filesystem|s3` (env `DOCUMENTS_STORAGE`). The AWS SDK classes are only loaded when `storage=s3` is active.

The `USER_DELETED` GDPR cascade now drops blobs from storage **before** the SQL delete, fixing the orphan-binary footnote from Iter 86.

### Column-level field encryption (Iter 110 — Audit Critical #4)

A handful of fields carry PII that must survive a DB dump or logical-replica leak:

| Service | Column | Cipher |
|---------|--------|--------|
| identity | `profiles.phone` | AES-256-GCM via `EncryptedStringConverter` |
| identity | `profiles.bio`   | AES-256-GCM via `EncryptedStringConverter` |
| immigration | `visa_cases.appointment_date` | AES-256-GCM via `EncryptedLocalDateConverter` |

Ciphertext format: `gcm:v1:<base64(iv ‖ ciphertext ‖ tag)>` — 12-byte random IV, 128-bit auth tag. The `v1` version prefix lets a future migration roll keys without rewriting the whole table.

Configuration: `bewerbi.security.field-encryption.key` (env `FIELD_ENCRYPTION_KEY`) — base64-encoded 32 bytes. Generate with `openssl rand -base64 32`. The `application-prod.yml` profile refuses to start with a blank key; dev falls back to a deterministic stub key + a loud `WARN`.

Forward-compatibility: the decryptor passes anything **without** the `gcm:v1:` prefix through unchanged. Pre-Iter-110 plaintext rows therefore stay readable; the next save re-encrypts them, so the table heals naturally over time.

Trade-off: range/ordering queries on the encrypted column stop working at the SQL level (non-deterministic IV per write → repeated values produce distinct ciphertext). For the three encrypted columns this is acceptable — the app reads them back into Java and filters there. Encryption is opt-in per column (no `@Converter(autoApply = true)`) precisely so that wide-table queries on un-flagged columns stay indexable.

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
