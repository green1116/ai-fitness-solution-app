/**
 * Quote revision helpers — explicit area / strength / site phrases only.
 * Shared by proposal, generateSolution, and placeholders (no duplicated regex).
 */

import type { CompanyInfoInput } from "./types";

/** Explicit area only — e.g. "100平米" / "100㎡". No invented defaults. */
export function parseExplicitAreaM2FromNotes(
  notes: string | null | undefined,
): number | undefined {
  const text = notes?.trim() || "";
  if (!text) return undefined;
  const match = text.match(/(\d+(?:\.\d+)?)\s*(?:平方米|平米|㎡|m²|m2)/i);
  if (!match) return undefined;
  const value = Number(match[1]);
  if (!Number.isFinite(value) || value <= 0) return undefined;
  return Math.round(value);
}

export function hasStrengthEquipmentEmphasis(
  notes: string | null | undefined,
): boolean {
  const text = notes?.trim() || "";
  return /偏重力量|力量器械为主|力量为主/.test(text);
}

export function hasBasementNoVentilationConstraint(
  notes: string | null | undefined,
): boolean {
  const text = notes?.trim() || "";
  if (!text) return false;
  if (/地下室无通风/.test(text)) return true;
  return /地下室/.test(text) && /无通风/.test(text);
}

/** Preserve notes; fill/override areaM2 only when notes contain an explicit area. */
export function applyQuoteRevisionOverrides(
  companyInfo: CompanyInfoInput,
): CompanyInfoInput {
  const notes = companyInfo.notes?.trim() || undefined;
  const fromNotes = parseExplicitAreaM2FromNotes(notes);
  const fromField =
    typeof companyInfo.areaM2 === "number" &&
    Number.isFinite(companyInfo.areaM2) &&
    companyInfo.areaM2 > 0
      ? companyInfo.areaM2
      : undefined;
  // Explicit area in notes overrides stale project/default areaM2.
  const areaM2 = fromNotes ?? fromField;
  return {
    ...companyInfo,
    ...(notes ? { notes } : {}),
    ...(areaM2 != null ? { areaM2 } : {}),
  };
}
