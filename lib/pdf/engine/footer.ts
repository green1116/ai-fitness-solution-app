// lib/pdf/engine/footer.ts
import { PDFPage, PDFFont, rgb } from "pdf-lib";
import type { PdfTheme } from "./theme";

const PAGE_W = 595.28;
const M = 48;
const FOOTER_Y = 30;

export function drawFooter(
  page: PDFPage,
  font: PDFFont,
  pageNo: number,
  totalPages: number,
  theme: PdfTheme
) {
  page.drawLine({
    start: { x: M, y: FOOTER_Y + 12 },
    end: { x: PAGE_W - M, y: FOOTER_Y + 12 },
    thickness: 1,
    color: rgb(0.9, 0.9, 0.9),
  });

  page.drawText(`第 ${pageNo} 页 / ${totalPages} 页`, {
    x: PAGE_W - M - 100,
    y: FOOTER_Y,
    size: 9,
    font,
    color: rgb(0.55, 0.55, 0.55),
  });
}