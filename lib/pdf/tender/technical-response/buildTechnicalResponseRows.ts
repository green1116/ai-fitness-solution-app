import {
  composeTechnicalResponse,
  resolveProofRefs,
} from "@/lib/pdf/tender/technical-response/composeTechnicalResponse";
import type {
  TechnicalEvidenceBlock,
  TechnicalResponseRow,
  TenderRequirement,
} from "@/lib/pdf/tender/types";

type RankedEvidence = { ev: TechnicalEvidenceBlock; score: number };

const MATCH_OK = 0.55;
const MATCH_PARTIAL = 0.35;

function hasText(hay: string, needle: string): boolean {
  return String(hay || "").toLowerCase().includes(String(needle || "").toLowerCase());
}

function scoreRequirementMatch(req: TenderRequirement, ev: TechnicalEvidenceBlock): number {
  let score = 0;

  if (req.requirementType && req.requirementType === ev.category) score += 0.35;

  for (const kw of req.keywords || []) {
    const tagHit = (ev.tags || []).some((t) => hasText(t, kw));
    if (hasText(ev.text, kw) || hasText(ev.title, kw) || tagHit) score += 0.12;
  }

  if (hasText(req.text, "设备") && ev.category === "equipment") score += 0.15;
  if (hasText(req.text, "实施") && ev.category === "implementation") score += 0.15;
  if ((hasText(req.text, "售后") || hasText(req.text, "运维")) && ev.category === "service") score += 0.15;

  if (ev.sectionId && hasText(req.text, ev.sectionId)) score += 0.15;

  return Math.min(score, 1);
}

function rankEvidence(req: TenderRequirement, evidenceBlocks: TechnicalEvidenceBlock[]): RankedEvidence[] {
  return evidenceBlocks
    .map((ev) => ({ ev, score: scoreRequirementMatch(req, ev) }))
    .sort((a, b) => b.score - a.score);
}

export function buildTechnicalResponseRows(input: {
  requirements: TenderRequirement[];
  evidenceBlocks: TechnicalEvidenceBlock[];
}): TechnicalResponseRow[] {
  const { requirements, evidenceBlocks } = input;

  return requirements.map((req, idx) => {
    const ranked = rankEvidence(req, evidenceBlocks);
    const bestScore = ranked[0]?.score || 0;

    const strictMatched = ranked
      .filter((x) => x.score >= MATCH_OK)
      .slice(0, 3)
      .map((x) => x.ev);

    const fallbackMatched = ranked
      .slice(0, 2)
      .map((x) => x.ev)
      .filter(Boolean);

    const finalMatched = strictMatched.length ? strictMatched : fallbackMatched;

    const status: TechnicalResponseRow["status"] =
      bestScore >= MATCH_OK ? "满足" : bestScore >= MATCH_PARTIAL ? "部分满足" : "满足";

    return {
      id: req.id || `TR-${String(idx + 1).padStart(3, "0")}`,
      requirement: req.text,
      response: composeTechnicalResponse(req, finalMatched),
      proof: resolveProofRefs(finalMatched),
      status,
      matchedEvidenceKeys: finalMatched.map((x) => x.key),
      confidence: bestScore,
      sourceKeys: finalMatched.map((x) => x.key),
      pageHint: finalMatched
        .map((x) => x.pageLabel)
        .filter(Boolean)
        .join("；"),
      note: strictMatched.length ? undefined : "auto-fallback",
    };
  });
}

