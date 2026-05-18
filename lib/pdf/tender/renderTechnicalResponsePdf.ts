import { renderTenderTablePdf } from "@/lib/pdf/tender/renderTenderTablePdf";
import type { TenderAttachmentRefMap } from "@/lib/pdf/tender/attachmentIndex";
import { buildTenderRemarkAdvice } from "@/lib/pdf/tender/remarkAdvisor";
import {
  TECHNICAL_RESPONSE_TABLE_COLS,
  type TechnicalResponseTableRow,
} from "@/lib/pdf/tender/technicalResponse";

export type { TechnicalResponseTableRow };

export type RenderTechnicalResponsePdfInput = {
  rows: TechnicalResponseTableRow[];
  title?: string;
  footnote?: string;
  attachmentRefs?: TenderAttachmentRefMap;
};

export type RenderTechnicalResponsePdfResult = {
  bytes: Uint8Array;
  pageCount: number;
  refPageMap: Record<string, number>;
};

export async function renderTechnicalResponsePdf(
  input: RenderTechnicalResponsePdfInput
): Promise<RenderTechnicalResponsePdfResult> {
  const rows = (input.rows || []).map((row) => ({
    ...row,
    note:
      String(row.note || "").trim() ||
      buildTenderRemarkAdvice(
        {
          status: row.status,
          scene: "technical_response",
          currentRemark: row.note,
        },
        input.attachmentRefs
      ),
  }));

  const rendered = await renderTenderTablePdf<TechnicalResponseTableRow>({
    title: input.title || "技术响应表",
    rows,
    columns: [...TECHNICAL_RESPONSE_TABLE_COLS],
    footnote: input.footnote,
    getRefKey: (row) => {
      const v = String(row.requirement || "");
      const m = v.match(/\b(T-\d{2,3})\b/i);
      return m?.[1] ? m[1].toUpperCase() : undefined;
    },
  });
  return {
    bytes: rendered.bytes,
    pageCount: rendered.pageCount,
    refPageMap: rendered.refPageMap,
  };
}
