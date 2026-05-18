import type { PDFDocument, PDFFont } from "pdf-lib";
import { rgb } from "pdf-lib";

import {
  drawTenderDeliveryFooter,
  drawUnifiedFooter,
  FOOTER_WIPE_HEIGHT_PT,
  TENDER_DOC_VERSION,
} from "@/lib/pdf/shared/documentChrome";

export type RepaginateFooterVariant = "v3" | "tender_delivery";

export type RepaginateMergedPdfOptions = {
  /** 不覆盖页脚（默认第 0 页封面不画页脚） */
  skipFooterPageIndexes?: number[];
  /** @deprecated V3 页脚 TF slug */
  footerTfRef?: string;
  /** V4 居中主行（默认 V4 Tender Delivery） */
  footerCenterLabel?: string;
  footerSigLine?: string;
  marginL?: number;
  marginR?: number;
  footerVariant?: RepaginateFooterVariant;
};

/**
 * 遍历 merged PDF，白底盖住底部后重绘统一页脚。
 */
export function repaginateMergedPdf(
  doc: PDFDocument,
  font: PDFFont,
  options: RepaginateMergedPdfOptions = {},
): void {
  const pages = doc.getPages();
  const totalPages = Math.max(1, pages.length);
  const skip = new Set(options.skipFooterPageIndexes ?? [0]);
  const marginL = options.marginL ?? 46;
  const marginR = options.marginR ?? 46;
  const variant = options.footerVariant ?? "tender_delivery";
  const centerLabel =
    options.footerCenterLabel ??
    options.footerTfRef ??
    TENDER_DOC_VERSION;

  for (let i = 0; i < pages.length; i++) {
    if (skip.has(i)) continue;
    const page = pages[i];
    const W = page.getWidth();

    page.drawRectangle({
      x: 0,
      y: 0,
      width: W,
      height: FOOTER_WIPE_HEIGHT_PT,
      color: rgb(1, 1, 1),
      borderWidth: 0,
    });

    if (variant === "tender_delivery") {
      drawTenderDeliveryFooter(page, font, {
        pageNo: i + 1,
        pageTotal: totalPages,
        footerCenterLabel: centerLabel,
        footerSigLine: options.footerSigLine,
        marginL,
        marginR,
        showConfidentialNotice: false,
      });
    } else {
      drawUnifiedFooter(page, font, {
        pageNo: i + 1,
        pageTotal: totalPages,
        coverBand: false,
        footerTfRef: options.footerTfRef,
        footerSigLine: options.footerSigLine,
        marginL,
        marginR,
      });
    }
  }
}
