// lib/pdf/plan2/layout.ts
import { PDFDocument, PDFPage } from "pdf-lib";
import { PAGE } from "./tokens";

export type PageCtx = {
  page: PDFPage;
  cursorY: number;
};

export function newPage(doc: PDFDocument): PageCtx {
  const page = doc.addPage([PAGE.WIDTH, PAGE.HEIGHT]);

  return {
    page,
    cursorY: PAGE.HEIGHT - PAGE.MARGIN_TOP,
  };
}
