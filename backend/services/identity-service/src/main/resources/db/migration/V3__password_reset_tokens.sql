-- Password-reset flow: short-lived single-use token stored next to the user.
-- Token is hashed (SHA-256) before persistence, so a leaked DB snapshot does
-- not let an attacker reset arbitrary accounts.
ALTER TABLE users
    ADD COLUMN password_reset_token_hash  VARCHAR(64),
    ADD COLUMN password_reset_expires_at  TIMESTAMPTZ;

CREATE INDEX idx_users_password_reset ON users (password_reset_token_hash);
