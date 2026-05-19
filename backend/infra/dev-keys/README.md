# Dev RSA Keypair — Iter 107

These two files are the **dev-only** RSA keypair the suite uses to sign
+ verify JWTs locally and in CI. Generated once with:

```bash
openssl genrsa -out infra/dev-keys/jwt-private.pem 2048
openssl rsa -in infra/dev-keys/jwt-private.pem -pubout -out infra/dev-keys/jwt-public.pem
```

## Why are they checked in?

So `docker compose up` and the GitHub Actions `ci-backend` job have a
working identity-service / gateway pair without any extra setup. The
keys are **not** a security control here — anyone with access to the
public repo can read them.

## Production

**DO NOT use these in production.** Generate a fresh pair per
environment, mount the private key only on the identity-service pod
and the public key on every verifier service. See `docs/SECURITY.md`
§"Key material" for the operator runbook.

## Rotation

- Generate a new pair with the same `openssl` commands.
- Bump `bewerbi.security.jwt.key-id` (e.g. `bewerbi-2026-q3`).
- Stage: run identity-service signing with NEW key but the JWKS
  endpoint serving BOTH old + new for one refresh-token TTL.
- Then drop old.
