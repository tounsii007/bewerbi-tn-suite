import type { MetadataRoute } from "next";

/**
 * PWA manifest. Keep `theme_color` in sync with `--color-primary-500`.
 * Icons live under `public/icons/`.
 *
 * Iter 152 additions:
 *  - `id`: stable PWA identity (lets browsers correlate installs across
 *    URL changes during the app's lifetime).
 *  - `categories`: improves discoverability in app stores that scrape
 *    web manifests (Edge, Samsung Internet).
 *  - `shortcuts`: long-press the home-screen icon → quick-jump to Search,
 *    Applications, Visa-Tracker. Each shortcut is an "app icon" on
 *    Android 7+ and a context-menu entry on desktop Chromium.
 *  - `display_override`: prefer `standalone`; fall back to `minimal-ui`
 *    on browsers that don't support standalone.
 *  - `prefer_related_applications: false`: explicit signal that there
 *    is no native app to redirect to (avoids accidental App-Store
 *    prompts on Safari).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/?utm_source=pwa",
    name: "bewerbi.tn — Brücke nach Deutschland",
    short_name: "bewerbi",
    description:
      "Deine Brücke nach Deutschland — Jobs, Anerkennung und Visa, alles an einem Ort.",
    start_url: "/?utm_source=pwa",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    background_color: "#f8fafc",
    theme_color: "#2563EB",
    orientation: "portrait",
    lang: "de",
    dir: "ltr",
    categories: ["productivity", "business", "education"],
    prefer_related_applications: false,
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Stellen suchen",
        short_name: "Suche",
        description: "Finde passende Stellen in Deutschland",
        url: "/search?utm_source=pwa_shortcut",
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
        ],
      },
      {
        name: "Meine Bewerbungen",
        short_name: "Bewerbungen",
        description: "Status aller laufenden Bewerbungen",
        url: "/applications?utm_source=pwa_shortcut",
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
        ],
      },
      {
        name: "Visum-Tracker",
        short_name: "Visum",
        description: "Dein Visumsprozess auf einen Blick",
        url: "/visa?utm_source=pwa_shortcut",
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
        ],
      },
    ],
  };
}
