// lib/pdf/budget.ts
import fs from "fs/promises";
import path from "path";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb, degrees } from "pdf-lib";

export async function renderBudgetPdfBuffer(input: any, opts: any): Promise<Buffer> {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);

  const fontPath = path.join(process.cwd(), "public", "fonts", "NotoSansSC-Regular.ttf");
  const fontBytes = await fs.readFile(fontPath);
  const font = await doc.embedFont(fontBytes, { subset: true });

  const pageW = 595.28;
  const pageH = 841.89;
  const margin = 48;

  const page = doc.addPage([pageW, pageH]);

  const pdfVersion = String(opts?.pdfVersion || "BUDGET_PDF_DEV");
  const nowText = new Date().toLocaleString("zh-CN", { hour12: false });

  // ---------- 顶部黑条 ----------
  page.drawRectangle({
    x: 0,
    y: pageH - 64,
    width: pageW,
    height: 64,
    color: rgb(0.05, 0.05, 0.05),
  });

  page.drawText("BUDGET PDF（预算方案）", {
    x: margin,
    y: pageH - 40,
    size: 16,
    font,
    color: rgb(1, 1, 1),
  });

  page.drawText(`${pdfVersion}  |  PlanId: ${input?.planId || "-"}`, {
    x: margin,
    y: pageH - 58,
    size: 9,
    font,
    color: rgb(0.85, 0.85, 0.85),
  });

  // ---------- 水印 ----------
  page.drawText("BUDGET PDF", {
    x: 110,
    y: 420,
    size: 64,
    font,
    color: rgb(0.85, 0.85, 0.85),
    rotate: degrees(20),
    opacity: 0.25 as any, // pdf-lib 有的版本不支持 opacity；不支持也不影响生成
  } as any);

  // ---------- 内容 ----------
  let y = pageH - 96;

  const line = (label: string, value: string, size = 12) => {
    page.drawText(`${label}：${value}`, {
      x: margin,
      y,
      size,
      font,
      color: rgb(0, 0, 0),
    });
    y -= size + 10;
  };

  line("企业名称", String(input?.companyName || "—"), 13);
  line("企业规模", String(input?.companySize || "—"));
  line("预算等级", String(input?.budgetTier || "—"));
  line("参与率", String(input?.participationRate ?? "—"));
  y -= 6;

  page.drawText("示例预算明细（占位）", {
    x: margin,
    y,
    size: 14,
    font,
    color: rgb(0, 0, 0),
  });
  y -= 24;

  const item = (name: string, range: string) => {
    page.drawText(`• ${name}`, { x: margin, y, size: 12, font, color: rgb(0, 0, 0) });
    page.drawText(range, { x: pageW - margin - 180, y, size: 12, font, color: rgb(0, 0, 0) });
    y -= 18;
  };

  item("有氧设备", "¥60,000 – ¥120,000");
  item("力量器械", "¥40,000 – ¥90,000");
  item("配套设施", "¥20,000 – ¥50,000");

  y -= 10;
  page.drawText("合计区间：¥120,000 – ¥260,000", {
    x: margin,
    y,
    size: 14,
    font,
    color: rgb(0, 0, 0),
  });

  // footer
  page.drawText(`导出时间：${nowText}`, {
    x: margin,
    y: 28,
    size: 9,
    font,
    color: rgb(0.35, 0.35, 0.35),
  });

  const bytes = await doc.save();
  return Buffer.from(bytes);
}
