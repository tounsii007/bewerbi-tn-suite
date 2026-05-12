"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function EmployerListingsPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-dark-text">Meine Stellenanzeigen</h1>
        <Button asChild>
          <Link href="/employer/listings/create">
            <Plus className="size-4" /> Neue Stelle
          </Link>
        </Button>
      </div>
      <Card className="p-12 text-center text-sm text-gray-500 dark:text-dark-muted">
        Du hast noch keine Stellenanzeigen.
      </Card>
    </div>
  );
}
