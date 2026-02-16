// lib/pdf/table.ts
import { PDFPage, rgb, PDFFont } from "pdf-lib";

/**
 * tableRow helper — 接收 font（embed 后）
 */
export function tableRow(
  page: PDFPage,
  cells: string[],
  widths: number[],
  x0: number,
  yTop: number,
  rowH: number,
  font: PDFFont,
  opts?: { header?: boolean; aligns?: Array<"left" | "center" | "right"> }
) {
  const header = !!opts?.header;
  const aligns = opts?.aligns || [];

  let cx = x0;
  for (let i = 0; i < widths.length; i++) {
    page.drawRectangle({ x: cx, y: yTop - rowH, width: widths[i], height: rowH, borderWidth: 1, borderColor: rgb(0.85, 0.85, 0.85), color: rgb(1, 1, 1) });
    cx += widths[i];
  }

  cx = x0;
  for (let i = 0; i < cells.length; i++) {
    const w = widths[i];
    const pad = 6;
    const innerW = w - pad * 2;
    const baseSize = header ? 10 : 9;
    const text = String(cells[i] ?? "");
    const fullW = font.widthOfTextAtSize(text, baseSize);
    let size = baseSize;
    if (fullW > innerW) {
      const ratio = innerW / fullW;
      size = Math.max(7, Math.floor(baseSize * ratio));
    }
    let tx = cx + pad;
    if (aligns[i] === "center") {
      const tw = font.widthOfTextAtSize(text, size);
      tx = cx + (w - tw) / 2;
    } else if (aligns[i] === "right") {
      const tw = font.widthOfTextAtSize(text, size);
      tx = cx + w - pad - tw;
    }
    page.drawText(text, {
      x: tx,
      y: yTop - rowH + (rowH - size) / 2 + 2,
      size,
      font,
      color: rgb(0.12, 0.12, 0.12),
    });
    cx += widths[i];
  }
}
