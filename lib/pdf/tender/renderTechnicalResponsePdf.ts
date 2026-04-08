import { renderTenderTablePdf } from "@/lib/pdf/tender/renderTenderTablePdf";

type TechnicalTableRow = {
  requirement: string;
  response: string;
  proof: string;
  status: string;
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
  { key: "requirement", title: "招标技术要求", width: 135 },
  { key: "response", title: "投标响应", width: 205 },
  { key: "proof", title: "证明材料", width: 115 },
  { key: "status", title: "是否满足", width: 56 },
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

