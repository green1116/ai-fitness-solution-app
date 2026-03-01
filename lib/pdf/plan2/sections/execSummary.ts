// lib/pdf/plan2/sections/execSummary.ts
import { PDFDocument, PDFFont } from "pdf-lib";
import { newPage } from "../layout";
import { drawH1, drawBody } from "../components/titles";

export function renderExecSummary(
  doc: PDFDocument,
  font: PDFFont
) {
  const ctx = newPage(doc);
  let y = ctx.cursorY;

  y = drawH1(ctx.page, font, y, "执行摘要");

  y = drawBody(ctx.page, font, y,
    "• 本方案适用于 200 人规模企业的办公健身空间。");
  y = drawBody(ctx.page, font, y,
    "• 建议 120㎡ 可落地基础有氧 + 力量配置。");
  y = drawBody(ctx.page, font, y,
    "• 预算建议控制在 10–20 万，优先保障商用耐用与安全。");
}
