/**
 * V4 Tender Delivery — 商业化统一文案（保密声明 / 封面 / 签章收口）
 */
import type { PDFFont, PDFPage } from "pdf-lib";
import { rgb } from "pdf-lib";

import {
  FREEZE_COVER_CONFIDENTIAL_BASE_Y,
  FREEZE_COVER_CONFIDENTIAL_GAP_CONF_TO_EVAL,
  FREEZE_COVER_CONFIDENTIAL_GAP_STATUS_TO_CONF,
  FREEZE_COVER_META_LINE_GAP,
  FREEZE_SIGN_PAGE_ARCHIVE_START_Y,
} from "@/lib/pdf/commercialFreezeDesignSystem";
import {
  TENDER_DOC_BRAND,
  TENDER_DOC_SYSTEM,
} from "@/lib/pdf/tenderDocumentContext";

/** 正文页脚带（双行，结构不变） */
export const TENDER_CONFIDENTIAL_LINE_1 = "Confidential";
export const TENDER_CONFIDENTIAL_LINE_2 = "For Tender Evaluation Only";

/** 封面 / 开篇统一保密三层（顺序固定） */
export const TENDER_DOCUMENT_STATUS_LINE = "Commercial Tender Document";
export const TENDER_EVALUATION_NOTICE_LINE =
  "For Evaluation & Procurement Use Only";

export const TENDER_PLAN_VOLUME_SUBTITLE =
  "Tender Delivery · Technical Proposal Volume";
export const TENDER_BUDGET_VOLUME_SUBTITLE_EN =
  "Tender Delivery · Commercial Pricing Volume";

/** 封面垂直节奏（V1 Commercial Freeze） */
export const COVER_CONFIDENTIAL_BASE_Y = FREEZE_COVER_CONFIDENTIAL_BASE_Y;
export const COVER_CONFIDENTIAL_GAP_STATUS_TO_CONF =
  FREEZE_COVER_CONFIDENTIAL_GAP_STATUS_TO_CONF;
export const COVER_CONFIDENTIAL_GAP_CONF_TO_EVAL =
  FREEZE_COVER_CONFIDENTIAL_GAP_CONF_TO_EVAL;
export const COVER_META_LINE_GAP = FREEZE_COVER_META_LINE_GAP;
export const SIGN_PAGE_ARCHIVE_START_Y = FREEZE_SIGN_PAGE_ARCHIVE_START_Y;

/** 投标声明 / 签章 */
export const TENDER_DECLARATION_SIGN_TITLE = "投标文件签署与确认";
export const TENDER_SIGN_LABEL_COMPANY = "投标单位（盖章）：";
export const TENDER_SIGN_LABEL_REPRESENTATIVE = "法定代表人或授权代表：";
export const TENDER_SIGN_LABEL_DATE = "签署日期：";

/** 签章 / 交付收口（企业正式语气） */
export const TENDER_CLOSING_DELIVERY_LINES = [
  `本文件为 ${TENDER_DOC_BRAND} ${TENDER_DOC_SYSTEM}`,
  "正式交付版本。",
] as const;

export const TENDER_CLOSING_USE_NOTICE = "仅用于投标评审与商务沟通。";

export const TENDER_CLOSING_PAGE_TITLE = "正式交付与签章";

/** 签章页底部归档 / 法律说明（小字浅灰） */
export const TENDER_AUTHORITY_ARCHIVE_LINES = [
  `本文件由 ${TENDER_DOC_BRAND} ${TENDER_DOC_SYSTEM}`,
  "生成并统一归档。",
  "",
  "本交付版本仅用于：",
  "投标评审、商务沟通与采购决策参考。",
  "",
  "未经授权不得对外传播。",
] as const;

const NOTICE_FAINT = rgb(0.52, 0.54, 0.56);
const NOTICE_SOFT = rgb(0.62, 0.64, 0.67);
const BODY_INK = rgb(0.14, 0.14, 0.16);
const BODY_MUTED = rgb(0.35, 0.35, 0.38);
const ARCHIVE_FAINT = rgb(0.58, 0.6, 0.63);

export type DrawConfidentialNoticeOpts = {
  marginL?: number;
  marginR?: number;
  line1Y?: number;
  centered?: boolean;
};

/** 页脚带上方双行（正文页；封面请用 drawTenderCoverConfidentialBlock） */
export function drawTenderConfidentialNotice(
  page: PDFPage,
  font: PDFFont,
  opts: DrawConfidentialNoticeOpts = {},
): void {
  const W = page.getWidth();
  const marginL = opts.marginL ?? 46;
  const y1 = opts.line1Y ?? 104;
  const y2 = y1 - 14;
  const centered = opts.centered !== false;

  const drawLine = (text: string, y: number, size: number) => {
    const w = font.widthOfTextAtSize(text, size);
    const x = centered ? W / 2 - w / 2 : marginL;
    page.drawText(text, {
      x,
      y,
      size,
      font,
      color: size >= 9 ? NOTICE_SOFT : NOTICE_FAINT,
    });
  };

  drawLine(TENDER_CONFIDENTIAL_LINE_1, y1, 9);
  drawLine(TENDER_CONFIDENTIAL_LINE_2, y2, 8.5);
}

export type DrawCoverConfidentialBlockOpts = {
  baseY?: number;
  centered?: boolean;
  marginL?: number;
};

/**
 * 封面底部统一三层：Commercial Tender Document → Confidential → For Evaluation & Procurement Use Only
 */
export function drawTenderCoverConfidentialBlock(
  page: PDFPage,
  font: PDFFont,
  opts: DrawCoverConfidentialBlockOpts = {},
): void {
  const W = page.getWidth();
  const marginL = opts.marginL ?? 46;
  const centered = opts.centered !== false;
  const yStatus = opts.baseY ?? COVER_CONFIDENTIAL_BASE_Y;
  const yConf = yStatus - COVER_CONFIDENTIAL_GAP_STATUS_TO_CONF;
  const yEval = yConf - COVER_CONFIDENTIAL_GAP_CONF_TO_EVAL;

  const drawLine = (text: string, y: number, size: number, color: typeof NOTICE_SOFT) => {
    const w = font.widthOfTextAtSize(text, size);
    const x = centered ? W / 2 - w / 2 : marginL;
    page.drawText(text, { x, y, size, font, color });
  };

  drawLine(TENDER_DOCUMENT_STATUS_LINE, yStatus, 9.5, NOTICE_SOFT);
  drawLine(TENDER_CONFIDENTIAL_LINE_1, yConf, 9, NOTICE_SOFT);
  drawLine(TENDER_EVALUATION_NOTICE_LINE, yEval, 8.5, NOTICE_FAINT);
}

export type DrawTenderClosingBlockOpts = {
  marginL?: number;
  startY?: number;
  lineHeight?: number;
};

export function drawTenderClosingBlock(
  page: PDFPage,
  font: PDFFont,
  opts: DrawTenderClosingBlockOpts = {},
): number {
  const marginL = opts.marginL ?? 46;
  let y = opts.startY ?? 520;
  const lh = opts.lineHeight ?? 26;

  page.drawText(TENDER_CLOSING_PAGE_TITLE, {
    x: marginL,
    y,
    size: 13,
    font,
    color: BODY_INK,
  });
  y -= lh + 8;

  for (const line of TENDER_CLOSING_DELIVERY_LINES) {
    page.drawText(line, {
      x: marginL,
      y,
      size: 11,
      font,
      color: BODY_INK,
    });
    y -= lh;
  }

  page.drawText(TENDER_CLOSING_USE_NOTICE, {
    x: marginL,
    y,
    size: 10.5,
    font,
    color: BODY_MUTED,
  });
  y -= lh;

  return y;
}

export type DrawAuthorityArchiveNoteOpts = {
  marginL?: number;
  startY?: number;
  maxWidth?: number;
  fontSize?: number;
};

/** 签章区下方的企业归档 / 法律说明（浅灰小字） */
export function drawTenderAuthorityArchiveNote(
  page: PDFPage,
  font: PDFFont,
  opts: DrawAuthorityArchiveNoteOpts = {},
): void {
  const marginL = opts.marginL ?? 46;
  const maxWidth = opts.maxWidth ?? 480;
  const fontSize = opts.fontSize ?? 8;
  const lineHeight = fontSize + 5;
  let y = opts.startY ?? 118;

  for (const raw of TENDER_AUTHORITY_ARCHIVE_LINES) {
    const text = raw.trim();
    if (!text) {
      y -= lineHeight * 0.55;
      continue;
    }
    void maxWidth;
    page.drawText(text, {
      x: marginL,
      y,
      size: fontSize,
      font,
      color: ARCHIVE_FAINT,
    });
    y -= lineHeight;
  }
}
