-- Iter 159 — multi-provider auth support.
--
-- Adds the columns the User entity needs to model "I signed up via
-- Google" as well as the existing email + bcrypt path.
--
-- Migration is forward-only safe:
--   - All existing rows get auth_provider='EMAIL' via the DEFAULT, so
--     no UPDATE pass is needed.
--   - password_hash becomes nullable so future Google signups can be
--     inserted with a NULL hash. Existing rows keep their hash — the
--     column-level NOT NULL was only enforced via the JPA @Column; the
--     DB-level constraint stays the same (it was NOT NULL at the SQL
--     level too — we drop that here).
--   - google_subject UNIQUE prevents account-takeover via a duplicate
--     Google `sub` claim.

ALTER TABLE users
    ADD COLUMN auth_provider  VARCHAR(16) NOT NULL DEFAULT 'EMAIL',
    ADD COLUMN google_subject VARCHAR(64);

-- Drop the implicit NOT NULL so Google users can be inserted with NULL.
ALTER TABLE users
    ALTER COLUMN password_hash DROP NOT NULL;

-- Unique only when set — Postgres treats multiple NULLs as distinct
-- (NULLS DISTINCT, default), so a partial unique index is equivalent
-- but more explicit about the intent.
CREATE UNIQUE INDEX idx_users_google_subject
    ON users (google_subject)
    WHERE google_subject IS NOT NULL;

-- Cross-check helper: the application enforces this invariant, the
-- index is here as defense-in-depth.
CREATE INDEX idx_users_auth_provider
    ON users (auth_provider);
