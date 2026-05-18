import { renderTenderTablePdf } from "@/lib/pdf/tender/renderTenderTablePdf";
import type { TenderAttachmentRefMap } from "@/lib/pdf/tender/attachmentIndex";
import { buildTenderRemarkAdvice } from "@/lib/pdf/tender/remarkAdvisor";
import {
  BUSINESS_RESPONSE_TABLE_COLS,
  type BusinessResponseTableRow,
} from "@/lib/pdf/tender/businessResponse";

export type { BusinessResponseTableRow };

export type RenderBusinessResponsePdfInput = {
  rows: BusinessResponseTableRow[];
  title?: string;
  footnote?: string;
  attachmentRefs?: TenderAttachmentRefMap;
};

export type RenderBusinessResponsePdfResult = {
  bytes: Uint8Array;
  pageCount: number;
  refPageMap: Record<string, number>;
};

export async function renderBusinessResponsePdf(
  input: RenderBusinessResponsePdfInput
): Promise<RenderBusinessResponsePdfResult> {
  const rows = (input.rows || []).map((row) => ({
    ...row,
    note:
      String(row.note || "").trim() ||
      buildTenderRemarkAdvice(
        {
          status: row.status,
          scene: "business_response",
          currentRemark: row.note,
        },
        input.attachmentRefs
      ),
  }));

  const rendered = await renderTenderTablePdf<BusinessResponseTableRow>({
    title: input.title || "商务响应表",
    rows,
    columns: [...BUSINESS_RESPONSE_TABLE_COLS],
    footnote: input.footnote,
    getRefKey: (row) => {
      const v = String(row.requirement || "");
      const m = v.match(/\b(B-\d{2,3})\b/i);
      return m?.[1] ? m[1].toUpperCase() : undefined;
    },
  });
  return {
    bytes: rendered.bytes,
    pageCount: rendered.pageCount,
    refPageMap: rendered.refPageMap,
  };
}
