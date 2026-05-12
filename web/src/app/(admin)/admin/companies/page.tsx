"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, ShieldCheck, ShieldX } from "lucide-react";
import { toast } from "sonner";
import { companiesApi } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminCompaniesPage() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["admin", "companies"], queryFn: () => companiesApi.list() });

  const decide = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "VERIFIED" | "REJECTED" }) =>
      fetch(`/api/v1/companies/${id}/verification-decision`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      }).then((r) => {
        if (!r.ok) throw new Error("decision failed");
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "companies"] });
      toast.success("Entscheidung gespeichert");
    },
  });

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center gap-3">
        <Building2 className="size-6 text-primary-500" />
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-dark-text">Firmen-Verifikation</h1>
      </div>

      {q.isLoading && <Skeleton className="h-32" />}

      <div className="space-y-3">
        {q.data?.content.filter((c) => c.verificationStatus === "PENDING_REVIEW").map((c) => (
          <Card key={c.id}>
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="font-bold text-gray-900 dark:text-dark-text">{c.name}</p>
                <p className="text-sm text-gray-500 dark:text-dark-muted">{c.slug}</p>
                <Badge variant="warning" className="mt-1">Prüfung läuft</Badge>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => decide.mutate({ id: c.id, status: "REJECTED" })}
                >
                  <ShieldX className="size-4" /> Ablehnen
                </Button>
                <Button onClick={() => decide.mutate({ id: c.id, status: "VERIFIED" })}>
                  <ShieldCheck className="size-4" /> Verifizieren
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
