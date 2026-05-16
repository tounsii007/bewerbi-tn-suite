"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useMemo } from "react";
import { Toaster } from "@/components/ui/toaster";
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
      {children}
      <Toaster />
    </QueryClientProvider>
  );
}
