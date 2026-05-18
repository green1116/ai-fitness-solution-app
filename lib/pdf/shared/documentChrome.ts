import type { PDFDocument, PDFFont, PDFPage } from "pdf-lib";
import { rgb } from "pdf-lib";

import { drawTenderConfidentialNotice } from "@/lib/pdf/tenderCommercialCopy";
import {
  TENDER_DOC_BRAND,
  TENDER_DOC_SYSTEM,
  TENDER_DOC_VERSION,
} from "@/lib/pdf/tenderDocumentContext";

/** Plan / Budget 统一企业文档品牌 */
export const ENTERPRISE_DOC_BRAND = TENDER_DOC_BRAND;
/** 文档体系版本标识（页眉右下角） — 独立于封面版式 */
export const ENTERPRISE_DOC_VERSION = TENDER_DOC_VERSION;
export { TENDER_DOC_VERSION };

/** A4 高；与 renderPlanPdf BODY_TOP = PAGE_HEIGHT - 88 对齐（勿改 88，以免分页变化） */
const PAGE_H_REF = 841.89;
/** 页眉底线与正文首行基准之间的额外留白（仅上移分隔线，不改正文分页） */
const HEADER_RULE_GAP_ABOVE_BODY = 38;

const HEADER_RULE_GRAY = rgb(0.84, 0.84, 0.84);
const HEADER_BRAND_LARGE = rgb(0.22, 0.24, 0.29);
const HEADER_BRAND_SMALL = rgb(0.43, 0.45, 0.49);
const HEADER_DOC_LINE = rgb(0.41, 0.43, 0.46);
const FOOTER_RULE_GRAY = rgb(0.84, 0.84, 0.84);
const FOOTER_MUTED = rgb(0.5, 0.52, 0.54);
const FOOTER_SOFT = rgb(0.62, 0.64, 0.67);
const FOOTER_PAGE_NUM = rgb(0.53, 0.55, 0.58);

function headerRuleAndZone(): {
  ruleY: number;
  brandLine1Y: number;
  brandLine2Y: number;
  docLine1YR: number;
  docLine2YR: number;
} {
  const bodyTopApprox = PAGE_H_REF - 88;
  const ruleY = bodyTopApprox + HEADER_RULE_GAP_ABOVE_BODY;
  return {
    ruleY,
    brandLine1Y: ruleY + 40,
    brandLine2Y: ruleY + 25,
    docLine1YR: ruleY + 40,
    docLine2YR: ruleY + 25,
  };
}

function footerZones(pageH: number): {
  ruleY: number;
  confidentialY: number;
  internalY: number;
  pagerowY: number;
  sigY: number;
} {
  const footerTopSpacing = 18;
  const ruleY = 56 + footerTopSpacing;
  return {
    ruleY,
    confidentialY: 48,
    internalY: 34,
    pagerowY: 48,
    sigY: 22,
  };
}

/** V4 单层页脚节奏（保密带 + 左栏堆叠） */
function tenderDeliveryFooterLayout(_pageH: number) {
  return {
    confidentialY1: 108,
    ruleY: 74,
    brandY: 50,
    systemY: 38,
    versionY: 26,
    sigY: 14,
    pageY: 50,
  };
}

export type UnifiedFooterOptions = {
  pageNo: number;
  pageTotal: number;
  coverBand?: boolean;
  /** @deprecated 使用 footerTfRef / footerSigLine */
  centerText?: string;
  footerTfRef?: string;
  /** REQSIG 等短验真文案（居中副行） */
  footerSigLine?: string;
  marginL?: number;
  marginR?: number;
};

export type RestampChromeOptions = {
  skipPageIndexes?: number[];
  drawHeader?: boolean;
  drawFooter?: boolean;
  /** @deprecated 使用 footerTfRef / footerSigLine */
  centerText?: string;
  footerTfRef?: string;
  footerSigLine?: string;
  marginL?: number;
  marginR?: number;
};

export function normalizePageNumber(
  pageNo: number,
  pageTotal: number,
): { pageNo: number; pageTotal: number } {
  const total = Math.max(1, Math.floor(Number.isFinite(pageTotal) ? pageTotal : 1));
  const raw = Math.floor(Number.isFinite(pageNo) ? pageNo : 1);
  const no = Math.max(1, Math.min(raw || 1, total));
  return { pageNo: no, pageTotal: total };
}

export const normalizePagination = normalizePageNumber;

export function formatPageLabel(pageNo: number, pageTotal: number): string {
  const { pageNo: pno, pageTotal: ptot } = normalizePageNumber(pageNo, pageTotal);
  return `第 ${pno} 页 / 共 ${ptot} 页`;
}

export function formatPageLabelEn(pageNo: number, pageTotal: number): string {
  const { pageNo: pno, pageTotal: ptot } = normalizePageNumber(pageNo, pageTotal);
  return `Page ${pno} / ${ptot}`;
}

export function footerTfSlug(planId?: string): string | undefined {
  const s = String(planId ?? "").trim();
  if (!s) return undefined;
  return `TF-${s.slice(0, 8).toUpperCase()}`;
}

export type TenderDeliveryFooterOptions = {
  pageNo: number;
  pageTotal: number;
  /** 居中主行，默认 V4 Tender Delivery */
  footerCenterLabel?: string;
  footerSigLine?: string;
  marginL?: number;
  marginR?: number;
  /** 正文页脚保密双行（已废弃；封面三层块为唯一体系，默认 false） */
  showConfidentialNotice?: boolean;
};

const TD_LEFT_PRIMARY = rgb(0.22, 0.24, 0.29);
const TD_LEFT_SECONDARY = rgb(0.52, 0.54, 0.56);

/**
 * V4 Tender Delivery 统一页脚（plan / budget / merged pack 同构，单层左栏）：
 * AI Fitness Solution → Tender Delivery System → V4 Tender Delivery → REQSIG → Page X / Total
 */
export function drawTenderDeliveryFooter(
  page: PDFPage,
  font: PDFFont,
  opts: TenderDeliveryFooterOptions,
): void {
  const { pageNo, pageTotal } = normalizePageNumber(opts.pageNo, opts.pageTotal);
  const W = page.getWidth();
  const marginL = opts.marginL ?? 46;
  const marginR = opts.marginR ?? 46;
  const z = tenderDeliveryFooterLayout(page.getHeight());

  if (opts.showConfidentialNotice === true) {
    drawTenderConfidentialNotice(page, font, {
      marginL,
      marginR,
      line1Y: z.confidentialY1,
      centered: true,
    });
  }

  page.drawLine({
    start: { x: marginL, y: z.ruleY },
    end: { x: W - marginR, y: z.ruleY },
    thickness: 0.5,
    color: FOOTER_RULE_GRAY,
  });

  page.drawText(TENDER_DOC_BRAND, {
    x: marginL,
    y: z.brandY,
    size: 8.2,
    font,
    color: TD_LEFT_PRIMARY,
  });
  page.drawText(TENDER_DOC_SYSTEM, {
    x: marginL,
    y: z.systemY,
    size: 7.2,
    font,
    color: TD_LEFT_SECONDARY,
  });

  const versionLabel = (opts.footerCenterLabel ?? TENDER_DOC_VERSION).trim();
  if (versionLabel) {
    page.drawText(versionLabel, {
      x: marginL,
      y: z.versionY,
      size: 7.2,
      font,
      color: FOOTER_MUTED,
    });
  }

  const sigLine = opts.footerSigLine?.trim();
  if (sigLine) {
    page.drawText(sigLine, {
      x: marginL,
      y: z.sigY,
      size: 6.8,
      font,
      color: FOOTER_SOFT,
    });
  }

  const pg = formatPageLabelEn(pageNo, pageTotal);
  const pgSize = 7.8;
  const pgw = font.widthOfTextAtSize(pg, pgSize);
  page.drawText(pg, {
    x: W - marginR - pgw,
    y: z.pageY,
    size: pgSize,
    font,
    color: FOOTER_PAGE_NUM,
  });
}

/** 含保密带 + 页脚左栏，擦除时需覆盖完整旧层 */
export const FOOTER_WIPE_HEIGHT_PT = 128;

export type RestampTenderDeliveryOptions = {
  skipPageIndexes?: number[];
  footerCenterLabel?: string;
  footerSigLine?: string;
  marginL?: number;
  marginR?: number;
  /**
   * @deprecated 页眉由正文/章节标题承担；禁止再叠 V3 drawUnifiedHeader，避免与页脚双套品牌。
   */
  drawHeader?: boolean;
};

/** 擦除底部旧页脚后，仅重绘单层 Tender Delivery 页脚（不叠 V3 页眉）。 */
export function restampTenderDeliveryChrome(
  doc: PDFDocument,
  font: PDFFont,
  opts: RestampTenderDeliveryOptions = {},
): void {
  const pages = doc.getPages();
  const totalPages = Math.max(1, pages.length);
  const skip = new Set(opts.skipPageIndexes ?? []);
  const marginL = opts.marginL ?? 46;
  const marginR = opts.marginR ?? 46;

  pages.forEach((page, index) => {
    if (skip.has(index)) return;
    const W = page.getWidth();

    page.drawRectangle({
      x: 0,
      y: 0,
      width: W,
      height: FOOTER_WIPE_HEIGHT_PT,
      color: rgb(1, 1, 1),
      borderWidth: 0,
    });

    drawTenderDeliveryFooter(page, font, {
      pageNo: index + 1,
      pageTotal: totalPages,
      footerCenterLabel: opts.footerCenterLabel ?? TENDER_DOC_VERSION,
      footerSigLine: opts.footerSigLine,
      marginL,
      marginR,
      showConfidentialNotice: false,
    });
  });
}

/**
 * V3 提案风页脚（左 Confidential / Internal · 中央 TF slug / 可选 SIG · 右 Page X/Y）
 * @deprecated 企业交付请使用 drawTenderDeliveryFooter / restampTenderDeliveryChrome
 */
export function drawUnifiedFooter(page: PDFPage, font: PDFFont, opts: UnifiedFooterOptions): void {
  const { pageNo, pageTotal } = normalizePageNumber(opts.pageNo, opts.pageTotal);
  const W = page.getWidth();
  const H = page.getHeight();
  const marginL = opts.marginL ?? 46;
  const marginR = opts.marginR ?? 46;
  const cover = opts.coverBand !== false;

  const z = footerZones(H);
  const footerBand = 82;

  if (cover) {
    page.drawRectangle({
      x: 0,
      y: 0,
      width: W,
      height: footerBand,
      color: rgb(1, 1, 1),
      borderWidth: 0,
    });
  }

  page.drawLine({
    start: { x: marginL, y: z.ruleY },
    end: { x: W - marginR, y: z.ruleY },
    thickness: 0.5,
    color: FOOTER_RULE_GRAY,
  });

  const leftLn1 = "Confidential";
  const leftLn2 = "AI Fitness Solution Internal Proposal";

  page.drawText(leftLn1, {
    x: marginL,
    y: z.confidentialY,
    size: 8,
    font,
    color: FOOTER_SOFT,
  });
  page.drawText(leftLn2, {
    x: marginL,
    y: z.internalY,
    size: 7.2,
    font,
    color: FOOTER_MUTED,
  });

  const centerPrimary = opts.footerTfRef?.trim();
  const centerSecondary = opts.footerSigLine?.trim();

  if (centerPrimary) {
    const sz = 7.9;
    const cw = font.widthOfTextAtSize(centerPrimary, sz);
    page.drawText(centerPrimary, {
      x: W / 2 - cw / 2,
      y: z.pagerowY,
      size: sz,
      font,
      color: FOOTER_MUTED,
    });
  }

  if (centerSecondary) {
    const sz = 6.8;
    const cw = font.widthOfTextAtSize(centerSecondary, sz);
    page.drawText(centerSecondary, {
      x: W / 2 - cw / 2,
      y: centerPrimary ? z.sigY : z.pagerowY,
      size: sz,
      font,
      color: FOOTER_SOFT,
    });
  }

  const pg = formatPageLabelEn(pageNo, pageTotal);
  const pgSize = 7.8;
  const pgw = font.widthOfTextAtSize(pg, pgSize);
  page.drawText(pg, {
    x: W - marginR - pgw,
    y: z.pagerowY,
    size: pgSize,
    font,
    color: FOOTER_PAGE_NUM,
  });
}

/** V3 提案风页眉：左双层品牌 · 右上文档标识 + 版本分隔线（细灰） */
export function drawUnifiedHeader(
  page: PDFPage,
  font: PDFFont,
  pageWidth?: number,
  marginLR = 46,
): void {
  const W = pageWidth ?? page.getWidth();
  const h = headerRuleAndZone();

  page.drawText(ENTERPRISE_DOC_BRAND, {
    x: marginLR,
    y: h.brandLine1Y,
    size: 11,
    font,
    color: HEADER_BRAND_LARGE,
  });
  page.drawText("Enterprise Wellness Solution", {
    x: marginLR,
    y: h.brandLine2Y,
    size: 7.8,
    font,
    color: HEADER_BRAND_SMALL,
  });

  const rightL1 = "TECHNICAL & COMMERCIAL PROPOSAL";
  const rightL2 = ENTERPRISE_DOC_VERSION;
  const rs1 = 7.9;
  const rs2 = 7;
  const w1 = font.widthOfTextAtSize(rightL1, rs1);
  const w2 = font.widthOfTextAtSize(rightL2, rs2);

  page.drawText(rightL1, {
    x: W - marginLR - w1,
    y: h.docLine1YR,
    size: rs1,
    font,
    color: HEADER_DOC_LINE,
  });
  page.drawText(rightL2, {
    x: W - marginLR - w2,
    y: h.docLine2YR,
    size: rs2,
    font,
    color: HEADER_BRAND_SMALL,
  });

  page.drawLine({
    start: { x: marginLR, y: h.ruleY },
    end: { x: W - marginLR, y: h.ruleY },
    thickness: 0.5,
    color: HEADER_RULE_GRAY,
  });
}

export function restampDocumentChrome(
  doc: PDFDocument,
  font: PDFFont,
  opts: RestampChromeOptions = {},
): void {
  const pages = doc.getPages();
  const totalPages = Math.max(1, pages.length);
  const skip = new Set(opts.skipPageIndexes ?? []);
  const drawHeader = opts.drawHeader !== false;
  const drawFooter = opts.drawFooter !== false;
  const marginL = opts.marginL ?? 46;
  const marginR = opts.marginR ?? 46;

  const mergedSig =
    opts.footerSigLine?.trim() ||
    (opts.centerText && /^REQSIG:/i.test(String(opts.centerText)) ? String(opts.centerText).trim() : "");

  pages.forEach((page, index) => {
    if (skip.has(index)) return;
    if (drawHeader) {
      drawUnifiedHeader(page, font, page.getWidth(), marginL);
    }
    if (drawFooter) {
      drawUnifiedFooter(page, font, {
        pageNo: index + 1,
        pageTotal: totalPages,
        coverBand: true,
        footerTfRef: opts.footerTfRef,
        footerSigLine: mergedSig || undefined,
        marginL,
        marginR,
      });
    }
  });
}

/** @deprecated 使用 drawUnifiedFooter */
export function drawEnterpriseDocumentFooter(
  page: PDFPage,
  font: PDFFont,
  pageNo: number,
  pageTotal: number,
  opts?: { coverBand?: boolean },
): void {
  drawUnifiedFooter(page, font, {
    pageNo,
    pageTotal,
    coverBand: opts?.coverBand,
  });
}

/** @deprecated 使用 drawUnifiedHeader */
export function drawEnterpriseDocumentHeader(
  page: PDFPage,
  font: PDFFont,
  pageWidth: number,
  marginL = 46,
): void {
  drawUnifiedHeader(page, font, pageWidth, marginL);
}
