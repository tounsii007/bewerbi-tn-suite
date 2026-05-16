import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Passwort zurücksetzen",
  // The URL carries the single-use token in ?token=…; no search engine
  // ever needs to index that, and indexing the page would also let
  // archived snapshots be sent through Referrer.
  robots: { index: false, follow: false },
  // Stricter referrer policy than the app default — `no-referrer` means
  // *any* outbound link click (legal pages, favicons fetched by the
  // browser, third-party fonts) drops the URL entirely, so the
  // ?token=… cannot leak via Referer to any external host.
  referrer: "no-referrer",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
