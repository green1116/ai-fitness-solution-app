// lib/pdf/renderBudget.ts
/**
 * 完整可覆盖实现 — renderBudgetPdfBuffer
 * - 输出紧凑商业风预算 PDF（2 页）
 * - 保留并使用外部的 buildBudgetSummary / getBudgetSummary（不改原逻辑）
 * - 使用 pdf-lib + fontkit（你现有栈）
 *
 * 注意：
 * - 依赖：public/fonts/NotoSansSC-Regular.ttf（若路径不同请调整）
 * - 导出：renderBudgetPdfBuffer(input, opts) -> Promise<Uint8Array>
 * - 也导出 BUDGET_PDF_VERSION 常量以便路由记录版本指纹
 */

import fs from "fs/promises";
import path from "path";
import fontkit from "@pdf-lib/fontkit";
import {
  PDFDocument,
  rgb,
  StandardFonts,
  PDFFont,
  degrees,
} from "pdf-lib";

import { buildBudgetSummary } from "@/lib/gym-budget"; // 保留原 summary 生成器
import type { BudgetTier, CompanySize } from "@/lib/types/gym-budget";

export type BudgetPdfInput = {
  planId: string;
  companyName?: string;
  companySize?: CompanySize | number;
  budgetTier?: BudgetTier | "low" | "mid" | "high";

  // 兼容你现有 pipeline
  spaceSqm?: number;
  participationRate?: number; // 0~1
  tz?: string;
};

export type RenderBudgetPdfOpts = {
  pdfVersion?: string;
  engineFP?: string;
  reqsig?: string;
  dateYmd?: string; // 可传入渲染日期，否则使用当前
};

export const BUDGET_PDF_VERSION = "BUDGET_PDF_V20260228_COMPACT_A1";

/* ---------------- utils ---------------- */

async function loadFontBytes() {
  // 默认路径：public/fonts/NotoSansSC-Regular.ttf
  const p = path.join(process.cwd(), "public", "fonts", "NotoSansSC-Regular.ttf");
  return fs.readFile(p);
}

function padRight(s: string, width: number) {
  if (s.length >= width) return s;
  return s + " ".repeat(width - s.length);
}

function fmtRange(r: { min?: number; max?: number } | number | undefined) {
  if (r == null) return "-";
  if (typeof r === "number") return r.toFixed(0);
  const { min, max } = r as any;
  if (min == null && max == null) return "-";
  if (min != null && max != null) {
    if (min === max) return `${Math.round(min)}`;
    return `${Math.round(min)} - ${Math.round(max)}`;
  }
  return `${Math.round(min ?? max)}`;
}

function ymdNow() {
  const d = new Date();
  return d.toISOString().slice(0, 10).replace(/-/g, "/");
}

/* return number of points used for a right-aligned cell */
function drawRightAlignedText(
  page: any,
  font: PDFFont,
  size: number,
  text: string,
  xRight: number,
  y: number
) {
  const w = font.widthOfTextAtSize(text, size);
  page.drawText(text, {
    x: xRight - w,
    y,
    size,
    font,
  });
}

/* ---------------- main renderer ---------------- */

export async function renderBudgetPdfBuffer(
  input: BudgetPdfInput,
  opts: RenderBudgetPdfOpts = {}
): Promise<Uint8Array> {
  // Keep a fingerprint log (top-level console helps debugging)
  console.log("[BUDGET_RENDER] FP:", BUDGET_PDF_VERSION, "planId:", input?.planId);

  const fontBytes = await loadFontBytes();
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  const noto = await pdfDoc.embedFont(fontBytes);
  const lato = await pdfDoc.embedFont(StandardFonts.Helvetica); // fallback for numbers

  // Build summary using existing logic (unchanged)
  const summary = await buildBudgetSummary({
    planId: input.planId,
    companyName: input.companyName,
    companySize: Number(input.companySize || 0),
    budgetTier: (input.budgetTier as any) || "mid",
    spaceSqm: input.spaceSqm,
    participationRate: input.participationRate,
  });

  // ---------- Page sizes & layout ----------
  const pageW = 595.28; // A4 width in points (portrait)
  const pageH = 841.89;
  const marginLeft = 40;
  const marginRight = 40;
  const usableW = pageW - marginLeft - marginRight;

  // Typography
  const titleSize = 16;
  const headingSize = 11;
  const bodySize = 9.5;
  const smallSize = 8.0;

  // ---------- Page 1: Overview ----------
  const page1 = pdfDoc.addPage([pageW, pageH]);
  const { lines = [], overallTotal, estimatedBySubtotals, tier } = summary || {};

  // Header
  page1.drawText("AI Fitness Solution", {
    x: marginLeft,
    y: pageH - 44,
    size: 12,
    font: noto,
  });
  page1.drawText("企业健身房预算概览（自动生成）", {
    x: marginLeft,
    y: pageH - 60,
    size: titleSize,
    font: noto,
  });

  // Project metadata box (right)
  const metaX = pageW - marginRight - 180;
  page1.drawRectangle({
    x: metaX - 8,
    y: pageH - 96,
    width: 188,
    height: 56,
    borderColor: rgb(0.85, 0.85, 0.85),
    borderWidth: 0.6,
  });
  page1.drawText(`企业： ${input.companyName || "示例企业"}`, {
    x: metaX,
    y: pageH - 72,
    size: bodySize,
    font: noto,
  });
  page1.drawText(`规模： ${input.companySize ?? "—"} 人`, {
    x: metaX,
    y: pageH - 88 + 6,
    size: bodySize,
    font: noto,
  });
  page1.drawText(`预算档位： ${(input.budgetTier || tier)}`, {
    x: metaX,
    y: pageH - 104 + 6,
    size: bodySize,
    font: noto,
  });

  // 总预算区间
  page1.drawText("建议总价区间：", { x: marginLeft, y: pageH - 108, size: headingSize, font: noto });
  const totalText = overallTotal
    ? `${Math.round(overallTotal.min).toLocaleString()} - ${Math.round(overallTotal.max).toLocaleString()}`
    : "—";
  page1.drawText(totalText, {
    x: marginLeft,
    y: pageH - 128,
    size: 14,
    font: lato,
  });

  // 分项小计表（紧凑）
  const tableYStart = pageH - 160;
  page1.drawText("按分项小计估算（参考）", { x: marginLeft, y: tableYStart + 18, size: bodySize, font: noto });

  const col1x = marginLeft;
  const col2x = marginLeft + usableW * 0.55;
  const col3x = marginLeft + usableW * 0.78;

  page1.drawText("类别", { x: col1x, y: tableYStart - 6, size: smallSize, font: noto });
  page1.drawText("小计（¥）", { x: col2x, y: tableYStart - 6, size: smallSize, font: noto });
  page1.drawText("数量指引", { x: col3x, y: tableYStart - 6, size: smallSize, font: noto });

  let curY = tableYStart - 26;
  const rowH = 18;
  for (const ln of lines.slice(0, 6)) {
    const cat = ln.categoryName || ln.category || "—";
    page1.drawText(cat, { x: col1x, y: curY, size: smallSize, font: noto });
    const subtotal = ln.subtotal || {};
    const subtotalText = fmtRange(subtotal);
    drawRightAlignedText(page1, lato, smallSize, subtotalText, col2x + 120, curY);
    page1.drawText(ln.qtyText || "-", { x: col3x, y: curY, size: smallSize, font: noto });
    curY -= rowH;
    if (curY < 120) break;
  }

  // 备注/声明
  const notesY = 130;
  page1.drawText("说明：总体预算为经验区间，分项小计为参考估算，最终以场地条件、品牌选择、安装施工与采购策略为准。", {
    x: marginLeft,
    y: notesY,
    size: smallSize,
    font: noto,
    maxWidth: usableW,
    lineHeight: 11,
  });

  // Footer: signature, date, page numbering
  const footerY = 40;
  page1.drawText(`Plan ID: ${input.planId || "unknown"} | ${opts.dateYmd || ymdNow()} | 1/2`, {
    x: marginLeft,
    y: footerY,
    size: 8,
    font: noto,
    color: rgb(0.45, 0.45, 0.45),
  });

  // ---------- Page 2: Detailed table (招标风紧凑商业版) ----------
  const page2 = pdfDoc.addPage([pageW, pageH]);

  page2.drawText("明细清单（示例）", { x: marginLeft, y: pageH - 56, size: titleSize, font: noto });

  // Table header: 6 columns
  const tMarginX = marginLeft;
  const tWidth = usableW;
  const cols = [
    { key: "cat", w: tWidth * 0.18, title: "类别" },
    { key: "name", w: tWidth * 0.34, title: "设备名称" },
    { key: "qty", w: tWidth * 0.12, title: "数量区间" },
    { key: "unit", w: tWidth * 0.14, title: "单价区间 (¥)" },
    { key: "sub", w: tWidth * 0.12, title: "小计 (¥)" },
    { key: "note", w: tWidth * 0.10, title: "说明" },
  ];

  // draw header row background line
  let tx = tMarginX;
  const headerY = pageH - 86;
  for (const c of cols) {
    page2.drawText(c.title, {
      x: tx + 4,
      y: headerY,
      size: smallSize,
      font: noto,
    });
    tx += c.w;
  }

  // draw rows
  let rowY = headerY - 18;
  const maxRowsPerPage = 24;
  let rowCount = 0;
  for (const ln of lines) {
    // columns values
    const cat = ln.categoryName || ln.category || "";
    const name = ln.itemName || ln.name || (ln.title || "");
    const qty = ln.qtyText || fmtRange(ln.qty || ln.qtyRange || undefined);
    const unitPriceText = ln.unitPriceText || fmtRange(ln.unitPrice || ln.unitPriceRange || undefined);
    const subtotal = ln.subtotal ? fmtRange(ln.subtotal) : "-";
    const note = ln.note ? (String(ln.note).slice(0, 40)) : "";

    tx = tMarginX;
    // cat
    page2.drawText(cat, { x: tx + 4, y: rowY, size: bodySize, font: noto });
    tx += cols[0].w;
    // name (wrap if necessary, but keep tight)
    page2.drawText(String(name).slice(0, 36), { x: tx + 4, y: rowY, size: bodySize, font: noto });
    tx += cols[1].w;
    // qty center-left
    page2.drawText(qty, { x: tx + 4, y: rowY, size: bodySize, font: noto });
    tx += cols[2].w;
    // unit price right-aligned
    drawRightAlignedText(page2, lato, bodySize, unitPriceText, tx + cols[3].w - 6, rowY);
    tx += cols[3].w;
    // subtotal right-aligned
    drawRightAlignedText(page2, lato, bodySize, subtotal, tx + cols[4].w - 6, rowY);
    tx += cols[4].w;
    // note
    page2.drawText(note, { x: tx + 4, y: rowY, size: smallSize, font: noto });

    rowY -= 18;
    rowCount++;
    if (rowCount >= maxRowsPerPage) break;
  }

  // If rows < some threshold, optionally fill with placeholders (keeps paginated appearance)
  if (rowCount < 6) {
    for (let i = rowCount; i < 6; i++) {
      page2.drawText("-", { x: tMarginX + 4, y: rowY, size: smallSize, font: noto });
      rowY -= 18;
    }
  }

  // bottom supplemental notes
  page2.drawText("价格口径：默认含设备采购与基础交付，是否含税/运费/安装以最终合同与清单标注为准。", {
    x: marginLeft,
    y: 96,
    size: smallSize,
    font: noto,
    maxWidth: usableW,
    lineHeight: 10,
  });

  page2.drawText(`Plan ID: ${input.planId || "unknown"} | ${opts.dateYmd || ymdNow()} | 2/2`, {
    x: marginLeft,
    y: 40,
    size: 8,
    font: noto,
    color: rgb(0.45, 0.45, 0.45),
  });

  // Save and return
  const bytes = await pdfDoc.save();
  return bytes;
}

export default renderBudgetPdfBuffer;