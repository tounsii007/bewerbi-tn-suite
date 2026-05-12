/**
 * Curated dictionary of professions tailored to Tunisian applicants
 * aiming at the German market. Each entry maps to suggested skills
 * and whether the profession is reglementiert in Germany.
 */
export interface ProfessionEntry {
  de: string;
  fr?: string;
  ar?: string;
  regulated: boolean;
  skills: string[];
  categoryHint?: "IT" | "PFLEGE" | "TRANSPORT" | "HANDWERK" | "GASTRO" | "BAU";
}

export const PROFESSIONS: ProfessionEntry[] = [
  // IT
  { de: "IT-Entwickler/in", fr: "Développeur·euse informatique", ar: "مطور/ة برمجيات",
    regulated: false, categoryHint: "IT",
    skills: ["JavaScript", "TypeScript", "React", "Node.js", "Git"] },
  { de: "Java-Entwickler/in", regulated: false, categoryHint: "IT",
    skills: ["Java", "Spring Boot", "Hibernate", "Maven", "JUnit"] },
  { de: "Data Engineer", regulated: false, categoryHint: "IT",
    skills: ["Python", "SQL", "Airflow", "Spark", "dbt"] },
  { de: "DevOps Engineer", regulated: false, categoryHint: "IT",
    skills: ["Docker", "Kubernetes", "Terraform", "AWS", "CI/CD"] },
  { de: "UI/UX Designer/in", regulated: false, categoryHint: "IT",
    skills: ["Figma", "Design Systems", "Prototyping", "User Research"] },

  // Pflege & Gesundheit
  { de: "Gesundheits- und Krankenpfleger/in", fr: "Infirmier·ère", ar: "ممرض/ة",
    regulated: true, categoryHint: "PFLEGE",
    skills: ["Patientenbetreuung", "Medikamentengabe", "Dokumentation", "Erste Hilfe"] },
  { de: "Altenpfleger/in", regulated: true, categoryHint: "PFLEGE",
    skills: ["Grundpflege", "Mobilisation", "Pflegeplanung", "Empathie"] },
  { de: "Arzt/Ärztin", fr: "Médecin", ar: "طبيب/ة",
    regulated: true, categoryHint: "PFLEGE",
    skills: ["Anamnese", "Diagnostik", "Approbation", "Klinische Erfahrung"] },
  { de: "Medizinische/r Fachangestellte/r", regulated: true, categoryHint: "PFLEGE",
    skills: ["Blutabnahme", "EKG", "Terminmanagement", "Patientenaufnahme"] },
  { de: "Physiotherapeut/in", regulated: true, categoryHint: "PFLEGE",
    skills: ["Manuelle Therapie", "KG-Neuro", "Reha", "Dokumentation"] },

  // Transport
  { de: "Berufskraftfahrer/in (LKW)", fr: "Chauffeur·euse poids lourd", ar: "سائق/ة شاحنة",
    regulated: true, categoryHint: "TRANSPORT",
    skills: ["CE-Führerschein", "ADR-Schein", "Tourenplanung", "Ladungssicherung"] },
  { de: "Logistikfachkraft", regulated: false, categoryHint: "TRANSPORT",
    skills: ["Lager", "Disposition", "SAP", "Staplerschein"] },

  // Handwerk
  { de: "Elektriker/in", regulated: true, categoryHint: "HANDWERK",
    skills: ["VDE-Normen", "Installation", "Instandhaltung", "Messtechnik"] },
  { de: "Schweißer/in", regulated: false, categoryHint: "HANDWERK",
    skills: ["MAG", "WIG", "MIG", "Schweißerprüfung"] },
  { de: "KFZ-Mechatroniker/in", regulated: true, categoryHint: "HANDWERK",
    skills: ["Diagnose", "Motorinstandsetzung", "OBD", "Karosserie"] },
  { de: "Anlagenmechaniker/in SHK", regulated: true, categoryHint: "HANDWERK",
    skills: ["Heizungsbau", "Sanitär", "Gas", "Wärmepumpen"] },

  // Bau
  { de: "Maurer/in", regulated: false, categoryHint: "BAU",
    skills: ["Mauerwerk", "Schalung", "Putz", "Baustellenlogistik"] },
  { de: "Bauingenieur/in", regulated: false, categoryHint: "BAU",
    skills: ["Statik", "AutoCAD", "BIM", "VOB"] },

  // Gastronomie
  { de: "Koch/Köchin", regulated: false, categoryHint: "GASTRO",
    skills: ["HACCP", "A-la-carte", "Warenkunde", "Küchenhygiene"] },
  { de: "Hotelfachmann/-frau", regulated: false, categoryHint: "GASTRO",
    skills: ["Rezeption", "Opera PMS", "Service", "Fremdsprachen"] },
];

/**
 * Returns profession suggestions matching the prefix (case-insensitive).
 * Works on DE, FR and AR labels.
 */
export function searchProfessions(prefix: string, limit = 8): ProfessionEntry[] {
  const q = prefix.trim().toLowerCase();
  if (q.length < 2) return [];
  return PROFESSIONS.filter((p) => {
    const haystack = [p.de, p.fr, p.ar].filter(Boolean).map((s) => s!.toLowerCase());
    return haystack.some((h) => h.includes(q));
  }).slice(0, limit);
}

export function professionByLabel(label: string): ProfessionEntry | undefined {
  const l = label.trim().toLowerCase();
  return PROFESSIONS.find((p) =>
    [p.de, p.fr, p.ar].some((s) => s?.toLowerCase() === l),
  );
}
