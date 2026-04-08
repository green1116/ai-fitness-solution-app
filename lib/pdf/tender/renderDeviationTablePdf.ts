import { renderTenderTablePdf } from "@/lib/pdf/tender/renderTenderTablePdf";

type DeviationRow = {
  clause: string;
  responseSummary: string;
  deviationStatus: string;
  deviationType: string;
};

export type RenderDeviationTablePdfInput = {
  title: string;
  rows: DeviationRow[];
};

export type RenderDeviationTablePdfResult = {
  bytes: Uint8Array;
  pageCount: number;
};

const TABLE_COLS = [
  { key: "clause", title: "条款内容", width: 190 },
  { key: "responseSummary", title: "响应说明", width: 220 },
  { key: "deviationStatus", title: "偏离情况", width: 70 },
  { key: "deviationType", title: "偏离类型", width: 70 },
] as const;

export async function renderDeviationTablePdf(
  input: RenderDeviationTablePdfInput
): Promise<RenderDeviationTablePdfResult> {
  return renderTenderTablePdf<DeviationRow>({
    title: input.title || "偏离表",
    rows: input.rows || [],
    columns: [...TABLE_COLS],
  });
}

