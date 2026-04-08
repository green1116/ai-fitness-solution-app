import type {
  BusinessRequirement,
  BusinessResponseRow,
  TechnicalEvidenceBlock,
} from "@/lib/pdf/tender/types";

function norm(s: string): string {
  return String(s || "").trim().toLowerCase();
}

function includesText(haystack: string, needle: string): boolean {
  if (!haystack || !needle) return false;
  return norm(haystack).includes(norm(needle));
}

function scoreBusinessMatch(req: BusinessRequirement, ev: TechnicalEvidenceBlock): number {
  let score = 0;

  const text = req.text || "";
  const title = ev.title || "";
  const evText = ev.text || "";
  const tags = ev.tags || [];

  if (req.requirementType === "pricing") {
    if (ev.sectionId === "pricing_terms" || ev.sectionId === "table") score += 0.4;
  }
  if (req.requirementType === "payment") {
    if (ev.sectionId === "payment_terms") score += 0.4;
  }
  if (req.requirementType === "delivery") {
    if (ev.sectionId === "delivery_terms") score += 0.4;
  }
  if (req.requirementType === "service") {
    if (ev.sectionId === "after_sales") score += 0.4;
  }

  for (const kw of req.keywords || []) {
    const tagHit = tags.some((tag) => includesText(tag, kw));
    if (includesText(evText, kw) || includesText(title, kw) || tagHit) score += 0.12;
  }

  if (includesText(text, title)) score += 0.2;

  return Math.min(Number(score.toFixed(4)), 1);
}

function composeBusinessResponse(req: BusinessRequirement, matchedTitles: string[]): string {
  const core = req.text.length > 24 ? `${req.text.slice(0, 24)}...` : req.text;
  const suffix = matchedTitles.length
    ? `相关内容已在${matchedTitles.join("、")}中体现。`
    : "相关内容已在商务条款及预算内容中体现。";

  switch (req.requirementType) {
    case "pricing":
      return `本方案已对“${core}”作出响应，相关报价说明及配置依据已在预算及报价说明中体现，${suffix}`;
    case "payment":
      return `本方案已对“${core}”作出响应，相关付款及结算安排可按照项目要求执行，${suffix}`;
    case "delivery":
      return `本方案已对“${core}”作出响应，相关交付安排及实施周期已在方案中说明，${suffix}`;
    case "service":
      return `本方案已对“${core}”作出响应，相关售后服务及保障措施已在商务与服务内容中体现，${suffix}`;
    default:
      return `本方案已对“${core}”作出整体响应，商务条款可按招标要求执行，${suffix}`;
  }
}

export function buildBusinessResponseRows(input: {
  requirements: BusinessRequirement[];
  evidenceBlocks: TechnicalEvidenceBlock[];
}): BusinessResponseRow[] {
  const { requirements, evidenceBlocks } = input;

  return requirements.map((req, idx) => {
    const ranked = evidenceBlocks
      .map((ev) => ({ ev, score: scoreBusinessMatch(req, ev) }))
      .sort((a, b) => b.score - a.score);

    const matched = ranked
      .filter((x) => x.score >= 0.5)
      .slice(0, 3)
      .map((x) => x.ev);
    const fallback = ranked
      .slice(0, 2)
      .map((x) => x.ev)
      .filter(Boolean);
    const finalMatched = matched.length ? matched : fallback;
    const bestScore = ranked[0]?.score || 0;
    const matchedTitles = finalMatched.map((x) => x.title).filter(Boolean);

    return {
      id: req.id || `BR-${String(idx + 1).padStart(3, "0")}`,
      clause: req.text,
      response: composeBusinessResponse(req, matchedTitles),
      status: "满足",
      matchedEvidenceKeys: finalMatched.map((x) => x.key),
      confidence: bestScore,
      note: bestScore < 0.35 ? "low-confidence" : undefined,
    };
  });
}

