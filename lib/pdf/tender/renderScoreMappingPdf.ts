import type { TenderNavRect } from "@/lib/pdf/tender/nav/pdfNavTypes";
import type { TenderAttachmentRefMap } from "@/lib/pdf/tender/refs/attachmentRefs";
import type { TenderSectionPageRefs } from "@/lib/pdf/tender/refs/pageRefs";
import { renderTenderTablePdf } from "@/lib/pdf/tender/renderTenderTablePdf";
import { extractClickableRefTokens } from "@/lib/pdf/tender/scoreSectionFormat";
import {
  formatEvidenceWithAttachments,
  formatSectionWithPageAndRefs,
  SCORE_MAPPING_PAGE_FOOTNOTE,
  SCORE_MAPPING_PAGE_SUBTITLE,
  type TenderScoreMappingRow,
} from "@/lib/pdf/tender/scoreMapping";

export type { TenderScoreMappingRow };

type ScoreV2Row = {
  scoreItem: string;
  responseSection: string;
  evidence: string;
  risk: string;
};

export type RenderScoreMappingPdfInput = {
  title?: string;
  subtitle?: string;
  footnote?: string;
  rows: TenderScoreMappingRow[];
  pageRefs?: TenderSectionPageRefs;
  attachmentRefs?: TenderAttachmentRefMap;
  /** 包内合并页码上的 B-xx/T-xx 等，用于「主章节+真实页码」与逐条链接 */
  preciseRefPageMap?: Record<string, number>;
};

export type RenderScoreMappingPdfResult = {
  bytes: Uint8Array;
  pageCount: number;
  refPageMap: Record<string, number>;
  navLinkRects: TenderNavRect[];
};

const TABLE_COLS_BASE = [
  { key: "scoreItem", title: "评分项", width: 105 },
  { key: "responseSection", title: "对应响应章节", width: 105 },
  { key: "evidence", title: "建议证明材料", width: 115 },
  { key: "risk", title: "风险提示", width: 105, cellKind: "risk-muted" as const },
] as const;

function hasAnyPageRef(refs?: TenderSectionPageRefs) {
  if (!refs) return false;
  return Object.values(refs).some(
    (v) => typeof v === "number" && Number.isFinite(v) && v > 0
  );
}

function hasAnyAttachmentRef(refs?: TenderAttachmentRefMap) {
  if (!refs) return false;
  return Object.values(refs).some((v) => !!v?.code && !!v?.name);
}

export async function renderScoreMappingPdf(
  input: RenderScoreMappingPdfInput
): Promise<RenderScoreMappingPdfResult> {
  const pageRefs = input.pageRefs;
  const attachmentRefs = input.attachmentRefs;
  const sectionTitle = hasAnyPageRef(pageRefs)
    ? "对应响应章节（含页码）"
    : "对应响应章节";
  const evidenceTitle = hasAnyAttachmentRef(attachmentRefs)
    ? "建议证明材料（含附件编号）"
    : "建议证明材料";

  const columns = TABLE_COLS_BASE.map((c) =>
    c.key === "responseSection"
      ? { ...c, title: sectionTitle }
      : c.key === "evidence"
        ? { ...c, title: evidenceTitle }
        : c
  );

  const precise = input.preciseRefPageMap;
  const rows: ScoreV2Row[] = (input.rows || []).map((r) => ({
    scoreItem: r.scoreId ? `${r.scoreId}  ${r.scoreItem}` : r.scoreItem,
    responseSection: formatSectionWithPageAndRefs(r, pageRefs, precise),
    evidence: formatEvidenceWithAttachments(r, attachmentRefs),
    risk: r.risk,
  }));

  return renderTenderTablePdf<ScoreV2Row>({
    title: input.title || "评分项对照页",
    subtitle: input.subtitle ?? SCORE_MAPPING_PAGE_SUBTITLE,
    continuationTitle: `${input.title || "评分项对照页"}（续）`,
    rows,
    columns: [...columns],
    footnote: input.footnote ?? SCORE_MAPPING_PAGE_FOOTNOTE,
    getRefKey: (row) => {
      const m = String(row.scoreItem || "").match(/\b(S-\d{2,3})\b/i);
      return m?.[1] ? m[1].toUpperCase() : undefined;
    },
    inlineRefNavLinks: {
      columnKey: "responseSection",
      tokensForRow: (row) => extractClickableRefTokens(row.responseSection),
    },
    wholeCellLink: {
      columnKey: "responseSection",
      targetKeyForRow: (row) => extractClickableRefTokens(row.responseSection)[0],
    },
  });
}
