// lib/pdf/plan2/components/headerFooter.ts
import { PDFPage, PDFFont } from "pdf-lib";
import { PAGE, TYPE, COLOR } from "../tokens";

export function drawFooter(
  page: PDFPage,
  font: PDFFont,
  meta: {
    planId: string;
    ymd: string;
    pageNo: number;
    pageTotal: number;
    sig8: string;
  }
) {
  const y = 24;

  const leftText =
    `Plan ID: ${meta.planId} | ${meta.ymd} | ${meta.pageNo}/${meta.pageTotal}  SIG: ${meta.sig8}`;

  page.drawText(leftText, {
    x: PAGE.MARGIN_L,
    y,
    size: TYPE.SMALL,
    font,
    color: COLOR.mute,
  });

  const brand = "AI Fitness Solution";
  const tw = font.widthOfTextAtSize(brand, TYPE.SMALL);

  page.drawText(brand, {
    x: PAGE.WIDTH - PAGE.MARGIN_R - tw,
    y,
    size: TYPE.SMALL,
    font,
    color: COLOR.mute,
  });
}
