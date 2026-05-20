-- Iter 110 — Critical #4: column-level PII encryption.
--
-- Widen phone + bio to accommodate AES-GCM ciphertext base64 +
-- "gcm:v1:" prefix. Rough rule: ciphertext ≈ plaintext * 1.36 + 45.
--   phone:  32 plaintext  →  ~89  ciphertext  → 512 with headroom
--   bio:   2000 plaintext → ~2767 ciphertext  → 4096 with headroom
--
-- The encryption happens transparently in JPA's AttributeConverter
-- (EncryptedStringConverter). Existing rows stored as plaintext stay
-- readable — the decryptor passes anything without the "gcm:v1:"
-- prefix through untouched, so the migration is forward-compatible
-- without a one-shot rewrite. The next write to each row produces a
-- ciphertext value, so the table heals itself naturally over time.
-- Operators who want to enforce encryption immediately should run a
-- one-shot script that re-saves every Profile via the JPA layer.

ALTER TABLE profiles ALTER COLUMN phone TYPE VARCHAR(512);
ALTER TABLE profiles ALTER COLUMN bio   TYPE VARCHAR(4096);
