import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

/**
 * Iter 147 — bundle analyzer.
 * Enable via `ANALYZE=true npm run build` — generates static HTML reports
 * under .next/analyze/ that visualise each route's bundle composition.
 */
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
  openAnalyzer: false,
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // experimental.typedRoutes was on, but the codebase pre-dates it and
  // every <Link href={dynamicString}> path-template fails the typed
  // check. Disable for now — adopt later via a dedicated migration that
  // converts all string hrefs to Route objects.
  async rewrites() {
    // Proxy all /api/** calls to the Java gateway so cookies/CORS stay same-origin.
    const gateway = process.env.NEXT_PUBLIC_GATEWAY_URL ?? "http://localhost:8080";
    return [
      { source: "/api/:path*", destination: `${gateway}/api/:path*` },
    ];
  },
  // Static security headers. The Content-Security-Policy is *not* set here —
  // middleware.ts emits a per-request nonced CSP that overrides any static
  // value. Mixing both leads to two headers being sent.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          // includeSubDomains + preload ⇒ eligible for the browser
          // pre-load list at https://hstspreload.org (do *not* submit
          // until every subdomain is HTTPS-only — removal is slow).
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Cross-Origin-Resource-Policy", value: "same-site" },
          { key: "X-DNS-Prefetch-Control", value: "off" },
        ],
      },
    ];
  },
};

export default withBundleAnalyzer(nextConfig);
