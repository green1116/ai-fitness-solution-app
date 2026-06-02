// lib/pdf/theme.ts
import { rgb, type PDFFont, type PDFPage } from "pdf-lib";
import { drawUnifiedFooter, footerTfSlug } from "@/lib/pdf/shared/documentChrome";

export type PdfThemeName = "brand" | "tender";

export type PdfTheme = {
  name: PdfThemeName;
  colors: {
    text: ReturnType<typeof rgb>;
    sub: ReturnType<typeof rgb>;
    line: ReturnType<typeof rgb>;
  };
  fontSizes: {
    title: number;
    h2: number;
    body: number;
    small: number;
    footer: number;
  };
  margin: { l: number; r: number; t: number; b: number };
  // 顶部 header 占位高度（用来让正文自动避开）
  headerBlockH: number;
};

export const THEMES: Record<PdfThemeName, PdfTheme> = {
  brand: {
    name: "brand",
    colors: {
      text: rgb(0.12, 0.12, 0.12),
      sub: rgb(0.45, 0.45, 0.45),
      line: rgb(0.86, 0.86, 0.86),
    },
    fontSizes: { title: 16, h2: 11, body: 9.6, small: 8.2, footer: 9 },
    margin: { l: 40, r: 40, t: 44, b: 40 },
    headerBlockH: 96,
  },
  tender: {
    name: "tender",
    colors: {
      text: rgb(0.08, 0.08, 0.08),
      sub: rgb(0.40, 0.40, 0.40),
      line: rgb(0.82, 0.82, 0.82),
    },
    fontSizes: { title: 16, h2: 11, body: 9.6, small: 8.2, footer: 9 },
    margin: { l: 42, r: 42, t: 46, b: 42 },
    headerBlockH: 100,
  },
};

export type HeaderMeta = {
  companyName?: string;
  companySize?: number | string;
  tierLabel?: string; // "MID" / "LOW" / "HIGH"
  planId?: string;
  dateYmd?: string;
};

// 统一分隔线
export function drawHR(page: PDFPage, theme: PdfTheme, y: number) {
  const M = theme.margin;
  page.drawLine({
    start: { x: M.l, y },
    end: { x: page.getWidth() - M.r, y },
    thickness: 0.7,
    color: theme.colors.line,
  });
}

// 统一页眉：左上品牌 + 标题，右上信息框（固定坐标，避免重叠）
export function drawHeader(
  page: PDFPage,
  theme: PdfTheme,
  font: PDFFont,
  title: string,
  meta: HeaderMeta
) {
  const M = theme.margin;
  const W = page.getWidth();
  const H = page.getHeight();

  const topY = H - M.t;

  page.drawText("AI Fitness Solution", {
    x: M.l,
    y: topY,
    size: 12,
    font,
    color: theme.colors.sub,
  });

  page.drawText(title, {
    x: M.l,
    y: topY - 20,
    size: theme.fontSizes.title,
    font,
    color: theme.colors.text,
  });

  const boxW = 210;
  const boxH = 60;
  const bx = W - M.r - boxW;
  const by = topY - 16 - boxH;

  page.drawRectangle({
    x: bx,
    y: by,
    width: boxW,
    height: boxH,
    borderColor: theme.colors.line,
    borderWidth: 0.8,
  });

  const lineH = 16;
  const baseY = by + boxH - 18;

  if (meta.companyName) {
    page.drawText(`企业：${meta.companyName}`, {
      x: bx + 10,
      y: baseY,
      size: theme.fontSizes.body,
      font,
      color: theme.colors.text,
    });
  }
  if (meta.companySize != null) {
    page.drawText(`规模：${meta.companySize} 人`, {
      x: bx + 10,
      y: baseY - lineH,
      size: theme.fontSizes.body,
      font,
      color: theme.colors.text,
    });
  }
  if (meta.tierLabel) {
    page.drawText(`预算档位：${meta.tierLabel}`, {
      x: bx + 10,
      y: baseY - lineH * 2,
      size: theme.fontSizes.body,
      font,
      color: theme.colors.text,
    });
  }

  // 返回正文起始 Y（确保正文永远在信息框下方）
  const bodyStartY = by - 20;
  drawHR(page, theme, bodyStartY);
  return bodyStartY - 18;
}

/** 统一页脚入口 → drawUnifiedFooter（页码须在文档生成后由 restampDocumentChrome 回填） */
export function drawFooter(
  page: PDFPage,
  theme: PdfTheme,
  font: PDFFont,
  meta: {
    planId?: string;
    dateYmd?: string;
    pageNo: number;
    pageTotal: number;
    sig?: string;
    fp?: string;
    cover?: boolean;
  }
) {
  drawUnifiedFooter(page, font, {
    pageNo: meta.pageNo,
    pageTotal: meta.pageTotal,
    coverBand: meta.cover !== false,
    footerTfRef: footerTfSlug(meta.planId),
    footerSigLine: meta.sig ? `REQSIG: ${meta.sig}` : undefined,
    marginL: theme.margin.l,
    marginR: theme.margin.r,
  });
}

// ✅ Slim Header：用于 Plan22 golden 回放（不画右侧信息框，避免压内容）
export const drawHeaderSlim = (
  page: PDFPage,
  theme: PdfTheme,
  font: PDFFont,
  meta?: HeaderMeta
): number => {
  const M = theme.margin;
  const W = page.getWidth();
  const H = page.getHeight();

  // 顶部留很小的占位（不使用 headerBlockH 那么大）
  const topY = H - M.t;

  page.drawText("AI Fitness Solution", {
    x: M.l,
    y: topY,
    size: 10,
    font,
    color: theme.colors.sub,
  });

  if (meta?.planId) {
    const right = `Plan: ${meta.planId}`;
    const rw = font.widthOfTextAtSize(right, 8);
    page.drawText(right, {
      x: W - M.r - rw,
      y: topY,
      size: 8,
      font,
      color: theme.colors.sub,
    });
  }

  drawHR(page, theme, topY - 18);
  return topY - 36;
};
