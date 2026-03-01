// lib/pdf/plan2/sections/cover.ts
import { PDFDocument, PDFFont } from "pdf-lib";
import { newPage } from "../layout";
import { PAGE, TYPE, COLOR } from "../tokens";

export function renderCover(
  doc: PDFDocument,
  font: PDFFont,
  boldFont: PDFFont,
  meta: {
    planId: string;
    companyName: string;
    ymd: string;
  }
) {
  const ctx = newPage(doc);
  const centerX = PAGE.WIDTH / 2;
  
  // 主标题（居中）
  const title = "企业健身房解决方案";
  const titleW = boldFont.widthOfTextAtSize(title, 24);
  ctx.page.drawText(title, {
    x: centerX - titleW / 2,
    y: PAGE.HEIGHT - 200,
    size: 24,
    font: boldFont,
    color: COLOR.ink,
  });
  
  // 副标题
  const subtitle = "AI Fitness Solution";
  const subtitleW = font.widthOfTextAtSize(subtitle, 14);
  ctx.page.drawText(subtitle, {
    x: centerX - subtitleW / 2,
    y: PAGE.HEIGHT - 240,
    size: 14,
    font,
    color: COLOR.mute,
  });
  
  // 企业信息
  const companyText = `为 ${meta.companyName} 定制`;
  const companyW = font.widthOfTextAtSize(companyText, TYPE.BODY);
  ctx.page.drawText(companyText, {
    x: centerX - companyW / 2,
    y: PAGE.HEIGHT - 400,
    size: TYPE.BODY,
    font,
    color: COLOR.text,
  });
  
  // Plan ID
  const planText = `Plan ID: ${meta.planId}`;
  const planW = font.widthOfTextAtSize(planText, TYPE.SMALL);
  ctx.page.drawText(planText, {
    x: centerX - planW / 2,
    y: PAGE.HEIGHT - 430,
    size: TYPE.SMALL,
    font,
    color: COLOR.mute,
  });
  
  // 日期
  const dateText = meta.ymd;
  const dateW = font.widthOfTextAtSize(dateText, TYPE.SMALL);
  ctx.page.drawText(dateText, {
    x: centerX - dateW / 2,
    y: 100,
    size: TYPE.SMALL,
    font,
    color: COLOR.mute,
  });
}
