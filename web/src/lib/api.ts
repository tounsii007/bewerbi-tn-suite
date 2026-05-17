/**
 * Typed wrappers around the raw api client for each service.
 * Screens import from here rather than poking at fetch directly —
 * keeps endpoint strings in one place and makes OpenAPI drift visible.
 */

import { api } from "./api-client";
import type {
  AnerkennungCase,
  Application,
  AuthResponse,
  Company,
  CvHints,
  DocumentSummary,
  DocumentType,
  GermanLevel,
  Job,
  JobCategory,
  JobType,
  Page,
  ProfessionSearchResult,
  ProfileResponse,
  Recommendation,
  ReferenceEntry,
  Review,
  SavedSearch,
  SupportedLocale,
  UserRole,
  VisaCase,
  VisaType,
} from "./types";

// ─── Auth ──────────────────────────────────────────────────────────────
export const authApi = {
  register: (body: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
  }) => api.public<AuthResponse>("/api/v1/auth/register", { method: "POST", body }),
  login: (body: { email: string; password: string }) =>
    api.public<AuthResponse>("/api/v1/auth/login", { method: "POST", body }),
  logout: (refreshToken: string) =>
    api.post<void>("/api/v1/auth/logout", { refreshToken }),
  logoutAll: () => api.post<void>("/api/v1/auth/logout-all"),
  verifyEmail: (token: string) =>
    api.public<void>(`/api/v1/auth/verify-email?token=${encodeURIComponent(token)}`),
  resendVerification: (email: string) =>
    api.public<void>("/api/v1/auth/verify-email/resend", { method: "POST", body: { email } }),
  forgotPassword: (email: string) =>
    api.public<void>("/api/v1/auth/password/forgot", { method: "POST", body: { email } }),
  resetPassword: (token: string, newPassword: string) =>
    api.public<void>("/api/v1/auth/password/reset", {
      method: "POST",
      body: { token, newPassword },
    }),
  changePassword: (oldPassword: string, newPassword: string) =>
    api.post<void>("/api/v1/auth/password/change", { oldPassword, newPassword }),
  sessions: () =>
    api.get<{
      tokenHash: string;
      createdAt: number;
      lastUsedAt: number;
      userAgent: string;
      ip: string;
      expiresInSeconds: number;
    }[]>("/api/v1/auth/me/sessions"),
  revokeSession: (tokenHash: string) =>
    api.del<void>(`/api/v1/auth/me/sessions/${encodeURIComponent(tokenHash)}`),
  revokeOtherSessions: (keepHash?: string) => {
    const qs = keepHash ? `?keepHash=${encodeURIComponent(keepHash)}` : "";
    return api.post<{ revoked: number }>(`/api/v1/auth/me/sessions/revoke-others${qs}`);
  },
  deleteAccount: (password: string) =>
    api.post<void>("/api/v1/auth/me/delete", { password }),
};

// ─── Profile ───────────────────────────────────────────────────────────
export const profileApi = {
  me: () => api.get<ProfileResponse>("/api/v1/profile/me"),
  update: (body: Partial<ProfileResponse>) => api.put<ProfileResponse>("/api/v1/profile/me", body),
  completeOnboarding: (body: {
    desiredProfession?: string;
    germanLevel?: GermanLevel;
    recognitionStatus?: string;
    skills?: string[];
  }) => api.post<ProfileResponse>("/api/v1/profile/onboarding", body),
  setLocale: (locale: SupportedLocale) => api.put<void>("/api/v1/profile/me/locale", { locale }),
};

// ─── Jobs ──────────────────────────────────────────────────────────────
export interface JobFilters {
  search?: string;
  category?: JobCategory;
  type?: JobType;
  location?: string;
  minGermanLevel?: GermanLevel;
  salaryMin?: number;
  page?: number;
  size?: number;
}

export const jobsApi = {
  search: (filters: JobFilters = {}) => {
    const q = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") q.set(k, String(v));
    });
    const suffix = q.toString() ? `?${q}` : "";
    return api.get<Page<Job>>(`/api/v1/jobs${suffix}`);
  },
  get: (id: string) => api.get<Job>(`/api/v1/jobs/${id}`),
};

// ─── Saved Searches ────────────────────────────────────────────────────
export const savedSearchApi = {
  list: () => api.get<SavedSearch[]>("/api/v1/saved-searches"),
  create: (body: Omit<SavedSearch, "id" | "createdAt">) =>
    api.post<SavedSearch>("/api/v1/saved-searches", body),
  update: (id: string, body: Omit<SavedSearch, "id" | "createdAt">) =>
    api.put<SavedSearch>(`/api/v1/saved-searches/${id}`, body),
  remove: (id: string) => api.del<void>(`/api/v1/saved-searches/${id}`),
};

// ─── Applications + Favorites ─────────────────────────────────────────
export const applicationsApi = {
  mine: () => api.get<Page<Application>>("/api/v1/applications/mine"),
  apply: (body: { jobId: string; coverLetter?: string }) =>
    api.post<Application>("/api/v1/applications", body),
  withdraw: (id: string) => api.patch<Application>(`/api/v1/applications/${id}/withdraw`),
};

export const favoritesApi = {
  list: () => api.get<string[]>("/api/v1/favorites"),
  add: (jobId: string) => api.post<void>(`/api/v1/favorites/${jobId}`),
  remove: (jobId: string) => api.del<void>(`/api/v1/favorites/${jobId}`),
};

// ─── Companies + Reviews ──────────────────────────────────────────────
export const companiesApi = {
  list: () => api.get<Page<Company>>("/api/v1/companies"),
  bySlug: (slug: string) => api.get<Company>(`/api/v1/companies/${slug}`),
  reviews: (companyId: string) =>
    api.get<Page<Review>>(`/api/v1/companies/${companyId}/reviews`),
  createReview: (companyId: string, body: {
    rating: number;
    title?: string;
    body?: string;
    pros?: string;
    cons?: string;
    employmentStatus?: string;
  }) => api.post<Review>(`/api/v1/companies/${companyId}/reviews`, body),
  requestVerification: (id: string, body: { tradeRegisterNumber?: string; note?: string }) =>
    api.post<Company>(`/api/v1/companies/${id}/verification-request`, body),
};

// ─── Immigration ───────────────────────────────────────────────────────
export const anerkennungApi = {
  me: () => api.get<AnerkennungCase | null>("/api/v1/anerkennung/me"),
  create: (body: { profession: string; regulationType?: "REGULATED" | "NON_REGULATED" | "UNKNOWN" }) =>
    api.post<AnerkennungCase>("/api/v1/anerkennung", body),
  toggleStep: (stepId: string) =>
    api.patch<AnerkennungCase>(`/api/v1/anerkennung/steps/${stepId}/toggle`),
};

export const visaApi = {
  me: () => api.get<VisaCase | null>("/api/v1/visa/me"),
  create: (body: { visaType: VisaType; embassyCity?: string }) =>
    api.post<VisaCase>("/api/v1/visa", body),
  update: (body: { stage?: string; appointmentDate?: string; embassyCity?: string }) =>
    api.patch<VisaCase>("/api/v1/visa", body),
  toggleRequirement: (id: string) =>
    api.patch<VisaCase>(`/api/v1/visa/requirements/${id}/toggle`),
};

// ─── Documents + CV ────────────────────────────────────────────────────
export const documentsApi = {
  list: () => api.get<DocumentSummary[]>("/api/v1/documents"),
  upload: (file: File, type: DocumentType) => {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("type", type);
    return api.upload<DocumentSummary>("/api/v1/documents", fd);
  },
  remove: (id: string) => api.del<void>(`/api/v1/documents/${id}`),
  autofill: (documentId: string) =>
    api.post<CvHints>(`/api/v1/cv/${documentId}/autofill`),
};

// ─── Matching ──────────────────────────────────────────────────────────
export const matchingApi = {
  recommendations: (limit = 10) =>
    api.get<Recommendation[]>(`/api/v1/matching/recommendations?limit=${limit}`),
};

// ─── i18n (public) ─────────────────────────────────────────────────────
export const i18nApi = {
  messages: (locale: SupportedLocale, namespace = "default") =>
    api.public<Record<string, string>>(
      `/api/v1/i18n/messages?locale=${locale}&namespace=${namespace}`,
    ),
  professions: (q: string, locale: SupportedLocale, limit = 8) =>
    api.public<ProfessionSearchResult[]>(
      `/api/v1/professions?q=${encodeURIComponent(q)}&locale=${locale}&limit=${limit}`,
    ),
  referenceData: (type: string, locale: SupportedLocale) =>
    api.public<ReferenceEntry[]>(
      `/api/v1/reference-data/${type}?locale=${locale}`,
    ),
};
