# shared/lib/

Platform-agnostic *logic* shared by every client and the backend. Unlike
`tokens/`, `schemas/`, and `constants/` (data), this folder contains
small pure functions that must produce **identical results** in TS, Dart
and Java.

Each file follows the same pattern:

| File                                | Used by                                       |
|-------------------------------------|-----------------------------------------------|
| `password-strength.ts`              | web, mobile, scripts/tests                    |
| `password_strength.dart`            | flutter                                       |
| `PasswordStrength.java`             | backend (identity-service)                    |
| `password_strength.test.ts`         | parity oracle — drives the Dart + Java tests  |

The TypeScript file is the canonical source. When you change it, run

```bash
node scripts/check-password-strength-parity.mjs
```

(planned) to verify the Dart + Java ports return the same score for
every fixture in `password_strength.test.ts`.
