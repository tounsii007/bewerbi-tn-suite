/**
 * Thin fetch-based client for the bewerbi.tn Java backend.
 * Used when EXPO_PUBLIC_API_BASE is set; otherwise the app falls back to mock mode.
 *
 * Features:
 *  - Automatic Authorization-Bearer injection
 *  - Accept-Language header propagation from the i18n runtime
 *  - On 401: transparently refreshes the access token and retries once
 *  - Proactive background refresh 60 s before the token expires
 */
import type {
  JobCategory,
  JobType,
  LanguageLevel,
  Profile,
} from "../types";
import i18n from "../i18n";

const BASE =
  process.env.EXPO_PUBLIC_API_BASE ?? "";

export const IS_API_MODE = BASE.length > 0;

export type ApiError = {
  status: number;
  code: string;
  message: string;
  messageKey?: string;
  violations?: { field: string; message: string; messageKey?: string }[];
};

// ----- Auth state wiring -------------------------------------------------

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAtMs: number; // epoch ms
}
let state: AuthState = { accessToken: null, refreshToken: null, expiresAtMs: 0 };
let onUnauthorized: () => void = () => {};
let onTokensRefreshed: (resp: AuthResponse) => void = () => {};
let scheduledRefreshHandle: ReturnType<typeof setTimeout> | null = null;
let ongoingRefresh: Promise<AuthResponse> | null = null;

export function configureApi(opts: {
  onUnauthorized?: () => void;
  onTokensRefreshed?: (resp: AuthResponse) => void;
}) {
  if (opts.onUnauthorized) onUnauthorized = opts.onUnauthorized;
  if (opts.onTokensRefreshed) onTokensRefreshed = opts.onTokensRefreshed;
}

/** Called by the authStore after login / refresh. Sets up auto-refresh. */
export function setTokens(resp: AuthResponse | null): void {
  if (scheduledRefreshHandle) {
    clearTimeout(scheduledRefreshHandle);
    scheduledRefreshHandle = null;
  }
  if (!resp) {
    state = { accessToken: null, refreshToken: null, expiresAtMs: 0 };
    return;
  }
  const expiresAtMs = new Date(resp.accessTokenExpiresAt).getTime();
  state = {
    accessToken: resp.accessToken,
    refreshToken: resp.refreshToken,
    expiresAtMs,
  };
  scheduleProactiveRefresh();
}

function scheduleProactiveRefresh() {
  // Fire 60 s before expiry, but at least 5 s from now.
  const lead = 60_000;
  const delay = Math.max(5_000, state.expiresAtMs - Date.now() - lead);
  scheduledRefreshHandle = setTimeout(() => {
    refreshAccessToken().catch(() => onUnauthorized());
  }, delay);
}

async function refreshAccessToken(): Promise<AuthResponse> {
  if (ongoingRefresh) return ongoingRefresh;
  if (!state.refreshToken) throw { status: 401, code: "UNAUTHORIZED", message: "no refresh token" } satisfies ApiError;

  ongoingRefresh = (async () => {
    const resp = await rawRequest<AuthResponse>("/api/v1/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken: state.refreshToken }),
    });
    setTokens(resp);
    onTokensRefreshed(resp);
    return resp;
  })();
  try {
    return await ongoingRefresh;
  } finally {
    ongoingRefresh = null;
  }
}

// ----- Low-level request wrappers ---------------------------------------

async function rawRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body && !(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (!headers.has("Accept-Language")) {
    headers.set("Accept-Language", i18n.language || "de");
  }
  const res = await fetch(`${BASE}${path}`, { ...init, headers });
  if (!res.ok) {
    const err: ApiError = await res.json().catch(() => ({
      status: res.status,
      code: "UNKNOWN",
      message: res.statusText,
    }));
    throw err;
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (state.accessToken) headers.set("Authorization", `Bearer ${state.accessToken}`);
  try {
    return await rawRequest<T>(path, { ...init, headers });
  } catch (e) {
    const apiErr = e as ApiError;
    if (apiErr.status !== 401 || !state.refreshToken) {
      if (apiErr.status === 401) onUnauthorized();
      throw apiErr;
    }
    // 401 → try once to refresh and retry
    try {
      await refreshAccessToken();
    } catch {
      onUnauthorized();
      throw apiErr;
    }
    const retryHeaders = new Headers(init.headers);
    if (state.accessToken) retryHeaders.set("Authorization", `Bearer ${state.accessToken}`);
    return rawRequest<T>(path, { ...init, headers: retryHeaders });
  }
}

// ---------- Auth ----------

export interface AuthResponse {
  accessToken: string;
  accessTokenExpiresAt: string;
  accessTokenExpiresIn: number;
  refreshToken: string;
  refreshTokenExpiresAt: string;
  user: { id: string; email: string; role: string; emailVerified: boolean; preferredLocale?: string };
}

export const authApi = {
  register: (body: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: "APPLICANT" | "EMPLOYER";
  }) => rawRequest<AuthResponse>("/api/v1/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body: { email: string; password: string }) =>
    rawRequest<AuthResponse>("/api/v1/auth/login", { method: "POST", body: JSON.stringify(body) }),
  refresh: (refreshToken: string) =>
    rawRequest<AuthResponse>("/api/v1/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    }),
  logout: (refreshToken: string) =>
    request<void>("/api/v1/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    }),
  logoutAll: () => request<void>("/api/v1/auth/logout-all", { method: "POST" }),
  verifyEmail: (token: string) =>
    rawRequest<void>(`/api/v1/auth/verify-email?token=${encodeURIComponent(token)}`),
  forgotPassword: (email: string) =>
    rawRequest<void>("/api/v1/auth/password/forgot", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),
  resetPassword: (token: string, newPassword: string) =>
    rawRequest<void>("/api/v1/auth/password/reset", {
      method: "POST",
      body: JSON.stringify({ token, newPassword }),
    }),
  changePassword: (oldPassword: string, newPassword: string) =>
    request<void>("/api/v1/auth/password/change", {
      method: "POST",
      body: JSON.stringify({ oldPassword, newPassword }),
    }),
  sessions: () =>
    request<
      { tokenHash: string; createdAt: number; userAgent: string; expiresInSeconds: number }[]
    >("/api/v1/auth/me/sessions"),
  revokeSession: (tokenHash: string) =>
    request<void>(`/api/v1/auth/me/sessions/${encodeURIComponent(tokenHash)}`, {
      method: "DELETE",
    }),
};

// ---------- Profile ----------

export interface ProfileResponse extends Profile {
  desired_profession?: string;
  german_level?: LanguageLevel | null;
  recognition_status?: string | null;
  onboarding_completed?: boolean;
  skills?: string[];
  completenessPercent?: number;
}

export const profileApi = {
  me: () => request<ProfileResponse>("/api/v1/profile/me"),
  update: (body: Partial<ProfileResponse>) =>
    request<ProfileResponse>("/api/v1/profile/me", { method: "PUT", body: JSON.stringify(body) }),
  completeOnboarding: (body: {
    desiredProfession?: string;
    germanLevel?: LanguageLevel;
    recognitionStatus?: string;
    skills?: string[];
  }) =>
    request<ProfileResponse>("/api/v1/profile/onboarding", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};

// ---------- Saved searches ----------

export interface SavedSearchBody {
  name: string;
  query?: string;
  category?: JobCategory;
  type?: JobType;
  location?: string;
  minGermanLevel?: LanguageLevel;
  salaryMin?: number;
  alertsEnabled: boolean;
}

export interface SavedSearch extends SavedSearchBody {
  id: string;
}

export const savedSearchApi = {
  list: () => request<SavedSearch[]>("/api/v1/saved-searches"),
  create: (body: SavedSearchBody) =>
    request<SavedSearch>("/api/v1/saved-searches", { method: "POST", body: JSON.stringify(body) }),
  update: (id: string, body: SavedSearchBody) =>
    request<SavedSearch>(`/api/v1/saved-searches/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),
  remove: (id: string) =>
    request<void>(`/api/v1/saved-searches/${id}`, { method: "DELETE" }),
};

// ---------- Anerkennung ----------

export interface AnerkennungStep {
  id: string;
  title: string;
  description?: string;
  sortOrder: number;
  completed: boolean;
  completedAt?: string;
  documentId?: string;
}

export interface AnerkennungCase {
  id: string;
  profession: string;
  regulationType: "REGULATED" | "NON_REGULATED" | "UNKNOWN";
  competentAuthority?: string;
  stage: string;
  progressPercent: number;
  steps: AnerkennungStep[];
}

export const anerkennungApi = {
  me: () => request<AnerkennungCase | null>("/api/v1/anerkennung/me"),
  create: (body: { profession: string; regulationType?: string }) =>
    request<AnerkennungCase>("/api/v1/anerkennung", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  toggleStep: (stepId: string) =>
    request<AnerkennungCase>(`/api/v1/anerkennung/steps/${stepId}/toggle`, { method: "PATCH" }),
};

// ---------- Visa ----------

export type VisaType =
  | "BLUE_CARD"
  | "SKILLED_WORKER_VOCATIONAL"
  | "SKILLED_WORKER_ACADEMIC"
  | "VOCATIONAL_TRAINING"
  | "STUDY"
  | "JOB_SEEKER"
  | "RECOGNITION"
  | "CHANCENKARTE";

export interface VisaRequirement {
  id: string;
  title: string;
  description?: string;
  required: boolean;
  sortOrder: number;
  completed: boolean;
  completedAt?: string;
  documentId?: string;
}

export interface VisaCase {
  id: string;
  visaType: VisaType;
  stage: string;
  appointmentDate?: string;
  embassyCity?: string;
  progressPercent: number;
  requirements: VisaRequirement[];
}

export const visaApi = {
  me: () => request<VisaCase | null>("/api/v1/visa/me"),
  create: (body: { visaType: VisaType; embassyCity?: string }) =>
    request<VisaCase>("/api/v1/visa", { method: "POST", body: JSON.stringify(body) }),
  update: (body: { stage?: string; appointmentDate?: string; embassyCity?: string }) =>
    request<VisaCase>("/api/v1/visa", { method: "PATCH", body: JSON.stringify(body) }),
  toggleRequirement: (id: string) =>
    request<VisaCase>(`/api/v1/visa/requirements/${id}/toggle`, { method: "PATCH" }),
};

// ---------- Companies & reviews ----------

export interface Company {
  id: string;
  name: string;
  slug: string;
  description?: string;
  website?: string;
  logoUrl?: string;
  industry?: string;
  size?: string;
  country?: string;
  city?: string;
  verificationStatus: "UNVERIFIED" | "PENDING_REVIEW" | "VERIFIED" | "REJECTED";
  ratingAvg?: number;
  ratingCount: number;
}

export interface CompanyReview {
  id: string;
  companyId: string;
  authorUserId: string;
  rating: number;
  title?: string;
  body?: string;
  pros?: string;
  cons?: string;
  employmentStatus?: string;
  createdAt: string;
}

export const companiesApi = {
  bySlug: (slug: string) => request<Company>(`/api/v1/companies/${slug}`),
  listReviews: (companyId: string) =>
    request<{ content: CompanyReview[] }>(`/api/v1/companies/${companyId}/reviews`),
  createReview: (
    companyId: string,
    body: {
      rating: number;
      title?: string;
      body?: string;
      pros?: string;
      cons?: string;
      employmentStatus?: string;
    },
  ) =>
    request<CompanyReview>(`/api/v1/companies/${companyId}/reviews`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  requestVerification: (
    id: string,
    body: { tradeRegisterNumber?: string; note?: string },
  ) =>
    request<Company>(`/api/v1/companies/${id}/verification-request`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
};

// ---------- Documents + CV autofill ----------

export interface DocumentSummary {
  id: string;
  type: string;
  name: string;
  contentType?: string;
  sizeBytes?: number;
  hasParsedText: boolean;
  createdAt: string;
}

export interface CvHints {
  email?: string;
  phone?: string;
  germanLevel?: LanguageLevel;
  skills: string[];
  languages: string[];
  education: string[];
  experiences: string[];
}

export const documentsApi = {
  list: () => request<DocumentSummary[]>("/api/v1/documents"),
  upload: async (file: Blob, name: string, type: string): Promise<DocumentSummary> => {
    const form = new FormData();
    form.append("file", file, name);
    form.append("type", type);
    return request<DocumentSummary>(`/api/v1/documents`, { method: "POST", body: form });
  },
  autofill: (documentId: string) =>
    request<CvHints>(`/api/v1/cv/${documentId}/autofill`, { method: "POST" }),
};
