import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo";

/**
 * Static sitemap. For job-level entries, run a separate route (e.g. `sitemap/jobs.xml`) so
 * regeneration doesn't block the static section. Crawl frequency mirrors how often we expect
 * each section to change.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE.url;
  const now = new Date();
  const sections: Array<[string, "always" | "hourly" | "daily" | "weekly" | "monthly", number]> = [
    ["", "daily", 1.0],
    ["search", "hourly", 0.9],
    ["jobs", "hourly", 0.9],
    ["anerkennung", "weekly", 0.7],
    ["visa", "weekly", 0.7],
    ["login", "monthly", 0.4],
    ["register", "monthly", 0.4],
  ];
  return sections.map(([path, changeFrequency, priority]) => ({
    url: path ? `${base}/${path}` : base,
    lastModified: now,
    changeFrequency,
    priority,
  }));
}
