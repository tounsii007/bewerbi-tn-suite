import { expect, test } from "@playwright/test";

/**
 * Iter 158 — auth flow smoke tests.
 *
 * SCOPE: tests pages that prerender to static HTML. /login, /register,
 * /reset-password wrap their forms in `<Suspense fallback={null}>`
 * because they call `useSearchParams()` — Next.js then bails them to
 * client-side rendering at build time. The SSR body is empty until JS
 * hydrates, which is unreliable to assert against in Playwright on a
 * fresh `next start`.
 *
 * In a future iteration we'll either:
 *  - move the useSearchParams branch into a separate child component
 *    so the parent can still prerender, or
 *  - run the e2e against `next dev` (where hydration is fast enough)
 *
 * For now this file covers /forgot-password (statically rendered) and
 * any auth surface that doesn't bail to CSR.
 */

test.describe("Forgot password page", () => {
  test.use({ locale: "de-DE" });

  test("renders email input + reset-link button", async ({ page }) => {
    await page.goto("/forgot-password");
    await expect(page.locator("input[type='email']")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Reset-Link senden/i }),
    ).toBeVisible();
  });

  test("renders the back-to-login link", async ({ page }) => {
    await page.goto("/forgot-password");
    await expect(
      page.getByRole("link", { name: /Zurück zum Login/i }).first(),
    ).toBeVisible();
  });

  test("renders hero copy mentioning password reset", async ({ page }) => {
    await page.goto("/forgot-password");
    // The headline contains "Passwort vergessen" — present in both
    // the brand panel (desktop only) and the form-side title.
    await expect(page.getByText(/Passwort vergessen/i).first()).toBeVisible();
  });
});
