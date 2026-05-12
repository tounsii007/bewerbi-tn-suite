# Runbook — bewerbi.tn

Operativer Quickreference. Wenn um 3 Uhr nachts der Pager geht.

## Health-Probes

| URL                              | Erwartung                          |
|----------------------------------|------------------------------------|
| `/actuator/health`              | `{"status":"UP"}`                  |
| `/actuator/health/liveness`     | `200` — Prozess lebt               |
| `/actuator/health/readiness`    | `200` — bereit für Traffic         |
| `/actuator/buildinfo`           | `{ commit, version, uptimeSec }`   |
| `/actuator/prometheus`          | Metrics — nur `ROLE_ADMIN`         |

## Korrelations-Id finden

Jede Response hat `X-Correlation-Id`. Aus dem Client-Bug-Report die Id heraussuchen, dann:

```bash
# Logs in Loki / Elastic
{app="bewerbi"} |= "corr=<correlation-id>"
```

## Häufige Symptome

### „Login schlägt fehl ohne Fehler"

1. **Rate-Limit**: `Retry-After`-Header im Response. Gateway-Bucket: 5 rps burst 10 für
   `/auth/login`.
2. **Brute-Force-Lockout**: Per-Account. Redis-Key `auth:lock:<email-lowercase>`. TTL ablesen:
   `redis-cli ttl auth:lock:user@example.com`. Sofort entsperren: `redis-cli del auth:lock:…`.
3. **Falsches JWT-Secret**: In Logs des identity-service nach `JwtSecretValidator` suchen —
   würde beim Start fail-fast schreien.

### „Cards laden ewig"

1. Slow-Request-Log: `{logger="slow.request"} |= "<endpoint>"`.
2. Histogramm in Prometheus: `histogram_quantile(0.95, http_server_requests_seconds_bucket{uri="/api/v1/jobs"})`.
3. DB-Pool: `hikaricp_connections_active{pool="<service>-hikari"}` — bei Sättigung anhebt sich
   die `pending` Latenz.

### „Backups: Postgres voll"

1. Größte Tabellen finden: siehe `docs/POSTGRES_QUERIES.md`.
2. Old Audit-Rows: `documents.*` Uploads sind oft die Hauptquelle. Retention-Policy: Originale > 90 Tage in S3 archivieren.

### „Kafka-Lag steigt"

```
docker exec -it bewerbi-kafka /opt/bitnami/kafka/bin/kafka-consumer-groups.sh \
  --bootstrap-server localhost:9092 --describe --all-groups
```

Lag > 1000 sustained = Consumer-Probleme. Lookup: notification-service, matching-service.

## Skalierung

- **identity-service**: stateless, horizontal skalierbar
- **i18n-service**: stateless, aggressiv cached in Redis + L1
- **jobs-service**: stateless, cache-heavy für Search
- **matching-service**: stateless, aber CPU-bound — beachte
- **notification-service**: outbound nur — KafkaConsumer parallel processing aktivieren

Postgres läuft single-instance; Read-Replica vorbereiten sobald Read-QPS > 500.

## Roll-back

```bash
kubectl rollout undo deployment/<service-name>
```

Alle Migrations sind Flyway-versioniert und additive (keine destructive drops). Ein
Roll-back der Anwendung ist sicher; ein Roll-back der **Migration** muss manuell sein.

## Wo finde ich Sachen

| Frage                          | Ort                                                            |
|--------------------------------|----------------------------------------------------------------|
| Architektur                    | [`docs/ARCHITECTURE.md`](ARCHITECTURE.md)                       |
| API-Vertrag                    | [`docs/API.md`](API.md), [`shared/schemas/*.json`](../shared/schemas/) |
| Security-Posture               | [`docs/SECURITY.md`](SECURITY.md)                               |
| Contribution-Flow              | [`docs/CONTRIBUTING.md`](CONTRIBUTING.md)                       |
| Was hat sich geändert?         | [`docs/CHANGELOG.md`](CHANGELOG.md)                             |
| Onboarding-Setup               | `bash scripts/setup-all.sh`                                    |
