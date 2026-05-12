# shared/

Plattform-agnostische Ressourcen, die alle Clients und das Backend verwenden:

- `tokens/`     — Design-Tokens (Farben, Spacing, Radius, Typography) als JSON
- `schemas/`   — JSON-Schemas für API-Payloads (Single Source of Truth)
- `constants/` — Locale-Codes, Status-Enums, URL-Helpers

> Keine plattformspezifischen Abhängigkeiten. Pure JSON / TypeScript-`as const`-Module.
