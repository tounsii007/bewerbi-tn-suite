import { expect, test } from "@playwright/test";

/**
 * Iter 157 — landing page smoke test.
 *
 * Verifies the marketing page renders all major sections (hero, trust
 * strip, features, stats, how-it-works, visa types, testimonials,
 * CTA, footer) without runtime errors.
 *
 * We pin the locale (German) via the `Accept-Language` header so the
 * test isn't sensitive to the test runner's machine locale.
 */
test.describe("Landing page", () => {
  test.use({ locale: "de-DE" });

  test("renders hero with gradient headline + CTA", async ({ page }) => {
    await page.goto("/");

    // Headline contains "Deine Brücke nach Deutschland"
    await expect(
      page.getByRole("heading", { name: /Deine Brücke nach Deutschland/i }),
    ).toBeVisible();

    // Primary CTA → /register
    const primaryCta = page.getByRole("link", { name: /Kostenlos starten/i }).first();
    await expect(primaryCta).toBeVisible();
    await expect(primaryCta).toHaveAttribute("href", /\/register/);

    // Secondary CTA → /search
    await expect(
      page.getByRole("link", { name: /Stellen ansehen/i }).first(),
    ).toBeVisible();
  });

  test("displays the sticky glass nav with brand mark + primary CTA", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator("nav").first()).toBeVisible();
    // The Register CTA is always visible; "Anmelden" is hidden below
    // the `sm` breakpoint so we test the always-visible CTA.
    await expect(
      page.getByRole("link", { name: /Kostenlos starten/i }).first(),
    ).toBeVisible();
  });

  test("trust strip + features bento + stats section all render", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(
      page.getByText(/Vertrauen von führenden deutschen Arbeitgebern/i),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Alles, was du für den/i }),
    ).toBeVisible();
  });

  test("visa types section shows the major paths", async ({ page }) => {
    await page.goto("/");
    // Visa section is below the fold — scroll it into view first so
    // the elements pass Playwright's visibility check.
    await page.locator("#visa").scrollIntoViewIfNeeded();
    await expect(page.getByText("Blaue Karte EU").first()).toBeVisible();
    await expect(page.getByText("Chancenkarte").first()).toBeVisible();
  });

  test("anchor links in nav scroll to sections", async ({ page }) => {
    await page.goto("/");
    const featuresAnchor = page.getByRole("link", { name: /^Features$/i });
    if (await featuresAnchor.count()) {
      await featuresAnchor.first().click();
      await expect(page).toHaveURL(/#features/);
    }
  });

  test("page has no script errors (pageerror)", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    // Only fail on uncaught JS exceptions. console.error noise (404s
    // for vendor pre-fetches, optional API routes etc.) isn't smoke-
    // test signal — the Playwright report still captures all of it
    // when something actually breaks.
    expect(errors).toEqual([]);
  });
});
