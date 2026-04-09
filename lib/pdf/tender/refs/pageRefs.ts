/**
 * 投标包内主要章节的起始页（与合并顺序、目录一致），供评分对照、附件索引等复用。
 */
export type TenderSectionPageRefs = Partial<{
  declaration: number;
  score: number;
  technicalResponse: number;
  businessResponse: number;
  technicalDeviation: number;
  businessDeviation: number;
  attachmentIndex: number;
  plan: number;
  budget: number;
  conclusion: number;
}>;

/** 目录/合并片段 id → `TenderSectionPageRefs` 的键 */
const TOC_ID_TO_REF_KEY: Record<string, keyof TenderSectionPageRefs> = {
  "bid-letter": "declaration",
  "business-terms-response": "businessResponse",
  "technical-response": "technicalResponse",
  "business-deviation": "businessDeviation",
  "technical-deviation": "technicalDeviation",
  score: "score",
  "attachment-index": "attachmentIndex",
  plan: "plan",
  budget: "budget",
};

/**
 * 从已算好起始页的目录项生成章节页码映射（如政府包 `GovTocEntry[]`）。
 */
export function buildTenderSectionPageRefs(
  entries: ReadonlyArray<{ id: string; startPage: number }>
): TenderSectionPageRefs {
  const refs: TenderSectionPageRefs = {};
  for (const entry of entries) {
    const p = Number(entry?.startPage || 0);
    if (!p || !Number.isFinite(p)) continue;
    const key = TOC_ID_TO_REF_KEY[entry.id];
    if (key) refs[key] = p;
  }
  return refs;
}

export type TenderPackSegmentPageCounts = {
  coverPages: number;
  govTocPages: number;
  bidLetterPages: number;
  businessTermsResponsePages: number;
  technicalResponsePages: number;
  businessDeviationPages: number;
  technicalDeviationPages: number;
  /** 评分项对照页页数（用于其后章节的起始页计算） */
  scorePages: number;
  attachmentIndexPages: number;
  planPages: number;
  budgetPages: number;
};

/**
 * 按 `tender-pack` 政府包合并顺序累加起始页，与 `route.ts` 中目录推算保持一致。
 */
export function buildTenderSectionPageRefsFromPackLayout(
  c: TenderPackSegmentPageCounts
): TenderSectionPageRefs {
  const base = c.coverPages + c.govTocPages + 1;
  let p = base;
  const r: TenderSectionPageRefs = {};

  r.declaration = p;
  p += c.bidLetterPages > 0 ? c.bidLetterPages : 1;

  r.businessResponse = p;
  p += c.businessTermsResponsePages > 0 ? c.businessTermsResponsePages : 1;

  r.technicalResponse = p;
  p += c.technicalResponsePages > 0 ? c.technicalResponsePages : 1;

  r.businessDeviation = p;
  p += c.businessDeviationPages > 0 ? c.businessDeviationPages : 1;

  r.technicalDeviation = p;
  p += c.technicalDeviationPages > 0 ? c.technicalDeviationPages : 1;

  r.score = p;
  p += c.scorePages > 0 ? c.scorePages : 1;

  r.attachmentIndex = p;
  p += c.attachmentIndexPages > 0 ? c.attachmentIndexPages : 1;

  r.plan = p;
  p += c.planPages;

  r.budget = p;

  return r;
}
