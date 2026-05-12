"use client";

import { Users } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function AdminUsersPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex items-center gap-3">
        <Users className="size-6 text-primary-500" />
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-dark-text">Benutzerverwaltung</h1>
      </div>
      <Card className="p-8 text-sm text-gray-500 dark:text-dark-muted">
        User-Management-Endpoint im Backend ist noch nicht freigegeben. Platzhalter.
      </Card>
    </div>
  );
}
