import { renderTenderTablePdf } from "@/lib/pdf/tender/renderTenderTablePdf";
import {
  TECHNICAL_RESPONSE_TABLE_COLS,
  type TechnicalResponseTableRow,
} from "@/lib/pdf/tender/technicalResponse";

export type { TechnicalResponseTableRow };

export type RenderTechnicalResponsePdfInput = {
  rows: TechnicalResponseTableRow[];
  title?: string;
  footnote?: string;
};

export type RenderTechnicalResponsePdfResult = {
  bytes: Uint8Array;
  pageCount: number;
};

export async function renderTechnicalResponsePdf(
  input: RenderTechnicalResponsePdfInput
): Promise<RenderTechnicalResponsePdfResult> {
  return renderTenderTablePdf<TechnicalResponseTableRow>({
    title: input.title || "技术响应表",
    rows: input.rows || [],
    columns: [...TECHNICAL_RESPONSE_TABLE_COLS],
    footnote: input.footnote,
  });
}
