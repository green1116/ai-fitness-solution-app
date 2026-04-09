import { renderTenderTablePdf } from "@/lib/pdf/tender/renderTenderTablePdf";
import {
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
};

export type RenderScoreMappingPdfResult = {
  bytes: Uint8Array;
  pageCount: number;
};

const TABLE_COLS = [
  { key: "scoreItem", title: "评分项", width: 105 },
  { key: "responseSection", title: "对应响应章节", width: 105 },
  { key: "evidence", title: "建议证明材料", width: 115 },
  { key: "risk", title: "风险提示", width: 105, cellKind: "risk-muted" as const },
] as const;

export async function renderScoreMappingPdf(
  input: RenderScoreMappingPdfInput
): Promise<RenderScoreMappingPdfResult> {
  const rows: ScoreV2Row[] = (input.rows || []).map((r) => ({
    scoreItem: r.scoreItem,
    responseSection: r.responseSection,
    evidence: r.evidence,
    risk: r.risk,
  }));

  return renderTenderTablePdf<ScoreV2Row>({
    title: input.title || "评分项对照页",
    subtitle: input.subtitle ?? SCORE_MAPPING_PAGE_SUBTITLE,
    continuationTitle: `${input.title || "评分项对照页"}（续）`,
    rows,
    columns: [...TABLE_COLS],
    footnote: input.footnote ?? SCORE_MAPPING_PAGE_FOOTNOTE,
  });
}
