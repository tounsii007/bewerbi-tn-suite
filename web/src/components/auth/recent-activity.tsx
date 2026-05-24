"use client";

import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Check, KeyRound, LogIn, RefreshCw } from "lucide-react";
import { useTranslate } from "@/i18n/use-translate";
import { authApi, type LoginAttemptEntry } from "@/lib/api";
import { GoogleGlyph } from "./google-glyph";

/**
 * Iter 161 — "Letzte Aktivität" panel for /settings.
 *
 * Surfaces the last 20 sign-in attempts (success + failure) so the
 * user can spot logins they didn't make. Refetches on focus so a tab
 * left open overnight shows current data when the user returns.
 *
 * Each row carries: method icon (PASSWORD / GOOGLE / REFRESH), success
 * badge, when, IP truncated, and the failure reason as a stable
 * code-translated label (`error.auth.activity.<code>`) for the
 * unsuccessful entries.
 */
export function RecentActivity() {
  const t = useTranslate();
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["auth", "me", "activity"],
    queryFn: () => authApi.activity(20),
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <p className="text-sm text-gray-600 dark:text-dark-muted">
        {t("common.loading")}
      </p>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-sm text-accent-600">
          {t("settings.activity.loadError")}
        </p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="self-start inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:underline"
        >
          <RefreshCw className="size-3.5" />
          {t("common.retry")}
        </button>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <p className="text-sm text-gray-600 dark:text-dark-muted">
        {t("settings.activity.empty")}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <ul className="divide-y divide-gray-200 dark:divide-dark-border">
        {data.map((entry) => (
          <ActivityRow key={entry.id} entry={entry} />
        ))}
      </ul>
      <button
        type="button"
        onClick={() => void refetch()}
        disabled={isFetching}
        className="self-start inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:underline disabled:opacity-60"
      >
        <RefreshCw className={`size-3.5 ${isFetching ? "animate-spin" : ""}`} />
        {isFetching ? t("common.loading") : t("common.retry")}
      </button>
    </div>
  );
}

function ActivityRow({ entry }: { entry: LoginAttemptEntry }) {
  const t = useTranslate();
  const when = new Date(entry.occurredAt);
  const whenLabel = new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(when);

  const methodIcon =
    entry.method === "GOOGLE" ? (
      <GoogleGlyph />
    ) : entry.method === "REFRESH" ? (
      <RefreshCw className="size-4 text-gray-500" />
    ) : (
      <KeyRound className="size-4 text-gray-500" />
    );

  const successBadge = entry.success ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-success-50 px-2 py-0.5 text-xs font-semibold text-success-700 dark:bg-success-500/15 dark:text-success-300">
      <Check className="size-3" />
      {t("settings.activity.success")}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-accent-50 px-2 py-0.5 text-xs font-semibold text-accent-700 dark:bg-accent-500/15 dark:text-accent-300">
      <AlertTriangle className="size-3" />
      {t("settings.activity.failure")}
    </span>
  );

  // Translate the stable failure-reason code; fall back to the raw
  // code so an unknown reason at least surfaces something useful.
  const reasonLabel = entry.failureReason
    ? translateOrCode(t, `error.auth.activity.${entry.failureReason}`)
    : null;

  return (
    <li className="flex items-start gap-3 py-2.5">
      <span className="mt-0.5">{methodIcon}</span>
      <div className="flex flex-1 flex-col gap-0.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold">{whenLabel}</span>
          {successBadge}
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 dark:text-dark-muted">
          <span className="inline-flex items-center gap-1">
            <LogIn className="size-3" />
            {translateOrCode(t, `auth.method.${entry.method}`)}
          </span>
          {entry.ip && <span>IP: {entry.ip}</span>}
          {reasonLabel && (
            <span className="text-accent-600 dark:text-accent-300">
              {reasonLabel}
            </span>
          )}
        </div>
      </div>
    </li>
  );
}

/** Show the translated value if it exists in the dictionary, otherwise
 *  the raw code — keeps unknown enum values visible instead of silently
 *  rendering an empty string. */
function translateOrCode(t: (k: string) => string, key: string): string {
  const v = t(key);
  return v === key ? key.replace(/^.*\./, "") : v;
}

