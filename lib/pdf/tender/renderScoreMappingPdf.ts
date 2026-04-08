import { renderTenderTablePdf } from "@/lib/pdf/tender/renderTenderTablePdf";

type ScoreRow = {
  scoreItem: string;
  criteria: string;
  proof: string;
  responseSummary: string;
};

export type RenderScoreMappingPdfInput = {
  title?: string;
  rows: ScoreRow[];
};

export type RenderScoreMappingPdfResult = {
  bytes: Uint8Array;
  pageCount: number;
};

const TABLE_COLS = [
  { key: "scoreItem", title: "评分项", width: 92 },
  { key: "criteria", title: "评分标准", width: 156 },
  { key: "proof", title: "本方案对应位置", width: 132 },
  { key: "responseSummary", title: "响应说明", width: 132 },
] as const;

export async function renderScoreMappingPdf(
  input: RenderScoreMappingPdfInput
): Promise<RenderScoreMappingPdfResult> {
  return renderTenderTablePdf<ScoreRow>({
    title: input.title || "评分对照页",
    rows: input.rows || [],
    columns: [...TABLE_COLS],
  });
}

