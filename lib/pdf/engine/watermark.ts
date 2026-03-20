// lib/pdf/engine/watermark.ts
import { PDFPage, PDFFont, rgb, degrees } from "pdf-lib";
import type { PdfTheme } from "./theme";

const PAGE_W = 595.28;
const PAGE_H = 841.89;

export function drawWatermark(
  page: PDFPage,
  font: PDFFont,
  theme: PdfTheme,
  enabled: boolean
) {
  if (!enabled) return;

  page.drawText("AI Fitness Solution", {
    x: PAGE_W / 2 - 170,
    y: PAGE_H / 2 - 10,
    size: 54,
    font,
    rotate: degrees(35),
    color: rgb(0.92, 0.92, 0.92),
    opacity: theme === "brand" ? 0.035 : 0.02,
  });
}