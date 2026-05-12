"use client";

import { useQuery } from "@tanstack/react-query";
import { applicationsApi } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { ApplicationStatus } from "@/lib/types";

const STATUS_VARIANT: Record<ApplicationStatus, "default" | "info" | "warning" | "success" | "error" | "outline"> = {
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
  const q = useQuery({ queryKey: ["applications", "mine"], queryFn: () => applicationsApi.mine() });

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-6 text-2xl font-extrabold text-gray-900 dark:text-dark-text">Meine Bewerbungen</h1>

      {q.isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      )}

      {q.data?.content.length === 0 && (
        <Card className="p-12 text-center text-sm text-gray-500 dark:text-dark-muted">
          Noch keine Bewerbungen. Schau in der Suche vorbei!
        </Card>
      )}

      <div className="space-y-3">
        {q.data?.content.map((a) => (
          <Card key={a.id} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-gray-500 dark:text-dark-muted">Job-ID: {a.jobId.slice(0, 8)}</p>
                <p className="mt-1 text-sm text-gray-700 dark:text-dark-text">
                  Eingereicht am {new Date(a.createdAt).toLocaleDateString("de-DE")}
                </p>
              </div>
              <Badge variant={STATUS_VARIANT[a.status]}>{STATUS_LABEL[a.status]}</Badge>
            </div>
            {a.coverLetter && (
              <p className="mt-3 line-clamp-3 text-sm text-gray-600 dark:text-dark-muted">
                {a.coverLetter}
              </p>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
