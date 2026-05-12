# bewerbi.tn — Web

Desktop-Web-App für bewerbi.tn, bindet dasselbe Microservices-Backend wie die
Flutter/Expo-App ein und teilt sich die Design-Tokens für Pixel-Parität.

## Stack

- **Next.js 15** (App Router, React 19, Turbopack)
- **TypeScript 5** mit `strict` + `noUncheckedIndexedAccess`
- **Tailwind CSS 4** — Design-Tokens identisch zur Flutter-App
- **shadcn/ui** auf Radix UI primitives
- **TanStack Query 5** — Server-Cache, Mutations, Optimistic Updates
- **Zustand** — Client-State (Auth, Theme, Locale) mit localStorage-Persistenz
- **React Hook Form + Zod** — typsichere Formular-Validierung
- **Sonner** — Toasts
- **Lucide** — Icons (gleicher Satz wie Flutter)

## Sicherheits-Modell

```
Browser ──► Next.js Edge Middleware
            │
            ├─ Public routes (/, /login, /register, /verify, /jobs/…)
            ├─ Protected routes (/dashboard, /profile, /anerkennung, …)
            │  ── liest HttpOnly `bewerbi.session` Cookie
            │  ── leitet ohne Cookie zu /login?redirect=…
            ├─ Employer routes (/employer/…) → Session-Rolle muss EMPLOYER/ADMIN
            └─ Admin routes    (/admin/…)    → Session-Rolle muss ADMIN
            │
            ▼ /api/…  Rewrite zu
      Spring Cloud Gateway (http://localhost:8080)
```

- **JWT-Access-Token** liegt in `localStorage` (nur für clientseitige Fetches).
- **Session-Cookie** (HttpOnly, SameSite=Strict, Secure in Prod) mirrort
  `{ userId, role }` + Ablaufzeit — dient der Middleware als Auth-Signal.
- **Auto-Refresh**: 60 s vor Access-Token-Ablauf startet ein Timer und holt ein
  neues Token. Parallele Requests werden in einer einzigen Refresh-Promise
  gecoalesced. Bei 401 wird einmalig transparent nachgeladen und der
  ursprüngliche Call wiederholt.
- **CSP / CSRF**: Strikte Content-Security-Policy, `X-Frame-Options: DENY`,
  `Referrer-Policy: strict-origin-when-cross-origin`, CSRF-immun durch
  SameSite-Cookie + Bearer-Auth.

## Design-Parität zur Flutter-App

| Token | Flutter | Web |
|---|---|---|
| Primary | `#2563EB` | `var(--color-primary-500)` |
| Accent (Rot) | `#DC2626` | `var(--color-accent-500)` |
| Success | `#16a34a` | `var(--color-success-500)` |
| Radii pill | `24px` | `var(--radius-pill)` |
| Shadow md | `0 2px 8px rgba(0,0,0,0.06)` | `var(--shadow-md)` |
| Font (LTR) | Inter | Inter (`next/font/google`) |
| Font (AR)  | Cairo | Cairo (`next/font/google`) |

Die Job-Karte hat denselben Aufbau (farbiger Accent-Balken oben, Badges,
Favoriten-Pille rechts, Meta-Row mit Location/Salary/Zeit), die
`ProfileCompletenessCard` zeigt Tier-Emoji + Progress + Next-Action,
der Onboarding-Flow führt durch dieselben 4 Schritte.

## Features (vollständig implementiert)

**Auth & Accounts**
- Login, Register mit Role-Choice (Applicant / Employer)
- E-Mail-Bestätigung via `/verify?token=…`
- Logout (aktuelles Gerät) + Logout-All-Devices
- Auto-Refresh des JWT, Middleware-Schutz

**Applicant-Flows**
- Dashboard mit Stats, Kategorien, Empfehlungen, neueste Stellen
- Such-Seite mit Debounced-Query, Filter-Panel (Kategorie, Art, Standort,
  Deutsch-Niveau, Mindestgehalt), Save-Search, Favoriten-Toggle
- Job-Detail mit Apply-Flow (Anschreiben)
- Bewerbungen-Liste mit Status-Badge
- Favoriten-Grid
- Profil-Edit + Vollständigkeits-Karte (`nextAction`-Prompt)
- Onboarding-Quiz (4 Schritte, Profession-Autocomplete via i18n-Service,
  Regulation-Branching, Skill-Vorschläge, Done-Screen mit 🎉)
- Anerkennungs-Assistent (6-Step-Stepper mit Progress-Bar)
- Visum-Tracker (8 Visa-Typen, typ-spezifische Checklisten)
- CV-Upload mit Auto-Fill-Hints
- Saved-Searches mit Alert-Frequency-Toggle
- Firmen-Seite `/company/[slug]` mit VerifiedBadge + Bewertungen
- Settings (Sprache, Theme, Legal, Logout-All)

**Employer**
- Dashboard mit KPI-Kacheln
- Listings-Liste + Create-Formular (Title, Kategorie, Art, Gehalt, Deutsch,
  Beschreibung, Anforderungen)

**Admin**
- User-Übersicht (Platzhalter)
- Company-Verifikations-Queue mit Verifizieren / Ablehnen

**i18n**
- 3 Sprachen (DE / FR / AR) im Client-Dictionary
- Locale-aware `Accept-Language` in jedem API-Call
- RTL-Flip für AR (`<html dir="rtl">`)
- Language-Switcher im TopBar mit Flaggen + nativen Labels
- Persistent in `localStorage` + optional im Profile am Server

## Entwicklung

```bash
cd C:/projects/bewerbi-tn-web
cp .env.example .env.local
npm install
npm run dev
# → http://localhost:3000 (Next)
# → Proxy zu Gateway http://localhost:8080
```

Alle `/api/*`-Calls werden vom Next-Dev-Server zum Java-Gateway weitergereicht
(siehe `next.config.ts`). Keine CORS-Konfiguration nötig.

### Voraussetzungen

1. Backend läuft lokal: `cd ../bewerbi-tn-backend && ./mvnw install -DskipTests && docker compose -f compose.yaml -f compose.services.yaml up --build`
2. Node.js 20+ installiert.

## Verzeichnisstruktur

```
src/
├── app/
│   ├── (applicant)/          # Route-Gruppe mit Sidebar-Shell
│   │   ├── dashboard, search, applications, favorites,
│   │   ├── profile, onboarding, anerkennung, visa,
│   │   ├── cv-upload, saved-searches, company/[slug],
│   │   ├── settings
│   │   └── jobs/[id]
│   ├── (employer)/employer/  # Dashboard + Listings + Create
│   ├── (admin)/admin/        # Users + Companies
│   ├── api/session/          # HttpOnly-Cookie-Endpoint
│   ├── login, register, verify
│   ├── layout.tsx            # Font-loading + Providers
│   ├── globals.css           # Design-Tokens
│   └── page.tsx              # Landing
├── components/
│   ├── ui/                   # Button, Card, Badge, Input, …
│   └── shared/               # AppShell, JobCard, LanguageSwitcher, …
├── hooks/
├── i18n/
├── lib/                      # api-client, api, types, cn, auth-storage
├── middleware.ts             # Route-Protection
└── stores/                   # auth-store, theme-store, locale-store
```

## Lint + Typecheck

```bash
npm run lint
npm run typecheck
```

## Build

```bash
npm run build
npm start
```
