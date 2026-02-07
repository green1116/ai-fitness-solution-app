// lib/pdf/table.ts
import { PDFPage, rgb, StandardFonts } from "pdf-lib";

type Col = { key: string; title: string; width: number; align?: "left" | "right" | "center" };

export async function drawSimpleTable(opts: {
  page: PDFPage;
  x: number;
  y: number;
  rowH?: number;
  cols: Col[];
  rows: Record<string, string | number>[];
}) {
  const { page, x, y, cols, rows } = opts;
  const rowH = opts.rowH ?? 22;

  const font = await page.doc.embedFont(StandardFonts.Helvetica);
  const fontSize = 10;

  const totalW = cols.reduce((s, c) => s + c.width, 0);

  // header background
  page.drawRectangle({ x, y: y - rowH, width: totalW, height: rowH, color: rgb(0.93, 0.93, 0.93) });

  // header text + vertical lines
  let cx = x;
  for (const c of cols) {
    page.drawText(c.title, { x: cx + 6, y: y - rowH + 6, size: fontSize, font, color: rgb(0, 0, 0) });
    page.drawLine({ start: { x: cx, y }, end: { x: cx, y: y - rowH * (rows.length + 1) }, color: rgb(0.8, 0.8, 0.8), thickness: 1 });
    cx += c.width;
  }
  page.drawLine({ start: { x: x + totalW, y }, end: { x: x + totalW, y: y - rowH * (rows.length + 1) }, color: rgb(0.8, 0.8, 0.8), thickness: 1 });

  // horizontal lines + rows
  let cy = y - rowH;
  page.drawLine({ start: { x, y }, end: { x: x + totalW, y }, color: rgb(0.8, 0.8, 0.8), thickness: 1 });
  page.drawLine({ start: { x, y: cy }, end: { x: x + totalW, y: cy }, color: rgb(0.8, 0.8, 0.8), thickness: 1 });

  for (const r of rows) {
    let rx = x;
    for (const c of cols) {
      const v = r[c.key] ?? "";
      const text = String(v);
      const pad = 6;

      // simple align
      let tx = rx + pad;
      if (c.align === "right") {
        const w = font.widthOfTextAtSize(text, fontSize);
        tx = rx + c.width - pad - w;
      } else if (c.align === "center") {
        const w = font.widthOfTextAtSize(text, fontSize);
        tx = rx + (c.width - w) / 2;
      }

      page.drawText(text, { x: tx, y: cy - rowH + 6, size: fontSize, font, color: rgb(0, 0, 0) });
      rx += c.width;
    }
    cy -= rowH;
    page.drawLine({ start: { x, y: cy }, end: { x: x + totalW, y: cy }, color: rgb(0.8, 0.8, 0.8), thickness: 1 });
  }
}
