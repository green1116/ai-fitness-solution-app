/**
 * Tender Delivery Notice — 封面后企业交付过渡页（极简居中）
 */
import type { PDFDocument, PDFFont, PDFPage } from "pdf-lib";
import { rgb } from "pdf-lib";

import {
  PLAN_PAGE_HEIGHT,
  PLAN_PAGE_WIDTH,
} from "@/lib/pdf/planTypography";
import {
  TENDER_CLOSING_DELIVERY_LINES,
} from "@/lib/pdf/tenderCommercialCopy";
import { TENDER_DOC_VERSION } from "@/lib/pdf/tenderDocumentContext";

const C = {
  paper: rgb(0.995, 0.996, 1),
  title: rgb(0.12, 0.18, 0.32),
  body: rgb(0.18, 0.2, 0.24),
  muted: rgb(0.48, 0.5, 0.54),
  faint: rgb(0.58, 0.6, 0.63),
};

export type TenderDeliveryNoticeOpts = {
  reqsigLine?: string;
  versionLabel?: string;
  generatedDate?: string;
};

function centerX(page: PDFPage, text: string, size: number, font: PDFFont): number {
  const w = page.getWidth();
  const tw = font.widthOfTextAtSize(text, size);
  return Math.max(24, (w - tw) / 2);
}

function drawCentered(
  page: PDFPage,
  font: PDFFont,
  text: string,
  y: number,
  size: number,
  color: ReturnType<typeof rgb>,
): void {
  page.drawText(text, {
    x: centerX(page, text, size, font),
    y,
    size,
    font,
    color,
  });
}

/**
 * cover → delivery notice → declaration → TOC → body
 */
export function drawTenderDeliveryNoticePage(
  doc: PDFDocument,
  font: PDFFont,
  opts: TenderDeliveryNoticeOpts = {},
): void {
  const page = doc.addPage([PLAN_PAGE_WIDTH, PLAN_PAGE_HEIGHT]);
  const H = PLAN_PAGE_HEIGHT;

  page.drawRectangle({
    x: 0,
    y: 0,
    width: PLAN_PAGE_WIDTH,
    height: H,
    color: C.paper,
    borderWidth: 0,
  });

  let y = H * 0.62;

  drawCentered(page, font, "Tender Delivery Notice", y, 20, C.title);
  y -= 56;

  const bodyLines = [
    ...TENDER_CLOSING_DELIVERY_LINES,
    "",
    "本交付文件仅用于：",
    "投标评审、商务沟通与采购决策参考。",
    "",
    "未经授权不得对外传播。",
  ];

  for (const raw of bodyLines) {
    const text = raw.trim();
    if (!text) {
      y -= 14;
      continue;
    }
    const isCn = /[\u4e00-\u9fff]/.test(text);
    drawCentered(page, font, text, y, isCn ? 11.5 : 10.5, C.body);
    y -= isCn ? 30 : 26;
  }

  const version = opts.versionLabel?.trim() || TENDER_DOC_VERSION;
  const generated = opts.generatedDate?.trim() || "";
  const meta: string[] = [];
  if (opts.reqsigLine?.trim()) meta.push(opts.reqsigLine.trim());
  meta.push(`Document Version: ${version}`);
  meta.push(`Generated Date: ${generated || "—"}`);

  let my = 96;
  for (const line of meta) {
    drawCentered(page, font, line, my, 8, C.faint);
    my -= 14;
  }
}
