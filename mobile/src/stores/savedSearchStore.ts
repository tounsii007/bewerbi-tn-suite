import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { IS_API_MODE, savedSearchApi, type SavedSearchBody } from "../lib/apiClient";
import type { AlertFrequency } from "../lib/savedSearchHelpers";
import type { JobCategory, JobType, LanguageLevel } from "../types";

export interface SavedSearch {
  id: string;
  name: string;
  query?: string;
  category?: JobCategory;
  type?: JobType;
  location?: string;
  minGermanLevel?: LanguageLevel;
  salaryMin?: number;
  alertFrequency: AlertFrequency;
  alertsEnabled: boolean;
  createdAt: string;
  lastViewedAt?: string;
}

interface SavedSearchState {
  searches: SavedSearch[];
  loading: boolean;
  load: () => Promise<void>;
  create: (input: Omit<SavedSearch, "id" | "createdAt">) => Promise<SavedSearch>;
  update: (id: string, input: Partial<SavedSearch>) => Promise<void>;
  markViewed: (id: string) => Promise<void>;
  setAlertFrequency: (id: string, frequency: AlertFrequency) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

export const useSavedSearchStore = create<SavedSearchState>()(
  persist(
    (set, get) => ({
      searches: [],
      loading: false,

      load: async () => {
        if (!IS_API_MODE) return;
        set({ loading: true });
        try {
          const remote = await savedSearchApi.list();
          set({
            searches: remote.map((s) => ({
              ...s,
              alertFrequency: "DAILY" as const,
              createdAt: new Date().toISOString(),
            })),
            loading: false,
          });
        } catch {
          set({ loading: false });
        }
      },

      create: async (input) => {
        if (IS_API_MODE) {
          const body: SavedSearchBody = {
            name: input.name,
            query: input.query,
            category: input.category,
            type: input.type,
            location: input.location,
            minGermanLevel: input.minGermanLevel,
            salaryMin: input.salaryMin,
            alertsEnabled: input.alertsEnabled,
          };
          const saved = await savedSearchApi.create(body);
          const next: SavedSearch = {
            ...saved,
            alertFrequency: input.alertFrequency,
            createdAt: new Date().toISOString(),
          };
          set((s) => ({ searches: [next, ...s.searches] }));
          return next;
        }
        const local: SavedSearch = {
          ...input,
          id: `local-${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ searches: [local, ...s.searches] }));
        return local;
      },

      update: async (id, input) => {
        const current = get().searches.find((x) => x.id === id);
        if (!current) return;
        const merged = { ...current, ...input };
        if (IS_API_MODE) {
          await savedSearchApi.update(id, {
            name: merged.name,
            query: merged.query,
            category: merged.category,
            type: merged.type,
            location: merged.location,
            minGermanLevel: merged.minGermanLevel,
            salaryMin: merged.salaryMin,
            alertsEnabled: merged.alertsEnabled,
          });
        }
        set((s) => ({
          searches: s.searches.map((x) => (x.id === id ? merged : x)),
        }));
      },

      markViewed: async (id) => {
        set((s) => ({
          searches: s.searches.map((x) =>
            x.id === id ? { ...x, lastViewedAt: new Date().toISOString() } : x,
          ),
        }));
      },

      setAlertFrequency: async (id, frequency) => {
        await get().update(id, {
          alertFrequency: frequency,
          alertsEnabled: frequency !== "OFF",
        });
      },

      remove: async (id) => {
        if (IS_API_MODE) {
          await savedSearchApi.remove(id);
        }
        set((s) => ({ searches: s.searches.filter((x) => x.id !== id) }));
      },
    }),
    {
      name: "bewerbi.saved-searches",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
