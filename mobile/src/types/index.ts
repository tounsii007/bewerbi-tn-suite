export type UserRole = "applicant" | "employer" | "admin";

export type JobCategory = "it" | "pflege" | "transport" | "sonstige";
export type JobType = "job" | "ausbildung" | "studium" | "sprachkurs";
export type ApplicationStatus = "pending" | "reviewed" | "accepted" | "rejected";
export type LanguageLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
export type DocumentType = "cv" | "diploma" | "certificate" | "transcript";

export interface Profile {
  id: string;
  user_id: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  photo_url: string | null;
  phone: string;
  city: string;
  country: string;
  bio: string;
  created_at: string;
}

export interface Education {
  id: string;
  profile_id: string;
  degree: string;
  institution: string;
  field_of_study: string;
  country: string;
  start_date: string;
  end_date: string | null;
}

export interface Experience {
  id: string;
  profile_id: string;
  job_title: string;
  company: string;
  location: string;
  start_date: string;
  end_date: string | null;
  description: string;
}

export interface Document {
  id: string;
  profile_id: string;
  type: DocumentType;
  file_url: string;
  name: string;
  created_at: string;
}

export interface LanguageSkill {
  id: string;
  profile_id: string;
  language: string;
  level: LanguageLevel;
}

export interface Job {
  id: string;
  employer_id: string;
  title: string;
  description: string;
  category: JobCategory;
  type: JobType;
  location: string;
  requirements: string;
  salary_range: string | null;
  german_level: LanguageLevel | null;
  created_at: string;
  status: "active" | "closed";
  employer?: Profile;
}

export interface Application {
  id: string;
  job_id: string;
  applicant_id: string;
  status: ApplicationStatus;
  cover_letter: string;
  created_at: string;
  job?: Job;
  applicant?: Profile;
}

export interface Favorite {
  id: string;
  user_id: string;
  job_id: string;
  job?: Job;
}
