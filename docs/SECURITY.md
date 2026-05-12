# Security Posture

Quick reference for the security controls in the suite — handy for new joiners and external audits.

## Authentication

- **JWTs**: HMAC-SHA256, 60-min access TTL, claims `sub, email, roles, locale, token_type=access`.
- **Refresh-Tokens**: Redis-keyed (`auth:refresh:<userId>:<sha256>`), TTL = refresh-TTL. Plaintext never persisted. Reuse → reject.
- **Logout**: revokes the supplied refresh token; `/logout-all` clears every refresh hash for the user (used by password reset).
- **Secret validation**: `JwtSecretValidator` fails app startup if the secret is blank, < 32 bytes, or matches the well-known dev default and the `prod` profile is active.

## Authorization

- `oauth2ResourceServer.jwt()` is wired into the default `SecurityFilterChain`. Public routes must be declared explicitly per service.
- Method-level: `@PreAuthorize("hasRole('ADMIN')")` and friends — `@EnableMethodSecurity` is on in `JwtSecurityConfig`.
- Actuator: probes are public; `prometheus/metrics/loggers/env/beans/configprops` require `ROLE_ADMIN` and should be blocked at the cluster ingress for external traffic.

## Rate limiting

- Gateway global: 60 rps burst 120 per user (Redis-backed Spring Cloud Gateway limiter).
- Auth-specific bucket: 5 rps burst 10 on `/auth/login`, `/auth/register`, `/auth/refresh`.
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
- Audit-specific events flow through `tn.bewerbi.audit` (separate logger → downstream routes to long-retention index).
- Errors never leak stack traces to clients (`GlobalExceptionHandler` returns `ApiError`).
- 5xx responses log with `ERROR`; 4xx log at `DEBUG`.

## Data protection

- Schema-per-service in Postgres; no cross-schema FKs.
- Passwords: BCrypt strength 12 (Spring default for new `BCryptPasswordEncoder()` is 10 — override per service).
- Refresh tokens hashed before storage (SHA-256 of the random token).
- PII columns annotated in DB; export pipeline (out of scope for this doc) honours that.

## Reporting

Found a vulnerability? Email `security@bewerbi.tn`. Please don't open a public issue.
