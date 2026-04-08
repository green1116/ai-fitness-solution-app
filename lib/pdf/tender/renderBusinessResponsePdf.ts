import { renderTenderTablePdf } from "@/lib/pdf/tender/renderTenderTablePdf";

type BusinessTableRow = {
  clause: string;
  response: string;
  status: string;
};

export type RenderBusinessResponsePdfInput = {
  rows: BusinessTableRow[];
  title?: string;
  footnote?: string;
};

export type RenderBusinessResponsePdfResult = {
  bytes: Uint8Array;
  pageCount: number;
};

const TABLE_COLS = [
  { key: "clause", title: "招标商务条款", width: 180 },
  { key: "response", title: "投标响应", width: 285 },
  { key: "status", title: "是否满足", width: 56 },
] as const;

export async function renderBusinessResponsePdf(
  input: RenderBusinessResponsePdfInput
): Promise<RenderBusinessResponsePdfResult> {
  return renderTenderTablePdf<BusinessTableRow>({
    title: input.title || "商务响应表",
    rows: input.rows || [],
    columns: [...TABLE_COLS],
    footnote: input.footnote,
  });
}

