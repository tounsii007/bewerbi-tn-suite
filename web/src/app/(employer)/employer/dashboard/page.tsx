"use client";

import Link from "next/link";
import { Briefcase, Building2, Plus, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function EmployerDashboardPage() {
  const stats = [
    { icon: Briefcase, label: "Aktive Stellen", value: "—" },
    { icon: Users, label: "Bewerbungen", value: "—" },
    { icon: Building2, label: "Aufrufe (30 T.)", value: "—" },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-dark-text">Übersicht</h1>
        <Button asChild>
          <Link href="/employer/listings/create">
            <Plus className="size-4" /> Neue Stelle
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 dark:bg-primary-500/15">
                <s.icon className="size-5" />
              </div>
              <div className="mt-3 text-3xl font-extrabold text-gray-900 dark:text-dark-text">{s.value}</div>
              <div className="text-sm text-gray-500 dark:text-dark-muted">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
