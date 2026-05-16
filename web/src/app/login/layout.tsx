import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Anmelden",
  // Defence-in-depth: robots.txt also disallows /login, but a search
  // engine that ignores robots.txt (or a deep-linked share) would
  // still respect <meta name="robots" content="noindex">.
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
