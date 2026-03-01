// lib/pdf/plan2/sections/toc.ts
import { PDFDocument, PDFFont } from "pdf-lib";
import { newPage } from "../layout";
import { drawH1, drawBody } from "../components/titles";

export function renderTOC(
  doc: PDFDocument,
  font: PDFFont
) {
  const ctx = newPage(doc);
  let y = ctx.cursorY;

  y = drawH1(ctx.page, font, y, "目录");
  y = drawBody(ctx.page, font, y, "Table of Contents");

  y -= 10;

  y = drawBody(ctx.page, font, y,
    "1. 执行摘要");
  y = drawBody(ctx.page, font, y,
    "2. 三档方案对比");
  y = drawBody(ctx.page, font, y,
    "3. 设备配置方案");
}
