import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

/**
 * Iter 145 — Vitest config for unit-testing the Iter 117 design-system
 * primitives. Runs in happy-dom (lighter + faster than jsdom for component
 * smoke tests).
 *
 * Test files live next to their source as `*.test.tsx`. Storybook stories
 * (`*.stories.tsx`) are excluded so they don't get picked up as tests.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    environment: "happy-dom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    exclude: ["**/node_modules/**", "**/*.stories.tsx"],
    css: false,
  },
});
