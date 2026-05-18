export function normalizeTenderText(input: string): string {
  return String(input || "")
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/第\s*(\d+)\s*页\s*共\s*\d+\s*页/g, "")
    .replace(/（\s*一\s*）/g, "（一）")
    .replace(/\(\s*(\d+)\s*\)/g, "($1)")
    .trim();
}

