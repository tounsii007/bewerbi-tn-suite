"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { FileText, Search, Calendar } from "lucide-react";
import { applicationsApi } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { GradientText } from "@/components/ui/gradient-text";
import { Reveal } from "@/components/ui/reveal";
import { useTranslate } from "@/i18n/use-translate";
import type { ApplicationStatus } from "@/lib/types";

const STATUS_VARIANT: Record<
  ApplicationStatus,
  "default" | "info" | "warning" | "success" | "error" | "outline"
> = {
  PENDING: "default",
  REVIEWED: "info",
  INTERVIEW: "warning",
  ACCEPTED: "success",
  REJECTED: "error",
  WITHDRAWN: "outline",
};

const STATUS_LABEL: Record<ApplicationStatus, string> = {
  PENDING: "Ausstehend",
  REVIEWED: "In Prüfung",
  INTERVIEW: "Interview",
  ACCEPTED: "Angenommen",
  REJECTED: "Abgelehnt",
  WITHDRAWN: "Zurückgezogen",
};

export default function ApplicationsPage() {
  const t = useTranslate();
  const q = useQuery({
    queryKey: ["applications", "mine"],
    queryFn: () => applicationsApi.mine(),
  });

  return (
    <div className="mx-auto max-w-4xl">
      <Reveal>
        <header className="mb-8 flex items-start gap-4">
          <div className="grid size-12 place-items-center rounded-2xl bg-[linear-gradient(135deg,var(--color-primary-500),oklch(0.611_0.18_280))] text-white shadow-[var(--shadow-glow)]">
            <FileText className="size-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
              Meine <GradientText variant="brand">Bewerbungen</GradientText>
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-dark-muted">
              {q.data?.totalElements != null && q.data.totalElements > 0
                ? `${q.data.totalElements} insgesamt — verfolge den Status in Echtzeit.`
                : "Hier siehst du deinen Bewerbungs-Verlauf."}
            </p>
          </div>
        </header>
      </Reveal>

      {q.isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
      )}

      {q.data && q.data.content.length === 0 && (
        <Reveal>
          <GlassCard strength="default" className="p-12 text-center">
            <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-primary-500/15 text-primary-600">
              <FileText className="size-8" />
            </div>
            <h2 className="mt-5 text-xl font-bold">{t("empty.noApps.title")}</h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-dark-muted">
              {t("empty.noApps.body")}
            </p>
            <Button
              asChild
              variant="gradient"
              size="lg"
              className="mt-6"
              leadingIcon={<Search className="size-4" />}
            >
              <Link href="/search">Stellen entdecken</Link>
            </Button>
          </GlassCard>
        </Reveal>
      )}

      <div className="space-y-3">
        {q.data?.content.map((a, i) => (
          <Reveal key={a.id} delay={i * 0.04}>
            <GlassCard strength="default" lift className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="grid size-11 place-items-center rounded-xl bg-primary-500/15 text-primary-600">
                    <FileText className="size-5" />
                  </div>
                  <div>
                    <p className="text-xs font-mono text-gray-500 dark:text-dark-muted">
                      Job · {a.jobId.slice(0, 8)}
                    </p>
                    <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-gray-700 dark:text-dark-text">
                      <Calendar className="size-3.5 text-gray-400" />
                      Eingereicht{" "}
                      {new Date(a.createdAt).toLocaleDateString("de-DE", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <Badge variant={STATUS_VARIANT[a.status]}>
                  {STATUS_LABEL[a.status]}
                </Badge>
              </div>
              {a.coverLetter && (
                <p className="mt-4 line-clamp-3 border-t border-gray-100 pt-3 text-sm text-gray-600 dark:border-dark-border dark:text-dark-muted">
                  {a.coverLetter}
                </p>
              )}
            </GlassCard>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
