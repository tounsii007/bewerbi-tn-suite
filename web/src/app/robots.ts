import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  // Staging shouldn't be indexed — drive via NEXT_PUBLIC_INDEXABLE=false in env.
  const indexable = process.env.NEXT_PUBLIC_INDEXABLE !== "false";
  if (!indexable) {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
      sitemap: `${SITE.url}/sitemap.xml`,
    };
  }
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/_next/",
          "/admin",
          "/employer",
          "/dashboard",
          "/profile",
          "/applications",
          "/favorites",
          "/onboarding",
          "/cv-upload",
          "/settings",
          "/saved-searches",
          "/verify",
          // Auth flows shouldn't show up in search results — they
          // include tokens (verify, reset-password) and the search
          // listing for the reset page would never be useful.
          "/login",
          "/register",
          "/forgot-password",
          "/reset-password",
        ],
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
