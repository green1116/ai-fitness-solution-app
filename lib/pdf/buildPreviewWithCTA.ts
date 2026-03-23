import fs from "fs";
import path from "path";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb } from "pdf-lib";

function pickFontPath() {
  const candidates = [
    path.join(process.cwd(), "public", "fonts", "NotoSansSC-Regular.ttf"),
    path.join(process.cwd(), "public", "fonts", "NotoSansSC", "NotoSansSC-Regular.ttf"),
    path.join(process.cwd(), "assets", "fonts", "NotoSansSC-Regular.ttf"),
  ];

  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }

  throw new Error("CTA_FONT_NOT_FOUND: NotoSansSC-Regular.ttf not found");
}

export async function buildPreviewWithCTA(fullBytes: Uint8Array) {
  const fullDoc = await PDFDocument.load(fullBytes);
  const previewDoc = await PDFDocument.create();
  previewDoc.registerFontkit(fontkit);

  // 复制前4页
  const indices = [0, 1, 2, 3].filter((i) => i < fullDoc.getPageCount());
  const copiedPages = await previewDoc.copyPages(fullDoc, indices);
  copiedPages.forEach((p) => previewDoc.addPage(p));

  // 字体
  const fontPath = pickFontPath();
  const fontBytes = fs.readFileSync(fontPath);
  const fontRegular = await previewDoc.embedFont(fontBytes, { subset: true });
  const fontBold = fontRegular;

  // 让 CTA 页尺寸与原始文档第一页保持一致
  const basePage = fullDoc.getPage(0);
  const { width, height } = basePage.getSize();
  const page = previewDoc.addPage([width, height]);

  // 背景
  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: rgb(1, 1, 1),
  });

  // 顶部小标题
  page.drawText("企业健身空间解决方案", {
    x: 56,
    y: height - 88,
    size: 15,
    font: fontBold,
    color: rgb(0.18, 0.18, 0.18),
  });

  // 主标题
  page.drawText("预览已结束", {
    x: 56,
    y: height - 132,
    size: 28,
    font: fontBold,
    color: rgb(0.08, 0.08, 0.08),
  });

  // 说明
  page.drawText("您当前查看的是方案预览版，已展示前 4 页核心内容。", {
    x: 56,
    y: height - 172,
    size: 12,
    font: fontRegular,
    color: rgb(0.26, 0.26, 0.26),
  });

  page.drawText("提交邮箱后，可解锁完整版专业方案与预算资料。", {
    x: 56,
    y: height - 194,
    size: 12,
    font: fontRegular,
    color: rgb(0.26, 0.26, 0.26),
  });

  // 中部信息框
  const boxX = 56;
  const boxY = height - 390;
  const boxW = width - 112;
  const boxH = 150;

  page.drawRectangle({
    x: boxX,
    y: boxY,
    width: boxW,
    height: boxH,
    color: rgb(0.97, 0.97, 0.97),
    borderColor: rgb(0.86, 0.86, 0.86),
    borderWidth: 1,
  });

  page.drawText("解锁完整版后，您将获得：", {
    x: boxX + 20,
    y: boxY + boxH - 28,
    size: 14,
    font: fontBold,
    color: rgb(0.12, 0.12, 0.12),
  });

  const bullets = [
    "完整 22 页企业健身空间专业方案",
    "详细预算估算与设备配置建议",
    "空间规划与实施落地路线",
    "适用于企业汇报、内部立项与商务沟通",
  ];

  let bulletY = boxY + boxH - 58;
  for (const item of bullets) {
    page.drawText(`• ${item}`, {
      x: boxX + 24,
      y: bulletY,
      size: 12,
      font: fontRegular,
      color: rgb(0.22, 0.22, 0.22),
    });
    bulletY -= 24;
  }

  // 底部 CTA
  page.drawText("立即解锁完整方案", {
    x: 56,
    y: 150,
    size: 22,
    font: fontBold,
    color: rgb(0.08, 0.08, 0.08),
  });

  page.drawText("提交邮箱后即可下载完整版 PDF，并获取更完整的预算与配置内容。", {
    x: 56,
    y: 118,
    size: 12,
    font: fontRegular,
    color: rgb(0.26, 0.26, 0.26),
  });

  // 页脚细线
  page.drawLine({
    start: { x: 56, y: 84 },
    end: { x: width - 56, y: 84 },
    thickness: 1,
    color: rgb(0.85, 0.85, 0.85),
  });

  page.drawText("本预览版仅展示核心摘要，完整版用于正式评估、汇报与方案比较。", {
    x: 56,
    y: 64,
    size: 10,
    font: fontRegular,
    color: rgb(0.45, 0.45, 0.45),
  });

  const out = await previewDoc.save();
  return out;
}