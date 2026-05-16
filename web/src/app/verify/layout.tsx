import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "E-Mail bestätigen",
  robots: { index: false, follow: false },
  // The ?token=… in the URL is single-use but still PII-adjacent — keep
  // it out of every outbound Referer header just like the reset page.
  referrer: "no-referrer",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
