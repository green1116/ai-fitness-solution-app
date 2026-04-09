import type { PDFFont, PDFPage } from "pdf-lib";
import { rgb } from "pdf-lib";

export type TenderDisplayStatus =
  | "满足"
  | "响应"
  | "待确认"
  | "部分满足"
  | "偏离"
  | "无此项";

export function normalizeDisplayStatus(raw: string): TenderDisplayStatus {
  const s = String(raw || "").trim();
  switch (s) {
    case "满足":
    case "响应":
    case "待确认":
    case "部分满足":
    case "偏离":
    case "无此项":
      return s;
    default:
      return "无此项";
  }
}

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

/** 状态列：浅底胶囊 + 居中文字，不铺满整格 */
export function drawStatusBadge(params: {
  page: PDFPage;
  statusText: string;
  cellX: number;
  cellY: number;
  cellW: number;
  cellH: number;
  font: PDFFont;
  fontSize?: number;
}) {
  const {
    page,
    statusText,
    cellX,
    cellY,
    cellW,
    cellH,
    font,
    fontSize = 8.5,
  } = params;

  const status = normalizeDisplayStatus(statusText);
  const label = status;
  const { textColor, fillColor } = getTenderStatusStyle(status);

  const badgeW = Math.min(40, Math.max(28, cellW - 12));
  const badgeH = 14;
  const bx = cellX + (cellW - badgeW) / 2;
  const by = cellY + (cellH - badgeH) / 2;

  page.drawRectangle({
    x: bx,
    y: by,
    width: badgeW,
    height: badgeH,
    color: fillColor,
    borderWidth: 0,
  });

  const tw = font.widthOfTextAtSize(label, fontSize);
  const tx = bx + Math.max(0, (badgeW - tw) / 2);
  const ty = by + (badgeH - fontSize) / 2 + 1.5;

  page.drawText(label, {
    x: tx,
    y: ty,
    size: fontSize,
    font,
    color: textColor,
  });
}
