import { http, HttpResponse } from "msw";

/**
 * MSW request handlers — used by Storybook stories and by jest/vitest tests so the UI never
 * needs a live gateway. Add new handlers as features land; mirror the real API contract.
 *
 * Setup:
 *   npm install -D msw
 *   npx msw init public/
 *
 * Then start the worker in `_app.tsx` or test setup:
 *   if (process.env.NODE_ENV === "development") {
 *     import("./mocks/browser").then(({ worker }) => worker.start());
 *   }
 */
const GATEWAY = "http://localhost:8080";

export const handlers = [
  // ── Auth ────────────────────────────────────────────────
  http.post(`${GATEWAY}/api/v1/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };
    if (body.password === "wrong") {
      return HttpResponse.json(
        {
          status: 401,
          code: "UNAUTHORIZED",
          message: "Invalid credentials",
          messageKey: "error.auth.invalidCredentials",
          violations: [],
          path: "/api/v1/auth/login",
          traceId: "mock-trace",
          timestamp: new Date().toISOString(),
        },
        { status: 401 },
      );
    }
    return HttpResponse.json({
      accessToken: "mock-access",
      accessTokenExpiresIn: 3600,
      accessTokenExpiresAt: new Date(Date.now() + 3600_000).toISOString(),
      refreshToken: "mock-refresh",
      refreshTokenExpiresAt: new Date(Date.now() + 7 * 86_400_000).toISOString(),
      user: {
        id: "00000000-0000-0000-0000-000000000001",
        email: body.email,
        fullName: "Salma Test",
        roles: ["USER"],
        locale: "de",
        emailVerified: true,
        createdAt: "2026-01-01T00:00:00Z",
      },
    });
  }),

  // ── Jobs list ───────────────────────────────────────────
  http.get(`${GATEWAY}/api/v1/jobs`, () => {
    return HttpResponse.json({
      content: Array.from({ length: 12 }).map((_, i) => ({
        id: `job-${i + 1}`,
        title: ["Pflegekraft", "Software-Entwickler:in", "Elektroniker:in", "Bauingenieur:in"][
          i % 4
        ],
        companyId: "co-1",
        companyName: ["Charité", "SAP", "Bosch", "Siemens"][i % 4],
        city: ["Berlin", "München", "Hamburg", "Stuttgart"][i % 4],
        country: "DE",
        remote: i % 5 === 0,
        employmentType: "FULL_TIME",
        salaryMin: 38000 + i * 1500,
        salaryMax: 52000 + i * 1500,
        currency: "EUR",
        germanLevel: ["B1", "B2", "C1"][i % 3],
        publishedAt: new Date(Date.now() - i * 86_400_000).toISOString(),
      })),
      totalElements: 12,
      totalPages: 1,
      number: 0,
      size: 12,
    });
  }),

  // ── Profile completeness ────────────────────────────────
  http.get(`${GATEWAY}/api/v1/profile/me`, () => {
    return HttpResponse.json({
      id: "profile-1",
      completeness: 78,
      missingFields: [
        { field: "germanLevel", label: "Deutschkenntnisse", messageKey: "profile.field.germanLevel" },
        { field: "cv", label: "Lebenslauf", messageKey: "profile.field.cv" },
      ],
    });
  }),

  // ── i18n bundle ─────────────────────────────────────────
  http.get(`${GATEWAY}/api/v1/i18n/messages`, ({ request }) => {
    const url = new URL(request.url);
    const locale = url.searchParams.get("locale") ?? "de";
    return HttpResponse.json({
      locale,
      messages: {
        "common.save": "Speichern",
        "common.cancel": "Abbrechen",
        "auth.login": "Anmelden",
      },
    });
  }),
];
