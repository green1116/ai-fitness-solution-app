/**
 * V80 Pilot P5 — Evidence spans + deterministic confidence scoring
 */

import type {
  ConfidenceBand,
  RequirementEvidenceSpan,
  RequirementItem,
  TenderRequirements,
} from "./requirements.schema";
import type { TenderParseResult } from "@/lib/tender/types";

/** Items at or below this score require explicit reviewer confirmation */
export const CONFIDENCE_LOW_THRESHOLD = 0.5;
export const CONFIDENCE_HIGH_THRESHOLD = 0.75;

export function confidenceBandFromScore(score: number): ConfidenceBand {
  if (score >= CONFIDENCE_HIGH_THRESHOLD) return "high";
  if (score >= CONFIDENCE_LOW_THRESHOLD) return "medium";
  return "low";
}

function normalizeForMatch(s: string): string {
  return s.replace(/\s+/g, "").toLowerCase();
}

function parsePageNumber(pageRef?: string): number | undefined {
  if (!pageRef) return undefined;
  const n = Number.parseInt(pageRef.replace(/\D/g, ""), 10);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

/** Find best page excerpt supporting requirement text (deterministic). */
export function findEvidenceSpans(
  text: string,
  pages: TenderParseResult["pages"],
  pageHint?: string,
  maxSpans = 2,
): RequirementEvidenceSpan[] {
  const needle = text.trim();
  if (!needle || pages.length === 0) return [];

  const hintPage = parsePageNumber(pageHint);
  const compactNeedle = normalizeForMatch(needle);
  const fragment =
    compactNeedle.length > 24 ? compactNeedle.slice(0, 24) : compactNeedle;

  const scored: Array<RequirementEvidenceSpan & { score: number }> = [];

  for (const page of pages) {
    const compactPage = normalizeForMatch(page.text);
    const idx = compactPage.indexOf(fragment);
    if (idx < 0 && hintPage !== page.page) continue;

    let excerpt = page.text.slice(0, 160).replace(/\s+/g, " ").trim();
    let start: number | undefined;
    let end: number | undefined;
    let score = hintPage === page.page ? 0.4 : 0.2;

    if (idx >= 0) {
      // Map approximate offset back to original text window
      const rawIdx = page.text.toLowerCase().search(
        needle.slice(0, Math.min(18, needle.length)).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
      );
      const at = rawIdx >= 0 ? rawIdx : Math.max(0, Math.floor(page.text.length * (idx / Math.max(compactPage.length, 1))));
      start = at;
      end = Math.min(page.text.length, at + Math.min(needle.length, 120));
      excerpt = page.text.slice(Math.max(0, at - 20), Math.min(page.text.length, end + 40))
        .replace(/\s+/g, " ")
        .trim();
      score = 0.85 + (hintPage === page.page ? 0.1 : 0);
    } else if (hintPage === page.page) {
      excerpt = page.text.slice(0, 160).replace(/\s+/g, " ").trim();
      score = 0.45;
    }

    if (excerpt) {
      scored.push({ page: page.page, excerpt, start, end, score });
    }
  }

  scored.sort((a, b) => b.score - a.score || a.page - b.page);
  return scored.slice(0, maxSpans).map(({ page, excerpt, start, end }) => ({
    page,
    excerpt,
    start,
    end,
  }));
}

/**
 * Deterministic confidence in [0,1]:
 * evidence match + pageRef + text length heuristics.
 */
export function scoreRequirementConfidence(input: {
  text: string;
  pageRef?: string;
  evidence?: RequirementEvidenceSpan[];
}): number {
  const text = input.text.trim();
  if (!text) return 0;

  let score = 0.2;
  const evidence = input.evidence ?? [];
  if (evidence.length > 0) {
    score += 0.35;
    const best = evidence[0]!;
    const compactExcerpt = normalizeForMatch(best.excerpt);
    const compactText = normalizeForMatch(text);
    if (
      compactExcerpt.includes(compactText.slice(0, Math.min(16, compactText.length))) ||
      compactText.includes(compactExcerpt.slice(0, Math.min(16, compactExcerpt.length)))
    ) {
      score += 0.3;
    } else {
      score += 0.1;
    }
  }

  if (input.pageRef) score += 0.1;
  if (text.length >= 12 && text.length <= 200) score += 0.05;
  if (text.length < 6) score -= 0.15;
  if (/待定|暂无|未知|TBD|N\/A/i.test(text)) score -= 0.25;

  return Math.max(0, Math.min(1, Math.round(score * 100) / 100));
}

export function itemNeedsEvidenceConfirmation(item: RequirementItem): boolean {
  if (!item.text.trim()) return false;
  if (item.reviewStatus === "rejected") return false;
  if (item.reviewStatus === "confirmed") return false;

  const evidence = item.evidence ?? [];
  const missingEvidence = evidence.length === 0 && !item.pageRef;
  const band =
    item.confidenceBand ??
    confidenceBandFromScore(item.confidence ?? scoreRequirementConfidence(item));
  const low = band === "low" || (item.confidence ?? 1) < CONFIDENCE_LOW_THRESHOLD;

  return missingEvidence || low;
}

export function enrichRequirementItemEvidence(
  item: Omit<RequirementItem, "evidence" | "confidence" | "confidenceBand"> &
    Partial<Pick<RequirementItem, "evidence" | "confidence" | "confidenceBand" | "pageRef">>,
  pages: TenderParseResult["pages"],
): RequirementItem {
  const evidence =
    item.evidence && item.evidence.length > 0
      ? item.evidence
      : findEvidenceSpans(item.text, pages, item.pageRef);

  const pageRef =
    item.pageRef ??
    (evidence[0] ? `p.${evidence[0].page}` : undefined);

  const confidence =
    item.confidence ??
    scoreRequirementConfidence({ text: item.text, pageRef, evidence });

  return {
    ...item,
    pageRef,
    evidence,
    confidence,
    confidenceBand: item.confidenceBand ?? confidenceBandFromScore(confidence),
  };
}

export function enrichRequirementsEvidence(
  req: TenderRequirements,
  pages: TenderParseResult["pages"],
): TenderRequirements {
  const map = (items: RequirementItem[]) =>
    items.map((item) => enrichRequirementItemEvidence(item, pages));

  return {
    ...req,
    functionalRequirements: map(req.functionalRequirements),
    technicalRequirements: map(req.technicalRequirements),
    equipment: map(req.equipment),
    space: map(req.space),
    quantity: map(req.quantity),
    constraints: map(req.constraints),
    compliance: map(req.compliance),
    standards: map(req.standards),
    evaluation: map(req.evaluation),
    optionalItems: map(req.optionalItems),
  };
}

export function listEvidenceGateIssues(
  requirements: TenderRequirements,
): Array<{ path: string; message: string; itemId: string }> {
  const lists: Array<{ key: string; items: RequirementItem[] }> = [
    { key: "functionalRequirements", items: requirements.functionalRequirements },
    { key: "technicalRequirements", items: requirements.technicalRequirements },
    { key: "equipment", items: requirements.equipment },
    { key: "space", items: requirements.space },
    { key: "quantity", items: requirements.quantity },
    { key: "constraints", items: requirements.constraints },
    { key: "compliance", items: requirements.compliance },
    { key: "standards", items: requirements.standards },
    { key: "evaluation", items: requirements.evaluation },
    { key: "optionalItems", items: requirements.optionalItems },
  ];

  const issues: Array<{ path: string; message: string; itemId: string }> = [];
  for (const list of lists) {
    list.items.forEach((item, index) => {
      if (!itemNeedsEvidenceConfirmation(item)) return;
      if (item.reviewStatus === "confirmed") return;
      const missing = (item.evidence?.length ?? 0) === 0 && !item.pageRef;
      issues.push({
        path: `${list.key}.${index}`,
        itemId: item.id,
        message: missing
          ? `缺少来源证据，需确认或驳回：${item.text.slice(0, 40)}`
          : `低置信度抽取（${item.confidenceBand ?? "low"}），需确认或驳回：${item.text.slice(0, 40)}`,
      });
    });
  }
  return issues;
}
