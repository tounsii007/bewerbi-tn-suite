"use client";

import Link from "next/link";
import { ChevronRight, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { ProfileResponse } from "@/lib/types";

const TIER_STYLE: Record<string, { bg: string; color: string; emoji: string }> = {
  STARTER: { bg: "bg-gray-100 dark:bg-dark-border", color: "text-gray-500 dark:text-dark-muted", emoji: "🌱" },
  MOVER: { bg: "bg-primary-50 dark:bg-primary-500/15", color: "text-primary-700 dark:text-primary-300", emoji: "🚀" },
  ADVANCED: { bg: "bg-purple-50 dark:bg-purple-500/15", color: "text-purple-700 dark:text-purple-300", emoji: "⭐" },
  COMPLETE: { bg: "bg-success-100 dark:bg-success-500/15", color: "text-success-700 dark:text-success-500", emoji: "🏆" },
};

export function ProfileCompletenessCard({ profile }: { profile: ProfileResponse }) {
  const c = profile.completeness;
  // TIER_STYLE.STARTER is defined in the literal so `!` is safe;
  // the index access is the noUncheckedIndexedAccess-typed shape.
  const tier = TIER_STYLE[c.tier] ?? TIER_STYLE.STARTER!;

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-4 p-5">
        <div className={`flex size-14 items-center justify-center rounded-full ${tier.bg}`}>
          <span className="text-2xl">{tier.emoji}</span>
        </div>
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-gray-900 dark:text-dark-text">{c.percent}%</span>
            <span className={`text-[11px] font-bold uppercase tracking-wider ${tier.color}`}>
              {c.tierLabel}
            </span>
          </div>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-dark-muted">Profil-Vollständigkeit</p>
        </div>
      </div>
      <div className="px-5 pb-3">
        <Progress value={c.percent} />
      </div>
      {c.nextAction && (
        <Link
          href={c.nextAction.route as "/profile"}
          className="flex items-center gap-3 border-t border-gray-100 px-5 py-4 transition-colors hover:bg-primary-50/50 dark:border-dark-border dark:hover:bg-primary-500/10"
        >
          <div className="flex size-9 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-500/15">
            <Sparkles className="size-4 text-primary-600 dark:text-primary-300" />
          </div>
          <div className="flex-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-primary-600 dark:text-primary-300">
              Nächster Schritt · +{c.nextAction.weight}%
            </p>
            <p className="text-sm font-semibold text-gray-900 dark:text-dark-text">{c.nextAction.action}</p>
          </div>
          <ChevronRight className="size-5 text-primary-600 dark:text-primary-300" />
        </Link>
      )}
    </Card>
  );
}
