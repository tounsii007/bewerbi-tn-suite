-- Iter 110 — Critical #4: column-level PII encryption.
--
-- visa_cases.appointment_date carries when a worker is scheduled to
-- visit which embassy — a row that's individually identifying and
-- has obvious value to anyone targeting that worker. Encrypt at the
-- application layer with AES-GCM.
--
-- Change the column type from DATE to VARCHAR(120) so the base64
-- ciphertext blob fits. Pre-Iter-110 rows held an ISO date in a DATE
-- column; we convert them in place to the ISO-8601 string
-- representation, which the EncryptedLocalDateConverter recognizes
-- as legacy plaintext (no "gcm:v1:" prefix) and passes through.
-- The next save re-encrypts.

ALTER TABLE visa_cases
    ALTER COLUMN appointment_date TYPE VARCHAR(120)
    USING TO_CHAR(appointment_date, 'YYYY-MM-DD');
