import type { Metadata } from "next";

/**
 * Defaults applied to every page. Page-specific overrides come from each route's `metadata`
 * export. Title template gives us "PageTitle · bewerbi.tn" automatically.
 *
 * OpenGraph and Twitter cards always include the locale and a brand image. Replace
 * {@code SITE_URL} via {@code NEXT_PUBLIC_SITE_URL} for staging/preview deployments.
 */
export const SITE = {
  name: "bewerbi.tn",
  description:
    "bewerbi.tn — die Plattform, die Tunesier:innen den Einstieg in den deutschen Arbeitsmarkt erleichtert. Stellen finden, Anerkennung verfolgen, Visa-Schritte begleiten.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://bewerbi.tn",
  defaultLocale: "de" as const,
  locales: ["de", "fr", "ar"] as const,
};

export interface PageMetaOptions {
  title: string;
  description?: string;
  /** Path of this page, no leading slash. */
  path?: string;
  /** Twitter / OG image URL, absolute. */
  image?: string;
  /** Override default robots directive (e.g. `noindex` for staging). */
  noindex?: boolean;
}

export function pageMetadata({
  title,
  description,
  path,
  image,
  noindex,
}: PageMetaOptions): Metadata {
  const url = path ? `${SITE.url}/${path.replace(/^\//, "")}` : SITE.url;
  const fullTitle = `${title} · ${SITE.name}`;
  const ogImage = image ?? `${SITE.url}/og-default.png`;
  const desc = description ?? SITE.description;

  return {
    metadataBase: new URL(SITE.url),
    title: fullTitle,
    description: desc,
    alternates: {
      canonical: url,
      languages: Object.fromEntries(
        SITE.locales.map((l) => [l, `${SITE.url}/${l === SITE.defaultLocale ? "" : l}${path ? `/${path}` : ""}`.replace(/\/$/, "")]),
      ),
    },
    openGraph: {
      type: "website",
      url,
      siteName: SITE.name,
      title: fullTitle,
      description: desc,
      locale: SITE.defaultLocale,
      images: [{ url: ogImage, width: 1200, height: 630, alt: SITE.name }],
    },
    twitter: {
      card: "summary_large_image",
      site: "@bewerbi_tn",
      title: fullTitle,
      description: desc,
      images: [ogImage],
    },
    robots: noindex
      ? { index: false, follow: false, nocache: true }
      : { index: true, follow: true, googleBot: { index: true, follow: true } },
    icons: {
      icon: [
        { url: "/favicon.svg", type: "image/svg+xml" },
        { url: "/favicon-32x32.png", sizes: "32x32" },
        { url: "/favicon-16x16.png", sizes: "16x16" },
      ],
      apple: "/apple-touch-icon.png",
    },
    manifest: "/manifest.webmanifest",
  };
}

/** JSON-LD helper for structured data — use inside a `<Script type="application/ld+json">`. */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    url: SITE.url,
    logo: `${SITE.url}/logo.png`,
    sameAs: [
      "https://www.linkedin.com/company/bewerbi-tn",
      "https://twitter.com/bewerbi_tn",
    ],
    description: SITE.description,
  };
}

export function jobPostingJsonLd(job: {
  id: string;
  title: string;
  description: string;
  companyName: string;
  city: string;
  country: string;
  publishedAt: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  currency?: string;
  employmentType?: string;
  remote?: boolean;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: job.description,
    datePosted: job.publishedAt,
    hiringOrganization: {
      "@type": "Organization",
      name: job.companyName,
    },
    jobLocation: {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.city,
        addressCountry: job.country,
      },
    },
    employmentType: job.employmentType ?? "FULL_TIME",
    jobLocationType: job.remote ? "TELECOMMUTE" : undefined,
    baseSalary:
      job.salaryMin || job.salaryMax
        ? {
            "@type": "MonetaryAmount",
            currency: job.currency ?? "EUR",
            value: {
              "@type": "QuantitativeValue",
              minValue: job.salaryMin,
              maxValue: job.salaryMax,
              unitText: "YEAR",
            },
          }
        : undefined,
    url: `${SITE.url}/jobs/${job.id}`,
  };
}
