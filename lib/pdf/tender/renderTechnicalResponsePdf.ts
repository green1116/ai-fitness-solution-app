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

  return renderTenderTablePdf<TechnicalResponseTableRow>({
    title: input.title || "技术响应表",
    rows,
    columns: [...TECHNICAL_RESPONSE_TABLE_COLS],
    footnote: input.footnote,
  });
}
