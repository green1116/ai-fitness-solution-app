// lib/pdf/components.ts
// V3 企业级视觉组件：章节标题、信息卡片、表格样式

import type { PDFPage, PDFFont } from "pdf-lib";
import { rgb } from "pdf-lib";
import { TOKENS } from "./tokens";

/**
 * 招标文件风格章节标题：左侧色条 + 中英文标题 + 分割线
 */
export function drawChapterTitle(
  page: PDFPage,
  font: PDFFont,
  fontBold: PDFFont,
  yRef: { y: number },
  titleCn: string,
  titleEn?: string
): void {
  let y = yRef.y;
  const W = page.getWidth();
  const M = TOKENS.marginX;

  page.drawRectangle({
    x: M,
    y: y - 8,
    width: 6,
    height: 22,
    color: TOKENS.colorBrand,
  });

  page.drawText(titleCn, {
    x: M + 14,
    y,
    size: TOKENS.fsH2,
    font: fontBold,
    color: TOKENS.colorText,
  });

  if (titleEn) {
    page.drawText(titleEn, {
      x: M + 14,
      y: y - 14,
      size: TOKENS.fsSmall,
      font,
      color: TOKENS.colorSubtle,
    });
    y -= 30;
  } else {
    y -= 22;
  }

  page.drawLine({
    start: { x: M, y },
    end: { x: W - M, y },
    thickness: 0.8,
    color: TOKENS.colorLine,
  });

  yRef.y = y - TOKENS.gapLg;
}

/**
 * 信息卡片：摘要页专用，标题 + 数值
 */
export function drawInfoCard(
  page: PDFPage,
  font: PDFFont,
  fontBold: PDFFont,
  title: string,
  value: string,
  x: number,
  y0: number,
  w: number,
  h: number
): void {
  page.drawRectangle({
    x,
    y: y0 - h,
    width: w,
    height: h,
    color: TOKENS.colorBrandLight,
    borderColor: TOKENS.colorLine,
    borderWidth: 0.8,
  });

  page.drawText(title, {
    x: x + 12,
    y: y0 - 20,
    size: TOKENS.fsSmall,
    font,
    color: TOKENS.colorSubtle,
  });

  page.drawText(value, {
    x: x + 12,
    y: y0 - 42,
    size: 15,
    font: fontBold,
    color: TOKENS.colorBrand,
  });
}

/**
 * 投标级表头：深色底 + 白字
 */
export function drawTableHeader(
  page: PDFPage,
  fontBold: PDFFont,
  cols: { label: string; x: number; w: number; align?: "left" | "right" }[],
  y0: number,
  tableW: number
): void {
  const M = TOKENS.marginX;

  page.drawRectangle({
    x: M,
    y: y0 - 22,
    width: tableW,
    height: 22,
    color: TOKENS.colorBrand,
  });

  for (const c of cols) {
    const align = c.align || "left";
    const textW = fontBold.widthOfTextAtSize(c.label, TOKENS.fsSmall);
    const textX =
      align === "right" ? c.x + c.w - 6 - textW : c.x + 6;

    page.drawText(c.label, {
      x: textX,
      y: y0 - 15,
      size: TOKENS.fsSmall,
      font: fontBold,
      color: rgb(1, 1, 1),
    });
  }
}
