/**
 * Profile-completeness field weights — single source of truth for the web client.
 * Mirror of the Java `tn.bewerbi.profile.ProfileCompleteness` class.
 */
export interface ProfileForCompleteness {
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  city?: string | null;
  country?: string | null;
  bio?: string | null;
  photo_url?: string | null;
  desired_profession?: string | null;
  german_level?: string | null;
  recognition_status?: string | null;
  skills?: string[];
}

interface Field {
  key: string;
  weight: number;
  labelKey: string;
  actionKey: string;
  route: string;
  check: (p: ProfileForCompleteness) => boolean;
}

const FIELDS: Field[] = [
  { key: "firstName", weight: 10, labelKey: "auth.firstName",
    actionKey: "profileAction.addFirstName", route: "/(applicant)/(profile)/edit",
    check: (p) => !!p.first_name?.trim() },
  { key: "lastName", weight: 10, labelKey: "auth.lastName",
    actionKey: "profileAction.addLastName", route: "/(applicant)/(profile)/edit",
    check: (p) => !!p.last_name?.trim() },
  { key: "phone", weight: 8, labelKey: "profile.phone",
    actionKey: "profileAction.addPhone", route: "/(applicant)/(profile)/edit",
    check: (p) => !!p.phone?.trim() },
  { key: "city", weight: 6, labelKey: "profile.city",
    actionKey: "profileAction.addCity", route: "/(applicant)/(profile)/edit",
    check: (p) => !!p.city?.trim() },
  { key: "country", weight: 4, labelKey: "profile.country",
    actionKey: "profileAction.addCountry", route: "/(applicant)/(profile)/edit",
    check: (p) => !!p.country?.trim() },
  { key: "bio", weight: 12, labelKey: "profile.bio",
    actionKey: "profileAction.addBio", route: "/(applicant)/(profile)/edit",
    check: (p) => !!p.bio?.trim() },
  { key: "photo", weight: 10, labelKey: "profile.photo",
    actionKey: "profileAction.addPhoto", route: "/(applicant)/(profile)/edit",
    check: (p) => !!p.photo_url?.trim() },
  { key: "desiredProfession", weight: 10, labelKey: "onboarding.step1Title",
    actionKey: "profileAction.addProfession", route: "/(applicant)/onboarding",
    check: (p) => !!p.desired_profession?.trim() },
  { key: "germanLevel", weight: 15, labelKey: "profile.level",
    actionKey: "profileAction.addGerman", route: "/(applicant)/onboarding",
    check: (p) => !!p.german_level },
  { key: "recognitionStatus", weight: 5, labelKey: "anerkennung.title",
    actionKey: "profileAction.addRecognition", route: "/(applicant)/anerkennung",
    check: (p) => !!p.recognition_status },
  { key: "skills", weight: 10, labelKey: "onboarding.step4Title",
    actionKey: "profileAction.addSkills", route: "/(applicant)/onboarding",
    check: (p) => (p.skills ?? []).length > 0 },
];

export interface CompletenessResult {
  percent: number;
  tier: CompletenessTier;
  missing: MissingField[];
  nextAction: MissingField | null;
}

export interface MissingField {
  key: string;
  weight: number;
  labelKey: string;
  actionKey: string;
  route: string;
}

export type CompletenessTier = "starter" | "mover" | "advanced" | "complete";

export function compute(profile: ProfileForCompleteness | null): CompletenessResult {
  if (!profile) return { percent: 0, tier: "starter", missing: [], nextAction: null };

  let percent = 0;
  const missing: MissingField[] = [];
  for (const f of FIELDS) {
    if (f.check(profile)) {
      percent += f.weight;
    } else {
      missing.push({
        key: f.key,
        weight: f.weight,
        labelKey: f.labelKey,
        actionKey: f.actionKey,
        route: f.route,
      });
    }
  }
  percent = Math.min(100, percent);

  // Next action: heaviest missing field (highest impact)
  const nextAction = missing.length
    ? [...missing].sort((a, b) => b.weight - a.weight)[0]
    : null;

  return { percent, tier: tierFor(percent), missing, nextAction };
}

export function tierFor(percent: number): CompletenessTier {
  if (percent >= 100) return "complete";
  if (percent >= 75) return "advanced";
  if (percent >= 40) return "mover";
  return "starter";
}

export const TIER_META: Record<
  CompletenessTier,
  { labelKey: string; color: string; bgClass: string; emoji: string }
> = {
  starter: { labelKey: "tier.starter", color: "#6b7280", bgClass: "bg-gray-100", emoji: "🌱" },
  mover: { labelKey: "tier.mover", color: "#2563EB", bgClass: "bg-primary-50", emoji: "🚀" },
  advanced: { labelKey: "tier.advanced", color: "#7c3aed", bgClass: "bg-purple-50", emoji: "⭐" },
  complete: { labelKey: "tier.complete", color: "#16a34a", bgClass: "bg-success-100", emoji: "🏆" },
};
