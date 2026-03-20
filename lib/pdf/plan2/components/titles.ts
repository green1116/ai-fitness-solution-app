// lib/pdf/plan2/components/titles.ts
import { PDFPage, PDFFont } from "pdf-lib";
import { PAGE, TYPE, LEADING, COLOR } from "../tokens";

export function drawH1(page: PDFPage, font: PDFFont, y: number, text: string) {
  page.drawText(text, {
    x: PAGE.MARGIN_L,
    y,
    size: TYPE.H1,
    font,
    color: COLOR.ink,
  });
  return y - LEADING.H1;
}

export function drawBody(page: PDFPage, font: PDFFont, y: number, text: string) {
  page.drawText(text, {
    x: PAGE.MARGIN_L,
    y,
    size: TYPE.BODY,
    font,
    color: COLOR.text,
  });
  return y - LEADING.BODY;
}
