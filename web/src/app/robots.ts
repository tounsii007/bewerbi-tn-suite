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
        ],
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
