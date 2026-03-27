// lib/pdf/brand.ts
import { PDFPage, PDFFont, rgb } from "pdf-lib";
import { sig8 } from "@/lib/pdf/engine/sig";

// ✅ 页边距常量（企业级排版）
export const PAGE_TOP_OFFSET = 60;
export const PAGE_BOTTOM_SAFE = 60;

// ✅ 统一段落间距（消灭内容密度不均）
export const GAP_SM = 10;
export const GAP_MD = 16;
export const GAP_LG = 24;

export type BrandLayout = {
  left: number;
  right: number;
  top: number;        // header baseline y
  bottom: number;
  width: number;
  contentTop: number; // ✅ 内容起始 y（安全区）
  pageTop: number;    // 正文起始 y（PAGE_TOP）
  pageBottom: number; // 底部安全区 y（PAGE_BOTTOM）
};

export function computeBrandLayout(page: PDFPage): BrandLayout {
  const { width, height } = page.getSize();

  const pageTop = height - PAGE_TOP_OFFSET;
  const pageBottom = PAGE_BOTTOM_SAFE;

  // ✅ 把 header 整体略上移，同时给内容留出 32pt 安全区
  const top = height - 40;         // 原来 -56 太靠下，线会压到大标题
  const contentTop = top - 32;     // 内容从这里开始画，避免与 header/line 重叠

  return {
    left: 48,
    right: 48,
    top,
    bottom: 54,
    width,
    contentTop,
    pageTop,
    pageBottom,
  };
}

export function drawBrandHeader(page: PDFPage, font: PDFFont, layout: BrandLayout) {
  page.drawText("AI Fitness Solution", {
    x: layout.left,
    y: layout.top,
    size: 10,
    font,
    color: rgb(0.30, 0.35, 0.40),
  });

  // ✅ 分隔线再往上提一点，并且不要压到内容区
  const lineY = layout.top - 12;
  page.drawLine({
    start: { x: layout.left, y: lineY },
    end: { x: layout.width - layout.right, y: lineY },
    thickness: 1,
    color: rgb(0.88, 0.90, 0.92),
  });
}

export function drawBrandFooter(
  page: PDFPage,
  font: PDFFont,
  layout: BrandLayout,
  meta: {
    planId: string;
    ymd: string;
    sig: string;
    pageNo: number;
    pageTotal: number;
  }
) {
  const { width, height } = page.getSize();
  const y = 24; // ✅ 固定底边距

  const leftText = `Plan ID: ${meta.planId} | ${meta.ymd} | ${meta.pageNo}/${meta.pageTotal}  SIG: ${sig8(meta.sig)}`;

  page.drawText(leftText, { x: layout.left, y, size: 9, font, color: rgb(0.40, 0.45, 0.50) });

  const mark = "AI Fitness Solution";
  const mw = font.widthOfTextAtSize(mark, 9);

  page.drawText(mark, { x: width - layout.right - mw, y, size: 9, font, color: rgb(0.55, 0.60, 0.65) });
}

export function drawSectionTitle(
  page: PDFPage,
  font: PDFFont,
  layout: BrandLayout,
  y: number,
  titleCN: string,
  titleEN: string
) {
  page.drawText(titleCN, {
    x: layout.left,
    y,
    size: 13,
    font,
    color: rgb(0.10, 0.12, 0.14),
  });

  const cnWidth = font.widthOfTextAtSize(titleCN, 13);
  page.drawText(` ${titleEN}`, {
    x: layout.left + cnWidth,
    y,
    size: 10,
    font,
    color: rgb(0.50, 0.55, 0.60),
  });
}

/** 预估高度不足时需换页（避免半页空白） */
export function needNewPage(
  currentY: number,
  needHeight: number,
  pageBottom: number = PAGE_BOTTOM_SAFE
): boolean {
  return currentY - needHeight < pageBottom;
}

/** 统一 section 标题（中文 + 英文，标题和内容一致） */
export function drawSectionHeader(
  page: PDFPage,
  font: PDFFont,
  layout: BrandLayout,
  y: number,
  titleCN: string,
  titleEN: string
): number {
  page.drawText(titleCN, {
    x: layout.left,
    y,
    size: 16,
    font,
    color: rgb(0.10, 0.12, 0.14),
  });
  y -= 20;
  page.drawText(titleEN, {
    x: layout.left,
    y,
    size: 10,
    font,
    color: rgb(0.50, 0.55, 0.60),
  });
  return y - GAP_LG;
}

// ---- Typography Tokens (Plan22 overlays) ----
export const TYPE = {
  // Titles
  H1: 18,      // Page major title
  H2: 14,      // Section title
  H3: 12,      // Subsection title
  // Body
  BODY: 11,
  SMALL: 9.5,
  CAPTION: 9,

  // Leading (line height)
  LH: {
    H1: 24,
    H2: 20,
    H3: 17,
    BODY: 16,
    SMALL: 14,
    CAPTION: 13,
  },

  // Color system (neutral enterprise)
  C: {
    ink: rgb(0.08, 0.10, 0.12),
    text: rgb(0.10, 0.12, 0.14),
    mute: rgb(0.45, 0.50, 0.55),
    soft: rgb(0.50, 0.55, 0.60),
    line: rgb(0.90, 0.92, 0.94),
    border: rgb(0.88, 0.90, 0.92),
    card: rgb(0.995, 0.995, 0.998),
  },
};

export function drawH1(page: PDFPage, font: PDFFont, layout: BrandLayout, y: number, text: string) {
  page.drawText(text, { x: layout.left, y, size: TYPE.H1, font, color: TYPE.C.ink });
  return y - TYPE.LH.H1;
}

export function drawH2(page: PDFPage, font: PDFFont, layout: BrandLayout, y: number, text: string) {
  page.drawText(text, { x: layout.left, y, size: TYPE.H2, font, color: TYPE.C.text });
  return y - TYPE.LH.H2;
}

export function drawH3(page: PDFPage, font: PDFFont, layout: BrandLayout, y: number, text: string) {
  page.drawText(text, { x: layout.left, y, size: TYPE.H3, font, color: TYPE.C.text });
  return y - TYPE.LH.H3;
}

export function drawKicker(page: PDFPage, font: PDFFont, layout: BrandLayout, y: number, text: string) {
  page.drawText(text, { x: layout.left, y, size: TYPE.SMALL, font, color: TYPE.C.soft });
  return y - TYPE.LH.SMALL;
}

export function drawDivider(page: PDFPage, layout: BrandLayout, y: number) {
  const w = layout.width - layout.left - layout.right;
  page.drawLine({
    start: { x: layout.left, y },
    end: { x: layout.left + w, y },
    thickness: 1,
    color: TYPE.C.line,
  });
  return y - 14;
}