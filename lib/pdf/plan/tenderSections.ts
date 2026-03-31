import type { PDFPage } from "pdf-lib";
import { TOKENS } from "@/lib/pdf/tokens";

export function drawTenderCompliancePage(ctx: any): PDFPage {
  const { doc, font, fontBold } = ctx;
  const page = doc.addPage();

  let y = TOKENS.topY;
  const M = TOKENS.marginX;

  // 标题
  page.drawText("投标合规与承诺", {
    x: M,
    y,
    size: 20,
    font: fontBold,
    color: TOKENS.colorText,
  });

  y -= 30;

  page.drawText("Tender Compliance & Commitment", {
    x: M,
    y,
    size: 12,
    font,
    color: TOKENS.colorSubtle,
  });

  y -= 40;

  const items = [
    "本方案符合企业健身空间建设相关规范要求",
    "设备选型符合安全、环保及耐用标准",
    "项目实施将严格按照约定周期推进",
    "提供完整售后与维护支持体系",
  ];

  items.forEach((text, i) => {
    page.drawText(`${i + 1}. ${text}`, {
      x: M,
      y,
      size: 12,
      font,
      color: TOKENS.colorText,
    });
    y -= 28;
  });

  return page;
}