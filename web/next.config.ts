import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    typedRoutes: true,
  },
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

export default nextConfig;
