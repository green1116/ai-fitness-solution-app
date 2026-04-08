import { renderTenderTablePdf } from "@/lib/pdf/tender/renderTenderTablePdf";

type TechnicalTableRow = {
  no: string;
  requirement: string;
  status: string;
  response: string;
  note: string;
};

export type RenderTechnicalResponsePdfInput = {
  rows: TechnicalTableRow[];
  title?: string;
  footnote?: string;
};

export type RenderTechnicalResponsePdfResult = {
  bytes: Uint8Array;
  pageCount: number;
};

const TABLE_COLS = [
  { key: "no", title: "序号", width: 34 },
  { key: "requirement", title: "招标要求", width: 150 },
  { key: "status", title: "响应情况", width: 54 },
  { key: "response", title: "投标响应", width: 190 },
  { key: "note", title: "备注", width: 64 },
] as const;

export async function renderTechnicalResponsePdf(
  input: RenderTechnicalResponsePdfInput
): Promise<RenderTechnicalResponsePdfResult> {
  return renderTenderTablePdf<TechnicalTableRow>({
    title: input.title || "技术响应表",
    rows: input.rows || [],
    columns: [...TABLE_COLS],
    footnote: input.footnote,
  });
}

