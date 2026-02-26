// lib/pdf/engine/applyBranding.ts
import fs from "fs/promises";
import path from "path";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, PDFPage, PDFFont, rgb, StandardFonts } from "pdf-lib";

import type { PdfTheme } from "./theme";
import { getThemeConfig } from "./theme";
import { drawFooter } from "./footer";
import { drawWatermark } from "./watermark";

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const M = 48;

// 方案页眉：overlay 版（不画深色背景，避免盖住正文）
function drawOverlayHeader(args: {
  page: PDFPage;
  font: PDFFont;
  mono: PDFFont;
  logoImage: any;
  title: string;
  companyName: string;
  pdfVersion: string;
  theme: PdfTheme;
}) {
  const { page, font, mono, logoImage, title, companyName, pdfVersion, theme } = args;
  const cfg = getThemeConfig(theme);

  // 轻量顶部线（tender 更明显，brand 也保持克制）
  page.drawLine({
    start: { x: M, y: PAGE_H - 54 },
    end: { x: PAGE_W - M, y: PAGE_H - 54 },
    thickness: 1,
    color: rgb(0.9, 0.9, 0.9),
  });

  const logoW = theme === "tender" ? 64 : 72;
  const scale = logoW / logoImage.width;
  const logoH = logoImage.height * scale;

  // 左上角放 logo（overlay 统一位置）
  page.drawImage(logoImage, {
    x: M,
    y: PAGE_H - 22 - logoH,
    width: logoW,
    height: logoH,
    opacity: 0.95,
  });

  const textX = M + logoW + 10;
  const titleColor = rgb(cfg.headerText.r, cfg.headerText.g, cfg.headerText.b);
  const subColor = rgb(cfg.subText.r, cfg.subText.g, cfg.subText.b);

  page.drawText(title, {
    x: textX,
    y: PAGE_H - 34,
    size: 12.5,
    font,
    color: titleColor,
  });

  page.drawText(companyName, {
    x: textX,
    y: PAGE_H - 49,
    size: 9.5,
    font,
    color: subColor,
  });

  page.drawText(`PDF_VERSION: ${pdfVersion}`, {
    x: PAGE_W - M - 250,
    y: PAGE_H - 49,
    size: 8.5,
    font: mono,
    color: subColor,
  });
}

async function loadFontBytes() {
  return fs.readFile(path.join(process.cwd(), "public/fonts/NotoSansSC-Regular.ttf"));
}

async function loadLogoBytes() {
  return fs.readFile(path.join(process.cwd(), "public/brand/logo.png"));
}

export async function applyBrandingToDoc(params: {
  doc: PDFDocument;
  title: string;
  companyName: string;
  pdfVersion: string;
  theme: PdfTheme;
  watermarkEnabled: boolean;
}) {
  const { doc, title, companyName, pdfVersion, theme, watermarkEnabled } = params;

  // 若外面忘记 register，这里兜底一次（重复调用没关系）
  try {
    doc.registerFontkit(fontkit);
  } catch {}

  const [fontBytes, logoBytes] = await Promise.all([loadFontBytes(), loadLogoBytes()]);
  const font = await doc.embedFont(fontBytes, { subset: true });
  const mono = await doc.embedFont(StandardFonts.Courier);
  const logoImage = await doc.embedPng(logoBytes);

  const totalPages = doc.getPageCount();

  for (let i = 0; i < totalPages; i++) {
    const page = doc.getPage(i);

    // 水印（可关）
    drawWatermark(page, font, theme, watermarkEnabled);

    // 页眉 overlay（不盖正文）
    drawOverlayHeader({
      page,
      font,
      mono,
      logoImage,
      title,
      companyName,
      pdfVersion,
      theme,
    });

    // 页脚（复用你 engine/footer.ts）
    drawFooter(page, font, i + 1, totalPages, theme);
  }
}