import type { Metadata, Viewport } from "next";
import { Inter, Cairo } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

const cairo = Cairo({
  subsets: ["arabic"],
  variable: "--font-cairo",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s · bewerbi.tn",
    default: "bewerbi.tn — Deine Brücke nach Deutschland",
  },
  description:
    "Stellen, Ausbildungen und Visum-Hilfe für Tunesier:innen, die in Deutschland durchstarten wollen.",
  // Iter 152 — PWA-friendly icon set + Apple-specific touch icon. The
  // 192px icon doubles as the apple-touch-icon when iOS Safari can't
  // find /apple-icon at the root.
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    title: "bewerbi.tn",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    title: "bewerbi.tn — Deine Brücke nach Deutschland",
    description:
      "Stellen, Ausbildungen und Visum-Hilfe für Tunesier:innen, die in Deutschland durchstarten wollen.",
    siteName: "bewerbi.tn",
    locale: "de_DE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "bewerbi.tn — Deine Brücke nach Deutschland",
    description:
      "Stellen, Ausbildungen und Visum-Hilfe für Tunesier:innen, die in Deutschland durchstarten wollen.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" suppressHydrationWarning className={`${inter.variable} ${cairo.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
