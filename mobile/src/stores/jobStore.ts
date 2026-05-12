import { create } from "zustand";
import { supabase, IS_MOCK_MODE } from "../lib/supabase";
import { mockJobs, mockApplications } from "../lib/mockData";
import type { Job, JobCategory, JobType, Application } from "../types";

interface JobFilters {
  category?: JobCategory;
  type?: JobType;
  location?: string;
  search?: string;
}

interface FavoriteRow {
  job_id: string;
}

interface JobState {
  jobs: Job[];
  myApplications: Application[];
  myListings: Job[];
  favorites: string[];
  loading: boolean;
  error: string | null;
  filters: JobFilters;
  setFilters: (filters: JobFilters) => void;
  fetchJobs: () => Promise<void>;
  fetchJobById: (id: string) => Promise<Job | null>;
  fetchMyApplications: (userId: string) => Promise<void>;
  fetchMyListings: (employerId: string) => Promise<void>;
  applyToJob: (
    jobId: string,
    applicantId: string,
    coverLetter: string,
  ) => Promise<void>;
  createJob: (job: Partial<Job>) => Promise<void>;
  toggleFavorite: (userId: string, jobId: string) => Promise<void>;
  fetchFavorites: (userId: string) => Promise<void>;
}

function errorMessage(e: unknown, fallback = "Unbekannter Fehler"): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "string") return e;
  return fallback;
}

export const useJobStore = create<JobState>((set, get) => ({
  jobs: [],
  myApplications: [],
  myListings: [],
  favorites: [],
  loading: false,
  error: null,
  filters: {},

  setFilters: (filters) => set({ filters }),

  fetchJobs: async () => {
    set({ loading: true, error: null });
    try {
      const { filters } = get();
      if (IS_MOCK_MODE) {
        let filtered = [...mockJobs];
        if (filters.category) {
          filtered = filtered.filter((j) => j.category === filters.category);
        }
        if (filters.type) {
          filtered = filtered.filter((j) => j.type === filters.type);
        }
        if (filters.location) {
          const loc = filters.location.toLowerCase();
          filtered = filtered.filter((j) =>
            j.location.toLowerCase().includes(loc),
          );
        }
        if (filters.search) {
          const s = filters.search.toLowerCase();
          filtered = filtered.filter(
            (j) =>
              j.title.toLowerCase().includes(s) ||
              j.description.toLowerCase().includes(s) ||
              j.location.toLowerCase().includes(s),
          );
        }
        set({ jobs: filtered, loading: false });
        return;
      }
      let query = supabase
        .from("jobs")
        .select("*, employer:profiles(*)")
        .eq("status", "active")
        .order("created_at", { ascending: false });
      if (filters.category) query = query.eq("category", filters.category);
      if (filters.type) query = query.eq("type", filters.type);
      if (filters.location)
        query = query.ilike("location", `%${filters.location}%`);
      if (filters.search)
        query = query.or(
          `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`,
        );
      const { data, error } = await query;
      if (error) throw error;
      set({ jobs: (data as Job[]) || [], loading: false });
    } catch (e) {
      set({ loading: false, error: errorMessage(e) });
    }
  },

  fetchJobById: async (id) => {
    if (IS_MOCK_MODE) {
      return mockJobs.find((j) => j.id === id) || null;
    }
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select("*, employer:profiles(*)")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data as Job;
    } catch {
      return null;
    }
  },

  fetchMyApplications: async (userId) => {
    if (IS_MOCK_MODE) {
      set({
        myApplications: mockApplications.filter(
          (a) => a.applicant_id === userId,
        ),
      });
      return;
    }
    const { data } = await supabase
      .from("applications")
      .select("*, job:jobs(*, employer:profiles(*))")
      .eq("applicant_id", userId)
      .order("created_at", { ascending: false });
    set({ myApplications: (data as Application[]) || [] });
  },

  fetchMyListings: async (employerId) => {
    if (IS_MOCK_MODE) {
      set({ myListings: mockJobs.filter((j) => j.employer_id === employerId) });
      return;
    }
    const { data } = await supabase
      .from("jobs")
      .select("*")
      .eq("employer_id", employerId)
      .order("created_at", { ascending: false });
    set({ myListings: (data as Job[]) || [] });
  },

  applyToJob: async (jobId, applicantId, coverLetter) => {
    if (IS_MOCK_MODE) {
      const job = mockJobs.find((j) => j.id === jobId);
      const newApp: Application = {
        id: `a${Date.now()}`,
        job_id: jobId,
        applicant_id: applicantId,
        status: "pending",
        cover_letter: coverLetter,
        created_at: new Date().toISOString(),
        job: job || undefined,
      };
      mockApplications.push(newApp);
      return;
    }
    const { error } = await supabase.from("applications").insert({
      job_id: jobId,
      applicant_id: applicantId,
      cover_letter: coverLetter,
      status: "pending",
    });
    if (error) throw error;
  },

  createJob: async (job) => {
    if (IS_MOCK_MODE) {
      const newJob: Job = {
        id: `j${Date.now()}`,
        employer_id: job.employer_id!,
        title: job.title || "",
        description: job.description || "",
        category: job.category || "sonstige",
        type: job.type || "job",
        location: job.location || "",
        requirements: job.requirements || "",
        salary_range: job.salary_range || null,
        german_level: job.german_level || null,
        status: "active",
        created_at: new Date().toISOString(),
      };
      mockJobs.unshift(newJob);
      await get().fetchMyListings(job.employer_id!);
      return;
    }
    const { error } = await supabase.from("jobs").insert(job);
    if (error) throw error;
    await get().fetchMyListings(job.employer_id!);
  },

  toggleFavorite: async (userId, jobId) => {
    const { favorites } = get();
    const isFav = favorites.includes(jobId);
    set({ favorites: isFav ? favorites.filter((id) => id !== jobId) : [...favorites, jobId] });
    if (IS_MOCK_MODE) return;
    try {
      if (isFav) {
        await supabase
          .from("favorites")
          .delete()
          .eq("user_id", userId)
          .eq("job_id", jobId);
      } else {
        await supabase.from("favorites").insert({ user_id: userId, job_id: jobId });
      }
    } catch {
      set({ favorites: get().favorites });
    }
  },

  fetchFavorites: async (userId) => {
    if (IS_MOCK_MODE) {
      set({ favorites: ["j1"] });
      return;
    }
    const { data } = await supabase
      .from("favorites")
      .select("job_id")
      .eq("user_id", userId);
    const rows = (data as FavoriteRow[] | null) ?? [];
    set({ favorites: rows.map((f) => f.job_id) });
  },
}));
