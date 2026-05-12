import i18n from "../i18n";

function localeTag(): string {
  switch (i18n.language) {
    case "fr":
      return "fr-FR";
    case "ar":
      return "ar-TN";
    case "de":
    default:
      return "de-DE";
  }
}

export const fmt = {
  number(value: number, maximumFractionDigits = 0): string {
    return new Intl.NumberFormat(localeTag(), { maximumFractionDigits }).format(value);
  },
  percent(value: number, digits = 0): string {
    return new Intl.NumberFormat(localeTag(), {
      style: "percent",
      maximumFractionDigits: digits,
    }).format(value / 100);
  },
  currency(value: number, currency: "EUR" | "TND" = "EUR"): string {
    return new Intl.NumberFormat(localeTag(), {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  },
  date(input: string | Date, opts: Intl.DateTimeFormatOptions = { dateStyle: "medium" }): string {
    const d = typeof input === "string" ? new Date(input) : input;
    return new Intl.DateTimeFormat(localeTag(), opts).format(d);
  },
  relative(input: string | Date): string {
    const d = typeof input === "string" ? new Date(input) : input;
    const diffMs = d.getTime() - Date.now();
    const diffDay = Math.round(diffMs / (1000 * 60 * 60 * 24));
    const rtf = new Intl.RelativeTimeFormat(localeTag(), { numeric: "auto" });
    if (Math.abs(diffDay) >= 30) return rtf.format(Math.round(diffDay / 30), "month");
    if (Math.abs(diffDay) >= 1) return rtf.format(diffDay, "day");
    const diffHr = Math.round(diffMs / (1000 * 60 * 60));
    if (Math.abs(diffHr) >= 1) return rtf.format(diffHr, "hour");
    const diffMin = Math.round(diffMs / (1000 * 60));
    return rtf.format(diffMin, "minute");
  },
};
