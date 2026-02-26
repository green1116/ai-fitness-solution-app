// lib/pdf/engine/header.ts
import { PDFPage, PDFFont, rgb } from "pdf-lib";
import type { PdfTheme } from "./theme";
import { getThemeConfig } from "./theme";

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const HEADER_H = 64;
const M = 48;

export function drawHeader(
  page: PDFPage,
  font: PDFFont,
  mono: PDFFont,
  logoImage: any,
  title: string,
  companyName: string,
  pdfVersion: string,
  theme: PdfTheme
) {
  const cfg = getThemeConfig(theme);

  if (cfg.headerBg) {
    page.drawRectangle({
      x: 0,
      y: PAGE_H - HEADER_H,
      width: PAGE_W,
      height: HEADER_H,
      color: rgb(cfg.headerBg.r, cfg.headerBg.g, cfg.headerBg.b),
    });
  }

  const logoW = theme === "tender" ? 70 : 86;
  const scale = logoW / logoImage.width;
  const logoH = logoImage.height * scale;

  const logoX = theme === "tender" ? M : PAGE_W - M - logoW;
  const logoY = PAGE_H - 18 - logoH;

  page.drawImage(logoImage, {
    x: logoX,
    y: logoY,
    width: logoW,
    height: logoH,
  });

  const textX = theme === "tender" ? M + logoW + 12 : M;

  page.drawText(title, {
    x: textX,
    y: PAGE_H - 34,
    size: 16,
    font,
    color: rgb(cfg.headerText.r, cfg.headerText.g, cfg.headerText.b),
  });

  page.drawText(companyName, {
    x: textX,
    y: PAGE_H - 52,
    size: 10.5,
    font,
    color: rgb(cfg.subText.r, cfg.subText.g, cfg.subText.b),
  });

  page.drawText(`PDF_VERSION: ${pdfVersion}`, {
    x: PAGE_W - M - 250,
    y: PAGE_H - 52,
    size: 8.5,
    font: mono,
    color: rgb(cfg.subText.r, cfg.subText.g, cfg.subText.b),
  });
}