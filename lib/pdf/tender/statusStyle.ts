import { rgb, type PDFFont, type PDFPage } from "pdf-lib";

export type TenderDisplayStatus =
  | "满足"
  | "响应"
  | "待确认"
  | "部分满足"
  | "偏离"
  | "无此项";

export function normalizeTenderDisplayStatus(v: unknown): TenderDisplayStatus {
  const s = String(v || "").trim();

  switch (s) {
    case "满足":
    case "完全满足":
      return "满足";

    case "响应":
    case "已响应":
      return "响应";

    case "待确认":
    case "待补充":
      return "待确认";

    case "部分满足":
    case "基本满足":
      return "部分满足";

    case "偏离":
    case "不满足":
      return "偏离";

    case "无此项":
    case "不适用":
      return "无此项";

    default:
      return "无此项";
  }
}

/** @deprecated 使用 normalizeTenderDisplayStatus */
export const normalizeDisplayStatus = (raw: string) =>
  normalizeTenderDisplayStatus(raw);

export function getTenderStatusStyle(status: TenderDisplayStatus) {
  switch (status) {
    case "满足":
      return {
        textColor: rgb(0.12, 0.42, 0.22),
        fillColor: rgb(0.91, 0.97, 0.92),
      };
    case "响应":
      return {
        textColor: rgb(0.12, 0.3, 0.62),
        fillColor: rgb(0.9, 0.94, 0.99),
      };
    case "待确认":
      return {
        textColor: rgb(0.72, 0.46, 0.06),
        fillColor: rgb(0.99, 0.96, 0.88),
      };
    case "部分满足":
      return {
        textColor: rgb(0.76, 0.38, 0.06),
        fillColor: rgb(0.99, 0.93, 0.88),
      };
    case "偏离":
      return {
        textColor: rgb(0.72, 0.12, 0.12),
        fillColor: rgb(0.99, 0.91, 0.91),
      };
    case "无此项":
    default:
      return {
        textColor: rgb(0.42, 0.42, 0.42),
        fillColor: rgb(0.95, 0.95, 0.95),
      };
  }
}

export function drawStatusBadge(params: {
  page: PDFPage;
  status: TenderDisplayStatus;
  x: number;
  y: number;
  w: number;
  h: number;
  font: PDFFont;
  fontSize?: number;
}) {
  const { page, status, x, y, w, h, font, fontSize = 8.5 } = params;
  const { textColor, fillColor } = getTenderStatusStyle(status);

  const badgeW = Math.min(40, Math.max(28, w - 12));
  const badgeH = 14;
  const bx = x + (w - badgeW) / 2;
  const by = y + (h - badgeH) / 2;

  page.drawRectangle({
    x: bx,
    y: by,
    width: badgeW,
    height: badgeH,
    color: fillColor,
    borderWidth: 0,
  });

  const tw = font.widthOfTextAtSize(status, fontSize);
  const tx = bx + (badgeW - tw) / 2;
  const ty = by + (badgeH - fontSize) / 2 + 1.5;

  page.drawText(status, {
    x: tx,
    y: ty,
    size: fontSize,
    font,
    color: textColor,
  });
}
