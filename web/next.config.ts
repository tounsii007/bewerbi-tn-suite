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
  async headers() {
    const self = "'self'";
    const scriptSrc = [self, "'unsafe-inline'", "'unsafe-eval'"].join(" ");
    const csp = [
      `default-src ${self}`,
      `script-src ${scriptSrc}`,
      `style-src ${self} 'unsafe-inline' https://fonts.googleapis.com`,
      `font-src ${self} https://fonts.gstatic.com`,
      `img-src ${self} data: https:`,
      `connect-src ${self}`,
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ");
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Content-Security-Policy", value: csp },
        ],
      },
    ];
  },
};

export default nextConfig;
