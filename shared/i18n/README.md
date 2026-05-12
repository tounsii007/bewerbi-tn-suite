# shared/i18n/

Seed translations for offline/CI consumers. The **i18n-service** holds the canonical copy at runtime — these files exist so that:

- Storybook stories and snapshot tests don't need a live service to render.
- The mobile/web apps have a fallback when offline at first run.
- Translators have a single readable starting point per locale.

## Format

Nested keys, dot-flattened when consumed:

```json
{ "error": { "auth.required": "…" } }
→ resolves at key "error.auth.required"
```

Reserved meta keys start with `$` (`$description`, `$schema`, etc.) and are ignored at runtime.

## Locales

| Locale | File           | Direction | Native |
|--------|----------------|-----------|--------|
| de     | `de.json`      | ltr       | Deutsch |
| fr     | `fr.json`      | ltr       | Français |
| ar     | `ar.json`      | rtl       | العربية |

Every key in `de.json` MUST exist in the other locales. A CI check (`tokens-check`-style workflow) can be wired up later to enforce this.

## How to refresh from the service

```bash
# Admin-only — pull the current snapshot for offline use.
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  http://localhost:8080/api/v1/admin/i18n/messages?locale=de \
  | jq . > shared/i18n/de.json
```
