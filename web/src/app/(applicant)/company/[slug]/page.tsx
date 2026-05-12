"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { Building2, Globe, MapPin, ShieldAlert, ShieldCheck, Star, Users } from "lucide-react";
import { companiesApi } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { VerificationStatus } from "@/lib/types";

function VerifiedBadge({ status }: { status: VerificationStatus }) {
  if (status === "VERIFIED") {
    return (
      <Badge variant="success" size="md">
        <ShieldCheck className="size-3.5" /> Verifiziert
      </Badge>
    );
  }
  if (status === "PENDING_REVIEW") {
    return (
      <Badge variant="warning" size="md">
        <ShieldAlert className="size-3.5" /> Prüfung läuft
      </Badge>
    );
  }
  return (
    <Badge variant="default" size="md">
      <ShieldAlert className="size-3.5" /> Nicht verifiziert
    </Badge>
  );
}

export default function CompanyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const company = useQuery({ queryKey: ["company", slug], queryFn: () => companiesApi.bySlug(slug) });
  const reviews = useQuery({
    queryKey: ["reviews", company.data?.id],
    queryFn: () => companiesApi.reviews(company.data!.id),
    enabled: !!company.data,
  });

  if (company.isLoading) return <Skeleton className="h-64" />;
  if (!company.data) return <p className="text-center">Firma nicht gefunden.</p>;
  const c = company.data;

  return (
    <div className="mx-auto max-w-4xl">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-dark-text">{c.name}</h1>
            <VerifiedBadge status={c.verificationStatus} />
          </div>
          {c.description && (
            <p className="mt-3 text-sm leading-6 text-gray-600 dark:text-dark-muted">{c.description}</p>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-dark-muted">
            {c.industry && (
              <span className="inline-flex items-center gap-1.5">
                <Users className="size-4" /> {c.industry}
              </span>
            )}
            {c.city && (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-4" />
                {c.city}{c.country ? `, ${c.country}` : ""}
              </span>
            )}
            {c.website && (
              <a href={c.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-primary-600 hover:underline">
                <Globe className="size-4" /> Website
              </a>
            )}
          </div>
          {c.ratingCount > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-warning-50 px-3 py-1">
              <Star className="size-4 fill-warning-500 text-warning-500" />
              <span className="font-bold text-gray-900 dark:text-dark-text">{(c.ratingAvg ?? 0).toFixed(1)}</span>
              <span className="text-xs text-gray-500">({c.ratingCount} Bewertungen)</span>
            </div>
          )}
        </CardContent>
      </Card>

      <section className="mt-8">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900 dark:text-dark-text">
          <Building2 className="size-5" /> Bewertungen
        </h2>
        {reviews.isLoading && <Skeleton className="h-24" />}
        {reviews.data && reviews.data.content.length === 0 && (
          <Card className="p-8 text-center text-sm text-gray-500 dark:text-dark-muted">
            Noch keine Bewertungen.
          </Card>
        )}
        <div className="space-y-3">
          {reviews.data?.content.map((r) => (
            <Card key={r.id}>
              <CardContent className="p-5">
                <div className="flex items-center gap-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="size-4"
                      fill={i < r.rating ? "currentColor" : "transparent"}
                      color={i < r.rating ? "#f59e0b" : "currentColor"}
                    />
                  ))}
                  {r.employmentStatus && (
                    <Badge size="sm" className="ms-2">{r.employmentStatus}</Badge>
                  )}
                </div>
                {r.title && <h3 className="mt-2 font-bold">{r.title}</h3>}
                {r.body && <p className="mt-1 text-sm text-gray-600 dark:text-dark-muted">{r.body}</p>}
                {(r.pros || r.cons) && (
                  <div className="mt-3 grid gap-2 text-sm md:grid-cols-2">
                    {r.pros && <p className="text-success-700 dark:text-success-500">👍 {r.pros}</p>}
                    {r.cons && <p className="text-accent-600 dark:text-accent-500">👎 {r.cons}</p>}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
