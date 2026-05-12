# shared/

Platform-agnostic resources used by **all** clients and the backend.

```
shared/
├── tokens/          Design tokens (JSON, Design Token Format)
│   ├── colors.json
│   ├── spacing.json
│   ├── radius.json
│   ├── motion.json
│   ├── index.json   Aggregate index (refs the others)
│   └── dist/        Generated TS bundle (do not edit)
├── schemas/         JSON Schemas — API payload contracts
│   ├── api-error.schema.json
│   ├── user.schema.json
│   ├── job.schema.json
│   └── auth.schema.json
└── constants/       Static reference data
    ├── locales.json
    ├── german-levels.json
    └── application-status.json
```

## Source-of-truth flow

```
shared/tokens/*.json
   └── scripts/sync-tokens.mjs
        ├── shared/tokens/dist/tokens.ts              (consumable by any TS project)
        ├── mobile/src/lib/generated-tokens.ts        (Expo/RN ad-hoc styles)
        ├── web/src/lib/generated-tokens.ts           (Next.js consumers)
        └── flutter/lib/app/theme/app_generated_tokens.dart  (Dart constants)
```

After editing any token JSON file, run:

```bash
node scripts/sync-tokens.mjs
```

Generated files have a `AUTO-GENERATED` header and live alongside hand-authored theme code. The hand-authored `globals.css`, `app_colors.dart`, and `tailwind.config.js` are *not* overwritten — they reference the generated constants when they need raw values, but keep their hand-tuned annotations (utility classes, dark-mode CSS, MD3 ColorScheme).

## Schemas

JSON Schemas (Draft 2020-12) define the canonical wire format for cross-service payloads. Use them with:

- **Backend** — load via Spring Boot's `org.springframework.boot:spring-boot-starter-validation` plus the JSON-schema-validator plugin in CI to ensure your DTOs match the schema.
- **TS clients** — generate types with [`json-schema-to-typescript`](https://github.com/bcherny/json-schema-to-typescript) (or use as-is for runtime validation with `ajv`).
- **Flutter** — generate Dart classes with [`quicktype`](https://quicktype.io).

## Constants

Plain reference data. Mirror anything that changes via the i18n-service (locales, German-levels) rather than the static files when you need the latest copy at runtime — these JSONs are for build-time defaults.
