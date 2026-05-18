import type { TenderSectionPageRefs } from "@/lib/pdf/tender/refs/pageRefs";
import type { TenderScoreMappingRow } from "@/lib/pdf/tender/scoreMapping";

export type TenderRefKind = "business" | "technical" | "score" | "attachment";

export type TenderRefToken = {
  raw: string;
  norm: string;
  kind: TenderRefKind;
};

export function normalizeTenderRef(v: string) {
  return String(v || "")
    .trim()
    .toUpperCase()
    .replace(/[\u3000\s]+/g, "")
    .replace(/－/g, "-");
}

export function parseTenderRefToken(v: string): TenderRefToken | null {
  const norm = normalizeTenderRef(v);
  if (!norm) return null;

  if (/^B-\d{2,3}$/.test(norm)) {
    return { raw: v, norm, kind: "business" };
  }
  if (/^T-\d{2,3}$/.test(norm)) {
    return { raw: v, norm, kind: "technical" };
  }
  if (/^S-\d{2,3}$/.test(norm)) {
    return { raw: v, norm, kind: "score" };
  }
  if (/^A-\d{2,3}$/.test(norm)) {
    return { raw: v, norm, kind: "attachment" };
  }

  return null;
}

export function uniqStrings(arr: Array<string | undefined | null>) {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const s of arr) {
    const v = String(s || "").trim();
    if (!v) continue;
    if (seen.has(v)) continue;
    seen.add(v);
    out.push(v);
  }
  return out;
}

function pickPrimarySectionLabelFromRefs(
  refs: string[],
  preciseRefPageMap: Record<string, number>,
  sectionPages: Partial<TenderSectionPageRefs>
): { label: string; page?: number } | null {
  const parsed = refs
    .map(parseTenderRefToken)
    .filter(Boolean) as TenderRefToken[];

  if (!parsed.length) return null;

  const hasT = parsed.some((x) => x.kind === "technical");
  const hasB = parsed.some((x) => x.kind === "business");
  const hasA = parsed.some((x) => x.kind === "attachment");
  const hasS = parsed.some((x) => x.kind === "score");

  if (hasT) {
    return {
      label: "技术响应表",
      page:
        parsed
          .filter((x) => x.kind === "technical")
          .map((x) => preciseRefPageMap[x.norm])
          .find((p) => typeof p === "number" && p > 0) ??
        sectionPages.technicalResponse,
    };
  }

  if (hasB) {
    return {
      label: "商务条款响应表",
      page:
        parsed
          .filter((x) => x.kind === "business")
          .map((x) => preciseRefPageMap[x.norm])
          .find((p) => typeof p === "number" && p > 0) ??
        sectionPages.businessResponse,
    };
  }

  if (hasA) {
    return {
      label: "附件索引",
      page:
        parsed
          .filter((x) => x.kind === "attachment")
          .map((x) => preciseRefPageMap[x.norm])
          .find((p) => typeof p === "number" && p > 0) ??
        sectionPages.attachmentIndex,
    };
  }

  if (hasS) {
    return {
      label: "评分项对照页",
      page:
        parsed
          .filter((x) => x.kind === "score")
          .map((x) => preciseRefPageMap[x.norm])
          .find((p) => typeof p === "number" && p > 0) ?? sectionPages.score,
    };
  }

  return null;
}

function formatPageLabel(page?: number) {
  return typeof page === "number" && page > 0 ? `第 ${page} 页` : "";
}

function formatSectionWithPageFallback(
  row: TenderScoreMappingRow,
  refs?: TenderSectionPageRefs
) {
  const base = String(row.responseSection || "").trim() || "-";
  const key = row.responseSectionKey;
  if (!key || !refs) return base;
  const pageNo = refs[key];
  if (!pageNo || !Number.isFinite(pageNo)) return base;
  return `${base}（第 ${pageNo} 页）`;
}

/**
 * 评分页「对应响应章节」列：主章节 + 包内页码 + 编号列表（供后续逐 token 链接）。
 */
export function formatScoreMappingResponseCell(
  row: TenderScoreMappingRow,
  sectionPageRefs?: TenderSectionPageRefs,
  preciseRefPageMap?: Record<string, number>
): string {
  const precise = preciseRefPageMap || {};
  const sections = sectionPageRefs || {};

  const cleanRefs = uniqStrings((row.responseRefIds || []).map(normalizeTenderRef)).slice(
    0,
    3
  );

  if (row.responseSectionKey === "budget" && cleanRefs.length) {
    const pageNo = sections.budget;
    const refText = cleanRefs.join("、");
    const label = "预算与报价";
    const pageText = formatPageLabel(
      typeof pageNo === "number" && pageNo > 0 ? pageNo : undefined
    );
    if (pageText && refText) return `${label}（${pageText}） / ${refText}`;
    if (pageText) return `${label}（${pageText}）`;
    return `${label} / ${refText}`;
  }

  if (!cleanRefs.length) {
    return formatSectionWithPageFallback(row, sectionPageRefs);
  }

  const primary = pickPrimarySectionLabelFromRefs(cleanRefs, precise, sections);
  if (!primary) {
    return cleanRefs.join("、");
  }

  const pageText = formatPageLabel(primary.page);
  const refText = cleanRefs.join("、");

  if (pageText && refText) {
    return `${primary.label}（${pageText}） / ${refText}`;
  }
  if (pageText) {
    return `${primary.label}（${pageText}）`;
  }
  return `${primary.label}${refText ? ` / ${refText}` : ""}`;
}

/** 从已渲染单元格文案中提取可链接编号（与 draw 内容一致） */
export function extractClickableRefTokens(text: string) {
  const matches = String(text || "").match(/[BTSA]-\d{2,3}/gi) || [];
  return uniqStrings(matches.map(normalizeTenderRef));
}
