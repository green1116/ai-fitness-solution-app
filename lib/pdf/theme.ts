// lib/pdf/theme.ts
import { rgb, type PDFFont, type PDFPage } from "pdf-lib";

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
    fontSizes: { title: 16, h2: 11, body: 9.6, small: 8.2, footer: 8 },
    margin: { l: 40, r: 40, t: 44, b: 40 },
    headerBlockH: 92,
  },
  tender: {
    name: "tender",
    colors: {
      text: rgb(0.08, 0.08, 0.08),
      sub: rgb(0.40, 0.40, 0.40),
      line: rgb(0.82, 0.82, 0.82),
    },
    fontSizes: { title: 16, h2: 11, body: 9.6, small: 8.2, footer: 8 },
    margin: { l: 42, r: 42, t: 46, b: 42 },
    headerBlockH: 96,
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

// 统一页脚：PlanID/日期/页码 + SIG/FP（弱化技术味）
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
    cover?: boolean; // ✅ 新增：是否先盖白底（默认 true）
  }
) {
  const cover = meta.cover !== false;

  const M = theme.margin;
  const W = page.getWidth();
  const y = M.b;
  const h = 18; // 页脚带高度

  // ✅ 关键：先盖一条白底"擦除带"（覆盖旧页脚）
  if (cover) {
    page.drawRectangle({
      x: 0,
      y: y - 4,
      width: W,
      height: h,
      color: rgb(1, 1, 1),
      borderWidth: 0,
    });
  }

  const left = `Plan ID: ${meta.planId || "-"} | ${meta.dateYmd || "-"} | ${meta.pageNo}/${meta.pageTotal}`;
  page.drawText(left, {
    x: M.l,
    y,
    size: theme.fontSizes.footer,
    font,
    color: theme.colors.sub,
  });

  const right = `${meta.fp ? meta.fp : ""}${meta.sig ? `  SIG:${meta.sig}` : ""}`.trim();
  if (right) {
    // 右对齐
    const w = font.widthOfTextAtSize(right, theme.fontSizes.footer);
    page.drawText(right, {
      x: W - M.r - w,
      y,
      size: theme.fontSizes.footer,
      font,
      color: theme.colors.sub,
    });
  }
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
  const topY = H - M.t + 14; // 轻微上移，让它更贴顶
  const lineY = topY - 14;

  // 左侧品牌
  page.drawText("AI Fitness Solution", {
    x: M.l,
    y: topY,
    size: 10.5,
    font,
    color: theme.colors.sub,
  });

  // 右侧一行 meta（可选，尽量短，避免压内容）
  const rightBits: string[] = [];
  if (meta?.companyName) rightBits.push(meta.companyName);
  if (meta?.companySize != null) rightBits.push(`${meta.companySize}人`);
  if (meta?.tierLabel) rightBits.push(String(meta.tierLabel).toUpperCase());
  const right = rightBits.join(" · ");

  if (right) {
    const w = font.widthOfTextAtSize(right, 9);
    page.drawText(right, {
      x: W - M.r - w,
      y: topY,
      size: 9,
      font,
      color: theme.colors.sub,
    });
  }

  // 细分割线（统一风格）
  drawHR(page, theme, lineY);

  // 返回“建议正文起点”（Plan22 一般不会用它，但给你留着）
  return lineY - 10;
};
