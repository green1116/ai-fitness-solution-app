import {
  SCORE_EVIDENCE_HINTS,
  resolveScoreEvidenceBucket,
  type ScoreEvidenceBucket,
} from "@/lib/tender/score/scoreEvidenceHints";
import {
  extractClickableRefTokens,
  normalizeTenderRef,
} from "@/lib/pdf/tender/scoreSectionFormat";

export interface EvidenceRow {
  id?: string;
  ref?: string;
  label?: string;
  section?: string;
  content?: string;
}

export interface AttachmentRow {
  id?: string;
  ref?: string;
  name?: string;
  title?: string;
  content?: string;
}

export interface RiskRow {
  title?: string;
  ref?: string;
  refs?: string[];
  evidence?: string[];
}

export interface ScoreEvidenceContext {
  note?: string;
  topRisks?: Array<string | RiskRow>;
  responseRows?: EvidenceRow[];
  attachmentIndex?: AttachmentRow[];
}

export interface DetailedScoreRuleItemLite {
  id?: string;
  key?: string;
  label: string;
  keywords?: string[];
  maxScore?: number;
}

export interface TenderScoreEvidenceItem {
  ref: string;
  source?: "note" | "risk" | "response" | "attachment";
  matchedBy?: string;
}

function normalizeText(input?: string) {
  return String(input || "").trim().toLowerCase();
}

function detectRefPrefix(ref: string): "T" | "B" | "A" | "UNKNOWN" {
  const v = normalizeText(ref).toUpperCase();
  if (v.startsWith("T-")) return "T";
  if (v.startsWith("B-")) return "B";
  if (v.startsWith("A-")) return "A";
  return "UNKNOWN";
}

function scorePrefixBoost(
  ref: string,
  preferPrefixes: Array<"T" | "B" | "A"> | undefined
) {
  if (!preferPrefixes?.length) return 0;
  const prefix = detectRefPrefix(ref);
  const idx = preferPrefixes.indexOf(prefix as "T" | "B" | "A");
  return idx === -1 ? 0 : preferPrefixes.length - idx;
}

function dedupeEvidence(items: TenderScoreEvidenceItem[]) {
  const seen = new Set<string>();
  const out: TenderScoreEvidenceItem[] = [];
  for (const item of items) {
    if (!item.ref) continue;
    if (seen.has(item.ref)) continue;
    seen.add(item.ref);
    out.push(item);
  }
  return out;
}

function refsFromText(
  text: string | undefined,
  source: TenderScoreEvidenceItem["source"]
): TenderScoreEvidenceItem[] {
  if (!text) return [];
  const tokens = extractClickableRefTokens(text);
  const out: TenderScoreEvidenceItem[] = [];
  for (const token of tokens) {
    const ref = normalizeTenderRef(token);
    if (ref) out.push({ ref, source });
  }
  return out;
}

function computeKeywordHitScore(text: string, keywords: string[]) {
  if (!text || !keywords.length) return 0;
  let score = 0;
  for (const kw of keywords) {
    if (text.includes(kw.toLowerCase())) score += 1;
  }
  return score;
}

export function collectEvidenceRefs(
  item: DetailedScoreRuleItemLite,
  ctx: ScoreEvidenceContext
): TenderScoreEvidenceItem[] {
  const bucket: ScoreEvidenceBucket = resolveScoreEvidenceBucket({
    key: item.key || item.id,
    label: item.label,
    keywords: item.keywords,
  });

  const hint = SCORE_EVIDENCE_HINTS[bucket];
  const keywords = Array.from(
    new Set(
      [...(hint.keywords || []), ...(item.keywords || [])]
        .map((s) => normalizeText(s))
        .filter(Boolean)
    )
  );

  const collected: TenderScoreEvidenceItem[] = [];

  // 1) note 里直接已有 refs，优先
  collected.push(...refsFromText(ctx.note, "note"));

  // 2) 风险对象里的 refs
  for (const risk of ctx.topRisks || []) {
    if (typeof risk === "string") {
      collected.push(...refsFromText(risk, "risk"));
      continue;
    }

    if (risk.ref) {
      const ref = normalizeTenderRef(risk.ref);
      if (ref) collected.push({ ref, source: "risk" });
    }

    for (const r of risk.refs || []) {
      const ref = normalizeTenderRef(r);
      if (ref) collected.push({ ref, source: "risk" });
    }

    for (const r of risk.evidence || []) {
      const ref = normalizeTenderRef(r);
      if (ref) collected.push({ ref, source: "risk" });
    }

    collected.push(...refsFromText(risk.title, "risk"));
  }

  // 3) 响应表命中
  const responseCandidates = (ctx.responseRows || [])
    .map((row) => {
      const ref = normalizeTenderRef(row.ref || row.id || "");
      if (!ref) return null;

      const text = normalizeText(
        [row.label, row.section, row.content].filter(Boolean).join(" ")
      );
      const hitScore = computeKeywordHitScore(text, keywords);
      const prefixBoost = scorePrefixBoost(ref, hint.preferPrefixes);

      return {
        ref,
        source: "response" as const,
        matchedBy: keywords.find((kw) => text.includes(kw)),
        score: hitScore * 10 + prefixBoost,
      };
    })
    .filter((x): x is NonNullable<typeof x> => !!x)
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((x) => ({
      ref: x.ref,
      source: x.source,
      matchedBy: x.matchedBy,
    }));

  collected.push(...responseCandidates);

  // 4) 附件命中
  const attachmentCandidates = (ctx.attachmentIndex || [])
    .map((row) => {
      const ref = normalizeTenderRef(row.ref || row.id || "");
      if (!ref) return null;

      const text = normalizeText(
        [row.name, row.title, row.content].filter(Boolean).join(" ")
      );
      const hitScore = computeKeywordHitScore(text, keywords);
      const prefixBoost = scorePrefixBoost(ref, hint.preferPrefixes);

      return {
        ref,
        source: "attachment" as const,
        matchedBy: keywords.find((kw) => text.includes(kw)),
        score: hitScore * 10 + prefixBoost,
      };
    })
    .filter((x): x is NonNullable<typeof x> => !!x)
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map((x) => ({
      ref: x.ref,
      source: x.source,
      matchedBy: x.matchedBy,
    }));

  collected.push(...attachmentCandidates);

  // 5) 去重并按来源/前缀偏好排序
  const deduped = dedupeEvidence(collected);

  const sourceWeight: Record<string, number> = {
    note: 40,
    risk: 30,
    response: 20,
    attachment: 10,
  };

  const ranked = deduped
    .map((x) => ({
      ...x,
      rank:
        (sourceWeight[x.source || ""] || 0) +
        scorePrefixBoost(x.ref, hint.preferPrefixes),
    }))
    .sort((a, b) => b.rank - a.rank)
    .slice(0, hint.maxItems || 3)
    .map(({ rank: _rank, ...rest }) => rest);

  return ranked;
}
