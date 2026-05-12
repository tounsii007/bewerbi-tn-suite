import type { Preview } from "@storybook/react";
import React from "react";
import "../src/app/globals.css";

/**
 * Wraps every story with theme toggle, locale toggle, and the LiveRegionProvider so stories
 * for components that depend on those work out of the box. Keep the wrapper minimal — too much
 * setup hides bugs in real component logic.
 */
const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/ } },
    backgrounds: {
      default: "light",
      values: [
        { name: "light", value: "#f8fafc" },
        { name: "dark", value: "#0f172a" },
        { name: "mesh", value: "transparent" },
      ],
    },
    layout: "centered",
    a11y: { config: { rules: [{ id: "color-contrast", enabled: true }] } },
  },
  globalTypes: {
    theme: {
      name: "Theme",
      defaultValue: "light",
      toolbar: {
        icon: "mirror",
        items: [
          { value: "light", title: "Light" },
          { value: "dark", title: "Dark" },
        ],
      },
    },
    locale: {
      name: "Locale",
      defaultValue: "de",
      toolbar: {
        icon: "globe",
        items: [
          { value: "de", title: "Deutsch" },
          { value: "fr", title: "Français" },
          { value: "ar", title: "العربية (RTL)" },
        ],
      },
    },
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme;
      const locale = context.globals.locale;
      // Mirror what the real app does in `src/components/providers.tsx`.
      if (typeof document !== "undefined") {
        document.documentElement.dataset.theme = theme;
        document.documentElement.lang = locale;
        document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
      }
      return (
        <div
          style={{
            minHeight: "100vh",
            padding: 24,
            background:
              theme === "dark" ? "var(--color-dark-bg)" : "var(--color-surface-alt)",
            color: theme === "dark" ? "var(--color-dark-text)" : "#0f172a",
          }}
        >
          <Story />
        </div>
      );
    },
  ],
};

export default preview;
