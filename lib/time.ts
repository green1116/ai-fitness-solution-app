export function now(): Date {
  if (process.env.FORCE_NOW) {
    return new Date(process.env.FORCE_NOW);
  }
  return new Date();
}

/** YYYYMMDD in Asia/Tokyo (for tenderNo, doc numbers, etc.) */
export function todayYYYYMMDD(tz = "Asia/Tokyo"): string {
  const d = now();
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = fmt.formatToParts(d);
  const y = parts.find((p) => p.type === "year")?.value ?? "0000";
  const m = parts.find((p) => p.type === "month")?.value ?? "00";
  const day = parts.find((p) => p.type === "day")?.value ?? "00";
  return `${y}${m}${day}`;
}

/** YYYY/MM/DD in Asia/Tokyo */
export function todaySlash(tz = "Asia/Tokyo"): string {
  const d = now();
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(d).replace(/-/g, "/");
}
