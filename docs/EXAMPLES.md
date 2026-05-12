# Examples — bewerbi.tn

Häufige Aufgaben mit minimalem Code. Alles davon ist getestet im Iteration-Workflow der Suite.

## Login (Web — fetch)

```ts
const res = await fetch("/api/v1/auth/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Accept-Language": navigator.language || "de",
  },
  body: JSON.stringify({ email, password }),
});
if (!res.ok) {
  const err = await res.json();           // ApiError-Envelope
  throw new Error(err.messageKey);
}
const { accessToken, refreshToken, user } = await res.json();
```

## Login (Mobile — Expo)

```ts
import { fetch } from "@/lib/apiClient";   // wrapper, hängt Locale + Auth-Header an

const data = await fetch("/api/v1/auth/login", {
  method: "POST",
  body: { email, password },
});
useAuthStore.getState().setTokens(data);
```

## Login (Flutter)

```dart
final res = await http.post(
  Uri.parse('$gateway/api/v1/auth/login'),
  headers: { 'Content-Type': 'application/json', 'Accept-Language': locale },
  body: jsonEncode({ 'email': email, 'password': password }),
);
if (res.statusCode != 200) {
  final err = jsonDecode(res.body);
  throw ApiException(err['messageKey'], err['traceId']);
}
final json = jsonDecode(res.body);
ref.read(authProvider.notifier).setTokens(json);
```

## Stellen suchen mit Pagination

```ts
const params = new URLSearchParams({
  q: "pflege",
  germanLevel: "B2",
  remote: "true",
  page: String(page),
  size: "20",
  sort: "publishedAt,desc",
});
const res = await fetch(`/api/v1/jobs?${params}`);
const { content: jobs, totalPages } = await res.json();
```

## Bewerbung erstellen mit Idempotency

```ts
import { v4 as uuid } from "uuid";

await fetch("/api/v1/applications", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Idempotency-Key": uuid(),
  },
  body: JSON.stringify({ jobId, coverLetter }),
});
// Falls die Antwort verloren geht, der Retry mit demselben Key liefert die ursprüngliche Antwort.
```

## Toast nach Erfolg/Fehler

### Web

```ts
import { toast } from "@/components/ui/toaster";

mutation.mutate(data, {
  onSuccess: () => toast.success("Bewerbung gesendet"),
  onError:   (e) => toast.error(translateError(e)),
});
```

### Mobile

```tsx
import { useToast } from "@/components/ui/Toast";

const { success, error } = useToast();
mutation.mutate(data, {
  onSuccess: () => success("Bewerbung gesendet"),
  onError:   (e) => error(translateError(e)),
});
```

## Formular mit Validierung (Web)

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Field, Input } from "@/components/ui/input";

const schema = z.object({
  email: z.string().email("E-Mail-Format prüfen"),
  password: z.string().min(8, "Mindestens 8 Zeichen"),
});

export function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema) });
  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-3">
      <Field label="E-Mail" error={errors.email?.message} required>
        <Input invalid={!!errors.email} {...register("email")} />
      </Field>
      <Field label="Passwort" error={errors.password?.message} required>
        <Input type="password" invalid={!!errors.password} {...register("password")} />
      </Field>
      <Button type="submit" loading={isSubmitting}>Anmelden</Button>
    </form>
  );
}
```

## Empty/Error-State (Web)

```tsx
if (q.isLoading) return <SkeletonGroup lines={5} />;
if (q.isError)   return <ErrorState error={q.error} onRetry={() => q.refetch()} />;
if (q.data.length === 0) return (
  <EmptyState
    icon={<Inbox className="size-6" />}
    title="Noch keine Bewerbungen"
    description="Sobald du dich auf einen Job bewirbst, erscheint er hier."
    action={<Button asChild><Link href="/search">Stellen entdecken</Link></Button>}
  />
);
```

## Bottom-Sheet öffnen (Mobile)

```tsx
const sheet = useDisclosure();
return (
  <>
    <Button title="Filter" onPress={sheet.open} />
    <BottomSheet open={sheet.isOpen} onClose={sheet.close} title="Filter">
      <FilterPanel />
    </BottomSheet>
  </>
);
```

## Web-Vitals reporten

```tsx
"use client";
import { useReportWebVitals } from "next/web-vitals";
import { reportWebVital } from "@/lib/web-vitals";

export function VitalsReporter() {
  useReportWebVitals(reportWebVital);
  return null;
}
```

## Tokens regenerieren nach Theme-Edit

```bash
node scripts/sync-tokens.mjs
```

Output landet in `shared/tokens/dist/tokens.ts`, sowie spiegelt in `web/src/lib/`, `mobile/src/lib/`,
`flutter/lib/app/theme/`. Commit alles zusammen.
