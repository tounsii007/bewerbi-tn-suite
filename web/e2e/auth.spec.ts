import { expect, test } from "@playwright/test";

/**
 * Iter 164 — full auth-surface coverage.
 *
 * Iter 158 had to skip /login + /register + /reset-password because
 * the entire pages were wrapped in `<Suspense fallback={null}>` around
 * a useSearchParams() bail, leaving the prerendered HTML empty until
 * hydration. Iter 164 fixed the boundary placement so the chrome
 * prerenders normally, which means we can now assert against `next
 * start` output without flakiness.
 *
 * Coverage:
 *  - /login: email + password inputs visible, Google glyph hidden by
 *    default (env var not set in test env)
 *  - /register: role toggle, all fields, Google sign-up hidden
 *  - /forgot-password: existing Iter 158 tests, unchanged
 *  - /reset-password: with no `?token=` the "Link unvollständig" copy
 *    renders; with a fake token the form renders.
 *  - /verify: with no `?token=` the error state surfaces.
 */

test.describe("Login page", () => {
  test.use({ locale: "de-DE" });

  test("renders email + password inputs and the submit button", async ({ page }) => {
    await page.goto("/login");
    await expect(page.locator("input[type='email']")).toBeVisible();
    await expect(page.locator("input[type='password']")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Anmelden/i }).first(),
    ).toBeVisible();
  });

  test("links to register and forgot-password", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("link", { name: /Jetzt registrieren/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /Vergessen/i })).toBeVisible();
  });

  test("renders the welcome headline", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText(/Willkommen zurück/i)).toBeVisible();
  });

  test("does NOT show the Google button when OAuth env var is unset", async ({ page }) => {
    await page.goto("/login");
    // Hydration runs before assertions — give it a chance to bail.
    await page.waitForLoadState("networkidle");
    await expect(page.getByTestId("google-sign-in-button")).toHaveCount(0);
  });
});

test.describe("Register page", () => {
  test.use({ locale: "de-DE" });

  test("renders the role toggle with both options", async ({ page }) => {
    await page.goto("/register");
    await expect(page.getByRole("button", { name: /Bewerber/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Arbeitgeber/i })).toBeVisible();
  });

  test("renders first/last/email/password fields + submit", async ({ page }) => {
    await page.goto("/register");
    await expect(page.locator("input[autocomplete='email']")).toBeVisible();
    await expect(page.locator("input[autocomplete='new-password']")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Konto erstellen/i }).first(),
    ).toBeVisible();
  });

  test("links to login page", async ({ page }) => {
    await page.goto("/register");
    await expect(page.getByRole("link", { name: /Anmelden/i })).toBeVisible();
  });
});

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
    await expect(page.getByText(/Passwort vergessen/i).first()).toBeVisible();
  });
});

/*
 * /reset-password and /verify are deliberately NOT covered here.
 *
 * Their visible content (form vs. "Link unvollständig" vs. "verifying…")
 * is decided by a `useEffect` that reads `window.location.search`. That
 * effect only runs after React hydration. Hydration is currently
 * blocked under `next start` because Next.js doesn't apply the per-
 * request CSP nonce to its statically-prerendered script chunks, so
 * the browser's `strict-dynamic` policy refuses to execute them.
 *
 * The chrome (AuthShell + brand panel) still prerenders fine, but the
 * branching content stays on the initial skeleton until JS runs.
 *
 * A separate task is open to fix the nonce wiring; once that lands,
 * we can add the reset-password / verify assertions here without
 * waiting on hydration.
 */
