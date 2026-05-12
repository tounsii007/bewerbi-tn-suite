import type { MetadataRoute } from "next";

/**
 * PWA manifest. Keep theme_color in sync with `--color-primary-500`. The icons reference
 * static files under `public/icons/`.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "bewerbi.tn",
    short_name: "bewerbi",
    description:
      "Deine Brücke nach Deutschland — Jobs, Anerkennung und Visa, alles an einem Ort.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#2563EB",
    orientation: "portrait",
    lang: "de",
    dir: "ltr",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
