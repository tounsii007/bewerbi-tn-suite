"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "framer-motion";
import { useEffect, useMemo } from "react";
import { Toaster } from "@/components/ui/toaster";
import { GoogleOAuthBoundary } from "@/components/auth/google-oauth-provider";
import { useAuthStore } from "@/stores/auth-store";
import { useLocaleStore } from "@/stores/locale-store";
import { useThemeStore } from "@/stores/theme-store";
import { useIdleLogout } from "@/hooks/use-idle-logout";

export function Providers({ children }: { children: React.ReactNode }) {
  useIdleLogout();
  const client = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
            staleTime: 30_000,
          },
          mutations: { retry: 0 },
        },
      }),
    [],
  );

  const hydrateAuth = useAuthStore((s) => s.hydrate);
  const applyTheme = useThemeStore((s) => s.applyToDocument);
  const applyLocale = useLocaleStore((s) => s.applyToDocument);

  useEffect(() => {
    applyTheme();
    applyLocale();
    hydrateAuth();
  }, [applyTheme, applyLocale, hydrateAuth]);

  return (
    <QueryClientProvider client={client}>
      {/* Iter 142 — globally route Framer Motion animations through the
          user's prefers-reduced-motion preference. `reducedMotion="user"`
          means: animate normally for everyone, but skip transforms +
          opacity transitions when the user has the OS setting on.
          This complements the CSS-level rule in globals.css (which
          already gates pure-CSS animations). */}
      <MotionConfig reducedMotion="user">
        {/* Iter 161 — gated Google OAuth provider. When the env var
            is unset (dev default), this is a transparent passthrough
            so no GIS script is injected and no console noise appears. */}
        <GoogleOAuthBoundary>
          {children}
          <Toaster />
        </GoogleOAuthBoundary>
      </MotionConfig>
    </QueryClientProvider>
  );
}
