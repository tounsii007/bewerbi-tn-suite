import { defineConfig, devices } from "@playwright/test";

/**
 * Iter 157 — Playwright e2e config.
 *
 * Tests live under e2e/ (separate dir from Vitest's src test glob).
 * Spins up `next dev` on port 3010 (offset from the dev port 3000 so a
 * running dev server doesn't conflict).
 *
 * CI hooks: set CI=true; tests run with retries=2 and forbidOnly=true.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3010",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        // Use `next start` against a pre-built app for speed + a closer
        // approximation of production. The build runs once and the
        // server starts in <2s.
        command: "npm run build && npx next start -p 3010",
        port: 3010,
        timeout: 180_000,
        reuseExistingServer: !process.env.CI,
        // Don't capture stdout — Next's build output floods the log.
        stdout: "ignore",
        stderr: "pipe",
      },
});
