# API — bewerbi.tn

REST über das Gateway auf `:8080`. Alle Pfade beginnen mit `/api/v1/`. Versionierung über den
Pfad-Major; Breaking-Changes erhöhen `v1 → v2`.

## Authentifizierung

```http
Authorization: Bearer <accessToken>
Accept-Language: de
X-Correlation-Id: <client-supplied-uuid>          # optional, sonst generiert
Idempotency-Key:  <uuid>                          # optional, nur POST/PUT/PATCH
```

Tokens kommen aus `POST /api/v1/auth/login`. Access-Token gilt 60 min; Clients refreshen
proaktiv 60 s vor `accessTokenExpiresAt` via `POST /api/v1/auth/refresh`.

## Fehler

Alle Fehlerantworten folgen dem [`ApiError`](../shared/schemas/api-error.schema.json)-Envelope:

```json
{
  "status": 400,
  "code": "VALIDATION_FAILED",
  "message": "Request validation failed",
  "messageKey": "error.validation.failed",
  "violations": [
    { "field": "email", "message": "must be a well-formed email address", "messageKey": "error.validation.email" }
  ],
  "path": "/api/v1/auth/register",
  "traceId": "abc1234567890",
  "timestamp": "2026-05-12T18:00:00.000Z"
}
```

Clients nutzen `code` für Programmlogik, `messageKey` für die Übersetzung (Lookup via i18n-Service),
`traceId` für Bug-Reports.

| Code                  | Status | Bedeutung                                    |
|-----------------------|--------|----------------------------------------------|
| `VALIDATION_FAILED`   | 400    | `@Valid` schlug fehl                         |
| `MALFORMED_JSON`      | 400    | Body parse-fehlerhaft                        |
| `MISSING_PARAMETER`   | 400    | Erforderlicher Query-Param fehlt             |
| `TYPE_MISMATCH`       | 400    | Query/Path-Param hat falschen Typ            |
| `UNAUTHORIZED`        | 401    | Token fehlt/ungültig/abgelaufen              |
| `FORBIDDEN`           | 403    | Eingeloggt, aber keine Berechtigung          |
| `NOT_FOUND`           | 404    | Ressource gibt's nicht                       |
| `METHOD_NOT_ALLOWED`  | 405    | HTTP-Method nicht erlaubt (`Allow:`-Header)  |
| `PAYLOAD_TOO_LARGE`   | 413    | Upload zu groß                               |
| `UNSUPPORTED_MEDIA_TYPE` | 415 | `Content-Type` nicht akzeptiert              |
| `CONFLICT`            | 409    | Domain-Konflikt (z.B. Email schon vergeben)  |
| `DATA_INTEGRITY`      | 409    | DB-Constraint verletzt                       |
| `STALE_RESOURCE`      | 409    | Optimistic-Lock — neu laden                  |
| `UNPROCESSABLE_ENTITY`| 422    | Body korrekt, Business-Rule schlägt fehl     |
| `TOO_MANY_REQUESTS`   | 429    | Rate-Limit; `Retry-After`-Header gesetzt     |
| `INTERNAL_ERROR`      | 500    | Unerwartet — `traceId` ans Support-Team      |
| `SERVICE_UNAVAILABLE` | 503    | Downstream-Service nicht erreichbar          |

## Idempotenz

POST/PUT/PATCH können `Idempotency-Key: <uuid>` mitliefern. Innerhalb von 24h liefert der
Server bei gleichem Key die gecachte Antwort (Status + Body) zurück und setzt
`X-Idempotent-Replayed: true`. 5xx werden **nicht** gecacht.

```http
POST /api/v1/applications HTTP/1.1
Idempotency-Key: 7f3c1c8e-9c2a-4d3d-8f1f-2c5f7e9a8b0e
Content-Type: application/json

{ "jobId": "…", "coverLetter": "…" }
```

## Rate-Limits

| Endpoint                              | Bucket               |
|---------------------------------------|----------------------|
| Default                               | 60 rps burst 120 pro User/IP |
| `/auth/login`, `/auth/register`, `/auth/refresh` | 5 rps burst 10 (Credential-Stuffing-Schutz) |

Plus Per-Account Brute-Force: 10 Login-Failures / 10 min → 15 min Lockout für die spezifische E-Mail.

## Correlation-Id

Jede Response trägt `X-Correlation-Id`. Wenn der Client den Header in der Request mitschickt,
verwendet der Server diesen — sonst wird einer generiert. Alle Service-Logs taggen die
Zeile mit dieser Id (`MDC.correlationId`), sodass eine User-Action durch alle Services hindurch
nachvollziehbar bleibt.

## Pagination

Listen-Endpoints nutzen Spring Data Pageable-Konvention:

```
GET /api/v1/jobs?page=0&size=20&sort=publishedAt,desc&q=pflege
```

Response:

```json
{
  "content": [...],
  "totalElements": 142,
  "totalPages": 8,
  "number": 0,
  "size": 20
}
```

## Felder die optional sind

Felder die mit `null`-erlaubt im Schema sind, dürfen vom Server weggelassen werden — Clients
behandeln Abwesenheit semantisch wie `null`. Das hält Payloads klein.

## Vollständige OpenAPI

- Gateway-Aggregat: <http://localhost:8080/docs>
- Pro Service: `http://localhost:808X/swagger-ui` (`identity` → 8081, `i18n` → 8181, `jobs` → 8082, …)
