/**
 * Contract types mirroring the backend DTOs. Keep in sync with:
 *   - tn.bewerbi.identity.auth.AuthService.AuthResponse
 *   - tn.bewerbi.identity.profile.ProfileController.ProfileResponse
 *   - tn.bewerbi.jobs.api.JobController.JobResponse
 *   …etc.
 */

export type UserRole = "APPLICANT" | "EMPLOYER" | "ADMIN";
export type JobCategory =
  | "IT"
  | "PFLEGE"
  | "TRANSPORT"
  | "HANDWERK"
  | "GASTRO"
  | "BAU"
  | "SONSTIGE";
export type JobType =
  | "JOB"
  | "AUSBILDUNG"
  | "STUDIUM"
  | "SPRACHKURS"
  | "PRAKTIKUM";
export type JobStatus = "ACTIVE" | "PAUSED" | "CLOSED" | "DRAFT";
export type GermanLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
export type RecognitionStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "PARTIALLY_RECOGNIZED"
  | "FULLY_RECOGNIZED"
  | "NOT_REQUIRED";
export type ApplicationStatus =
  | "PENDING"
  | "REVIEWED"
  | "INTERVIEW"
  | "ACCEPTED"
  | "REJECTED"
  | "WITHDRAWN";
export type VerificationStatus =
  | "UNVERIFIED"
  | "PENDING_REVIEW"
  | "VERIFIED"
  | "REJECTED";
export type AlertFrequency = "INSTANT" | "DAILY" | "WEEKLY" | "OFF";
export type VisaType =
  | "BLUE_CARD"
  | "SKILLED_WORKER_VOCATIONAL"
  | "SKILLED_WORKER_ACADEMIC"
  | "VOCATIONAL_TRAINING"
  | "STUDY"
  | "JOB_SEEKER"
  | "RECOGNITION"
  | "CHANCENKARTE";
export type DocumentType =
  | "CV"
  | "DIPLOMA"
  | "CERTIFICATE"
  | "TRANSCRIPT"
  | "LANGUAGE_CERTIFICATE"
  | "PASSPORT"
  | "BIRTH_CERTIFICATE"
  | "OTHER";

export type SupportedLocale = "de" | "fr" | "ar";
export const SUPPORTED_LOCALES: SupportedLocale[] = ["de", "fr", "ar"];
export const RTL_LOCALES: SupportedLocale[] = ["ar"];

// ─── Auth ──────────────────────────────────────────────────────────────
export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
  preferredLocale: SupportedLocale;
  /** Iter 169 — true when the account has a usable bcrypt hash on file.
   *  Drives the visibility of "Passwort ändern" vs "Passwort setzen". */
  hasPassword?: boolean;
  /** Iter 169 — true when a Google identity is linked to the account.
   *  Drives the visibility of "Mit Google verknüpfen" vs "Verknüpfung
   *  entfernen". */
  hasGoogleLinked?: boolean;
}

export interface AuthResponse {
  accessToken: string;
  accessTokenExpiresAt: string;
  accessTokenExpiresIn: number;
  refreshToken: string;
  refreshTokenExpiresAt: string;
  user: AuthUser;
}

// ─── Profile ───────────────────────────────────────────────────────────
export interface LocalizedMissingField {
  key: string;
  weight: number;
  label: string;
  action: string;
  route: string;
}

export interface CompletenessResponse {
  percent: number;
  tier: "STARTER" | "MOVER" | "ADVANCED" | "COMPLETE";
  tierLabel: string;
  missing: LocalizedMissingField[];
  nextAction: LocalizedMissingField | null;
}

export interface ProfileResponse {
  id: string;
  userId: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  city?: string | null;
  country?: string | null;
  bio?: string | null;
  photoUrl?: string | null;
  desiredProfession?: string | null;
  germanLevel?: GermanLevel | null;
  recognitionStatus?: RecognitionStatus | null;
  onboardingCompleted: boolean;
  skills: string[];
  completeness: CompletenessResponse;
}

// ─── Jobs ──────────────────────────────────────────────────────────────
export interface Job {
  id: string;
  companyId: string;
  title: string;
  description: string;
  requirements?: string | null;
  category: JobCategory;
  type: JobType;
  location: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string;
  germanLevel?: GermanLevel | null;
  status: JobStatus;
  premium: boolean;
  createdAt: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

// ─── Saved searches ────────────────────────────────────────────────────
export interface SavedSearch {
  id: string;
  name: string;
  query?: string | null;
  category?: JobCategory | null;
  type?: JobType | null;
  location?: string | null;
  minGermanLevel?: GermanLevel | null;
  salaryMin?: number | null;
  alertsEnabled: boolean;
  alertFrequency: AlertFrequency;
  createdAt: string;
}

// ─── Applications ──────────────────────────────────────────────────────
export interface Application {
  id: string;
  jobId: string;
  applicantUserId: string;
  coverLetter?: string | null;
  status: ApplicationStatus;
  matchScore?: number | null;
  createdAt: string;
}

// ─── Companies ─────────────────────────────────────────────────────────
export interface Company {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  website?: string | null;
  logoUrl?: string | null;
  industry?: string | null;
  size?: string | null;
  country?: string | null;
  city?: string | null;
  verificationStatus: VerificationStatus;
  ratingAvg?: number | null;
  ratingCount: number;
}

export interface Review {
  id: string;
  companyId: string;
  authorUserId: string;
  rating: number;
  title?: string | null;
  body?: string | null;
  pros?: string | null;
  cons?: string | null;
  employmentStatus?: string | null;
  createdAt: string;
}

// ─── Immigration ───────────────────────────────────────────────────────
export interface AnerkennungStep {
  id: string;
  title: string;
  description?: string | null;
  sortOrder: number;
  completed: boolean;
  completedAt?: string | null;
  documentId?: string | null;
}

export interface AnerkennungCase {
  id: string;
  profession: string;
  regulationType: "REGULATED" | "NON_REGULATED" | "UNKNOWN";
  competentAuthority?: string | null;
  stage: string;
  progressPercent: number;
  steps: AnerkennungStep[];
}

export interface VisaRequirement {
  id: string;
  title: string;
  description?: string | null;
  required: boolean;
  sortOrder: number;
  completed: boolean;
  completedAt?: string | null;
  documentId?: string | null;
}

export interface VisaCase {
  id: string;
  visaType: VisaType;
  stage: string;
  appointmentDate?: string | null;
  embassyCity?: string | null;
  progressPercent: number;
  requirements: VisaRequirement[];
}

// ─── Documents + CV ────────────────────────────────────────────────────
export interface DocumentSummary {
  id: string;
  type: DocumentType;
  name: string;
  contentType?: string | null;
  sizeBytes?: number | null;
  hasParsedText: boolean;
  createdAt: string;
}

export interface CvHints {
  email?: string | null;
  phone?: string | null;
  germanLevel?: GermanLevel | null;
  skills: string[];
  languages: string[];
}

// ─── Matching ──────────────────────────────────────────────────────────
export interface Recommendation {
  job: Job;
  matchPercent: number;
  reasons: string[];
}

// ─── API error envelope ────────────────────────────────────────────────
export interface ApiError {
  status: number;
  code: string;
  message: string;
  messageKey?: string;
  violations?: { field: string; message: string; messageKey?: string }[];
  timestamp?: string;
}

// ─── i18n reference data ───────────────────────────────────────────────
export interface ReferenceEntry {
  code: string;
  sortOrder: number;
  label: string;
  hint?: string | null;
  metadata?: Record<string, unknown>;
}

export interface ProfessionSearchResult {
  code: string;
  label: string;
  regulated: boolean;
  categoryHint?: string | null;
  skills: string[];
}
