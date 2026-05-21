-- Iter 159 — persisted login history.
--
-- Complements the Kafka audit stream with a per-user log queryable
-- straight from Postgres. The UI uses this for the "active sessions
-- + recent activity" page; ops uses it for credential-stuffing
-- forensics.

CREATE TABLE login_attempts (
    id              UUID         PRIMARY KEY,
    -- Nullable: cleared by GDPR cascade or when the attempted email
    -- doesn't match any user (brute-force probe).
    user_id         UUID         REFERENCES users (id) ON DELETE SET NULL,
    -- Always recorded — even for unknown emails — so security can see
    -- enumeration patterns.
    email           VARCHAR(255) NOT NULL,
    method          VARCHAR(16)  NOT NULL,
    success         BOOLEAN      NOT NULL,
    failure_reason  VARCHAR(60),
    ip              VARCHAR(64),
    user_agent      VARCHAR(500),
    occurred_at     TIMESTAMPTZ  NOT NULL
);

-- "My activity" view (per-user, most-recent-first).
CREATE INDEX idx_login_attempts_user_time
    ON login_attempts (user_id, occurred_at DESC)
    WHERE user_id IS NOT NULL;

-- Security: spike detection per email (credential-stuffing on a single
-- account) — already covered in Redis for short windows, this index
-- supports long-tail historical queries.
CREATE INDEX idx_login_attempts_email_time
    ON login_attempts (email, occurred_at DESC);

-- Security: spike detection per IP.
CREATE INDEX idx_login_attempts_ip_time
    ON login_attempts (ip, occurred_at DESC)
    WHERE ip IS NOT NULL;

-- For the retention job (delete rows older than N days).
CREATE INDEX idx_login_attempts_occurred_at
    ON login_attempts (occurred_at);
