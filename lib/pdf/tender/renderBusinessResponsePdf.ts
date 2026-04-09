import { renderTenderTablePdf } from "@/lib/pdf/tender/renderTenderTablePdf";
import {
  BUSINESS_RESPONSE_TABLE_COLS,
  type BusinessResponseTableRow,
} from "@/lib/pdf/tender/businessResponse";

export type { BusinessResponseTableRow };

export type RenderBusinessResponsePdfInput = {
  rows: BusinessResponseTableRow[];
  title?: string;
  footnote?: string;
};

export type RenderBusinessResponsePdfResult = {
  bytes: Uint8Array;
  pageCount: number;
};

export async function renderBusinessResponsePdf(
  input: RenderBusinessResponsePdfInput
): Promise<RenderBusinessResponsePdfResult> {
  return renderTenderTablePdf<BusinessResponseTableRow>({
    title: input.title || "商务响应表",
    rows: input.rows || [],
    columns: [...BUSINESS_RESPONSE_TABLE_COLS],
    footnote: input.footnote,
  });
}
