// lib/pdf/tocV6.ts
import { PDFDocument, PDFPage, PDFFont, rgb } from "pdf-lib";

export type TocLevel = 1 | 2;

export type TocItem = {
  title: string;
  page: number;     // 合并后最终页码（从 1 开始）
  level?: TocLevel; // 默认 1
};

export type TocV6Options = {
  title?: string;
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;

  fontSizeTitle?: number;
  fontSizeItemL1?: number;
  fontSizeItemL2?: number;
  lineHeight?: number;

  indentL2?: number;
  dotLeaderGap?: number;
  pageNumWidth?: number;

  colorText?: { r: number; g: number; b: number };
  colorMuted?: { r: number; g: number; b: number };
};

const A4 = { w: 595.28, h: 841.89 };

function clampTextToWidth(text: string, font: PDFFont, size: number, maxWidth: number) {
  if (font.widthOfTextAtSize(text, size) <= maxWidth) return text;
  const ellipsis = "…";
  let lo = 0;
  let hi = text.length;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    const t = text.slice(0, mid) + ellipsis;
    if (font.widthOfTextAtSize(t, size) <= maxWidth) lo = mid + 1;
    else hi = mid;
  }
  const cut = Math.max(0, lo - 1);
  return text.slice(0, cut) + ellipsis;
}

function drawDotLeaders(
  page: PDFPage,
  x1: number,
  x2: number,
  y: number,
  font: PDFFont,
  size: number,
  color: { r: number; g: number; b: number }
) {
  if (x2 <= x1) return;
  const dot = ".";
  const dotW = font.widthOfTextAtSize(dot, size);
  if (dotW <= 0) return;
  const count = Math.floor((x2 - x1) / dotW);
  if (count <= 0) return;
  const s = dot.repeat(Math.min(count, 220));
  page.drawText(s, { x: x1, y, size, font, color: rgb(color.r, color.g, color.b) });
}

export function addTocPagesV6(
  doc: PDFDocument,
  items: TocItem[],
  font: PDFFont,
  opts?: TocV6Options
): PDFPage[] {
  const o: Required<TocV6Options> = {
    title: opts?.title ?? "目录",
    marginTop: opts?.marginTop ?? 72,
    marginBottom: opts?.marginBottom ?? 64,
    marginLeft: opts?.marginLeft ?? 64,
    marginRight: opts?.marginRight ?? 64,

    fontSizeTitle: opts?.fontSizeTitle ?? 18,
    fontSizeItemL1: opts?.fontSizeItemL1 ?? 12,
    fontSizeItemL2: opts?.fontSizeItemL2 ?? 11,
    lineHeight: opts?.lineHeight ?? 18,

    indentL2: opts?.indentL2 ?? 18,
    dotLeaderGap: opts?.dotLeaderGap ?? 10,
    pageNumWidth: opts?.pageNumWidth ?? 48,

    colorText: opts?.colorText ?? { r: 0.12, g: 0.12, b: 0.12 },
    colorMuted: opts?.colorMuted ?? { r: 0.45, g: 0.45, b: 0.45 },
  };

  const size = A4;
  const usableW = size.w - o.marginLeft - o.marginRight;
  const leftX = o.marginLeft;
  const rightX = size.w - o.marginRight;
  const pageNumX = rightX - o.pageNumWidth;

  const pages: PDFPage[] = [];
  let page = doc.addPage([size.w, size.h]);
  pages.push(page);

  let y = size.h - o.marginTop;

  page.drawText(o.title, {
    x: leftX,
    y,
    size: o.fontSizeTitle,
    font,
    color: rgb(o.colorText.r, o.colorText.g, o.colorText.b),
  });
  y -= o.fontSizeTitle + 16;

  function newPage() {
    page = doc.addPage([size.w, size.h]);
    pages.push(page);
    y = size.h - o.marginTop;
  }

  for (const it of items) {
    const level = (it.level ?? 1) as 1 | 2;
    const fs = level === 1 ? o.fontSizeItemL1 : o.fontSizeItemL2;
    const indent = level === 2 ? o.indentL2 : 0;

    if (y < o.marginBottom + o.lineHeight) newPage();

    const titleMaxW = usableW - indent - o.pageNumWidth - o.dotLeaderGap;
    const safeTitle = clampTextToWidth(it.title, font, fs, Math.max(80, titleMaxW));

    const titleX = leftX + indent;
    const titleY = y;

    page.drawText(safeTitle, {
      x: titleX,
      y: titleY,
      size: fs,
      font,
      color: rgb(o.colorText.r, o.colorText.g, o.colorText.b),
    });

    const titleW = font.widthOfTextAtSize(safeTitle, fs);
    const dotsStartX = titleX + titleW + o.dotLeaderGap;
    const dotsEndX = pageNumX - 6;

    drawDotLeaders(page, dotsStartX, dotsEndX, titleY, font, fs, o.colorMuted);

    const pn = String(it.page);
    const pnW = font.widthOfTextAtSize(pn, fs);
    page.drawText(pn, {
      x: rightX - pnW,
      y: titleY,
      size: fs,
      font,
      color: rgb(o.colorText.r, o.colorText.g, o.colorText.b),
    });

    y -= o.lineHeight;
  }

  return pages;
}