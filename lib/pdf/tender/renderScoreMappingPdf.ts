import type { TenderAttachmentRefMap } from "@/lib/pdf/tender/attachmentRefs";
import type { TenderSectionPageRefs } from "@/lib/pdf/tender/pageRefs";
import { renderTenderTablePdf } from "@/lib/pdf/tender/renderTenderTablePdf";
import {
  formatEvidenceWithAttachments,
  formatSectionWithPage,
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
};

export type RenderScoreMappingPdfResult = {
  bytes: Uint8Array;
  pageCount: number;
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

  const rows: ScoreV2Row[] = (input.rows || []).map((r) => ({
    scoreItem: r.scoreItem,
    responseSection: formatSectionWithPage(r, pageRefs),
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
  });
}
