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

/**
 * Explicit total headcount only (e.g. "员工80人" / "80名员工" / "80人规模").
 * Bare "N人" and concurrent use ("10人同时使用") are not total headcount.
 */
export function parseExplicitHeadcountFromNotes(
  notes: string | null | undefined,
): number | undefined {
  const text = notes?.trim() || "";
  if (!text) return undefined;
  const patterns = [
    /员工\s*(?:约|共|总计)?\s*(\d{1,6})\s*(?:人|名)(?!\s*同时)/,
    /(\d{1,6})\s*(?:名|位|个)?\s*(?:员工|职工)/,
    /(\d{1,6})\s*人\s*(?:规模|企业|公司|团队)/,
  ];
  for (const re of patterns) {
    const m = text.match(re);
    const n = m ? Number(m[1]) : NaN;
    if (Number.isFinite(n) && n > 0) return Math.floor(n);
  }
  return undefined;
}

export type ResolvedHeadcount = {
  value: number;
  source: "quote" | "project" | "notes";
};

/**
 * Canonical headcount shared by requirement analysis and Quote generation:
 * structured Quote targetUsers → structured Project targetUsers → explicit notes.
 * Returns undefined when unknown; never a default.
 */
export function resolveCanonicalHeadcount(input: {
  targetUsers?: number | null;
  projectTargetUsers?: number | null;
  notes?: string | null;
}): ResolvedHeadcount | undefined {
  const structured = (value: number | null | undefined) =>
    typeof value === "number" && Number.isFinite(value) && value > 0
      ? Math.floor(value)
      : undefined;
  const quoteUsers = structured(input.targetUsers);
  if (quoteUsers != null) return { value: quoteUsers, source: "quote" };
  const projectUsers = structured(input.projectTargetUsers);
  if (projectUsers != null) return { value: projectUsers, source: "project" };
  const notesUsers = parseExplicitHeadcountFromNotes(input.notes);
  if (notesUsers != null) return { value: notesUsers, source: "notes" };
  return undefined;
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
