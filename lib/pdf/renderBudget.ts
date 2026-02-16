// lib/pdf/renderBudget.ts
import fs from "fs/promises";
import path from "path";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, PDFFont, PDFPage, rgb } from "pdf-lib";
import { buildBudgetSummary } from "@/lib/gym-budget";
import type { BudgetTier, CompanySize, Range } from "@/lib/types/gym-budget";

type Goal = "general" | "fatloss" | "strength" | "rehab";

export type BudgetPdfInput = {
  planId: string;
  companyName: string;
  companySize: CompanySize;
  budgetTier: BudgetTier;

  spaceSqm?: number;
  participationRate?: number; // 0~1
  goal?: Goal;
  preferSmart?: boolean;
  preferQuiet?: boolean;
};

export type BudgetPdfSection =
  | "header"
  | "overall"
  | "compare"
  | "table"
  | "brands"
  | "supplement"
  | "remarks";

export type RenderBudgetPdfOpts = {
  pdfVersion: string;
  sections?: BudgetPdfSection[];
};

function clamp01(v: any): number | null {
  const x = Number(v);
  if (!Number.isFinite(x)) return null;
  if (x <= 0 || x > 1) return null;
  return x;
}

function CNY(n: number) {
  const v = Math.round(n);
  return "¥" + v.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function formatRange(x: Range) {
  return `${CNY(x.min)}–${CNY(x.max)}`;
}
function formatRangeCompact(x: Range) {
  const k = (n: number) => {
    const v = Math.round(n);
    if (v >= 1000) return `${Math.round(v / 1000)}k`;
    return String(v);
  };
  return `¥${k(x.min)}–¥${k(x.max)}`;
}
function formatRangeSmart(x: Range, maxChars: number) {
  const full = `${CNY(x.min)}–${CNY(x.max)}`;
  return full.length <= maxChars ? full : formatRangeCompact(x);
}
function compactPriceText(s: string) {
  return (s || "")
    .replace(/[\r\n]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\s*\/\s*/g, "/")
    .replace(/\s*-\s*/g, "-")
    .trim();
}

async function loadFontBytes(rel: string) {
  const p = path.join(process.cwd(), rel);
  return fs.readFile(p);
}

// ---- layout constants ----
const A4_W = 595.28;
const A4_H = 841.89;

type Ctx = {
  doc: PDFDocument;
  font: PDFFont;
  fontBold: PDFFont; // 同字体伪粗体
  page: PDFPage;
  x: number;
  y: number;
  w: number;
  margin: number;
};

function newPage(ctx: Ctx) {
  ctx.page = ctx.doc.addPage([A4_W, A4_H]);
  ctx.x = ctx.margin;
  ctx.y = A4_H - ctx.margin;
}

function ensureSpace(ctx: Ctx, need: number) {
  if (ctx.y - need < ctx.margin) newPage(ctx);
}

function textWidth(font: PDFFont, text: string, size: number) {
  return font.widthOfTextAtSize(text, size);
}

function ellipsize(font: PDFFont, text: string, size: number, maxW: number) {
  const raw = String(text ?? "")
    .replace(/[\r\n]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!raw) return "-";
  if (textWidth(font, raw, size) <= maxW) return raw;
  let s = raw;
  while (s.length > 1 && textWidth(font, s + "…", size) > maxW) s = s.slice(0, -1);
  return s + "…";
}

function wrapByWidth(font: PDFFont, text: string, size: number, maxW: number): string[] {
  const raw = String(text ?? "")
    .replace(/[\r\n]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!raw) return ["-"];

  const out: string[] = [];
  let cur = "";
  for (const ch of raw) {
    const next = cur + ch;
    if (textWidth(font, next, size) <= maxW) {
      cur = next;
      continue;
    }
    if (cur) out.push(cur);
    cur = ch;
  }
  if (cur) out.push(cur);
  return out;
}

function drawBoldLike(page: PDFPage, font: PDFFont, text: string, x: number, y: number, size: number, color = rgb(0, 0, 0)) {
  page.drawText(text, { x, y, size, font, color });
  page.drawText(text, { x: x + 0.35, y, size, font, color });
}

function h1(ctx: Ctx, t: string) {
  ensureSpace(ctx, 34);
  drawBoldLike(ctx.page, ctx.fontBold, t, ctx.x, ctx.y - 20, 18, rgb(0, 0, 0));
  ctx.y -= 34;
}

function h2(ctx: Ctx, t: string) {
  ensureSpace(ctx, 28);
  drawBoldLike(ctx.page, ctx.fontBold, t, ctx.x, ctx.y - 16, 12, rgb(0, 0, 0));
  ctx.y -= 26;
}

function p(ctx: Ctx, t: string, size = 10, color = rgb(0, 0, 0)) {
  const lineH = size + 4;
  const lines = wrapByWidth(ctx.font, t, size, ctx.w);
  for (const line of lines) {
    ensureSpace(ctx, lineH);
    ctx.page.drawText(line, { x: ctx.x, y: ctx.y - size, size, font: ctx.font, color });
    ctx.y -= lineH;
  }
}

function hr(ctx: Ctx) {
  ensureSpace(ctx, 18);
  const y = ctx.y - 6;
  ctx.page.drawLine({
    start: { x: ctx.x, y },
    end: { x: ctx.x + ctx.w, y },
    thickness: 1,
    color: rgb(0.8, 0.8, 0.8),
  });
  ctx.y -= 18;
}

function bullet(ctx: Ctx, t: string) {
  const size = 10;
  const lineH = size + 4;
  const bulletX = ctx.x;
  const textX = ctx.x + 14;
  const maxW = ctx.w - 14;

  const lines = wrapByWidth(ctx.font, String(t ?? ""), size, maxW);
  for (let i = 0; i < lines.length; i++) {
    ensureSpace(ctx, lineH);
    if (i === 0) {
      ctx.page.drawText("•", { x: bulletX, y: ctx.y - 10, size: 12, font: ctx.font, color: rgb(0, 0, 0) });
    }
    ctx.page.drawText(lines[i], { x: textX, y: ctx.y - size, size, font: ctx.font, color: rgb(0, 0, 0) });
    ctx.y -= lineH;
  }
}

type Col = { title?: string; w: number; align?: "left" | "center" | "right" };

function tableHeader(ctx: Ctx, cols: Col[]) {
  const rowH = 24;
  ensureSpace(ctx, rowH + 6);

  const yTop = ctx.y;

  ctx.page.drawRectangle({
    x: ctx.x,
    y: yTop - rowH,
    width: ctx.w,
    height: rowH,
    color: rgb(0.95, 0.95, 0.95),
  });

  let x = ctx.x;
  for (const c of cols) {
    ctx.page.drawRectangle({
      x,
      y: yTop - rowH,
      width: c.w,
      height: rowH,
      borderColor: rgb(0.75, 0.75, 0.75),
      borderWidth: 1,
    });

    const title = String(c.title ?? "");
    const text = ellipsize(ctx.fontBold, title, 10, c.w - 10);
    const tw = textWidth(ctx.fontBold, text, 10);
    const tx =
      c.align === "right" ? x + c.w - 6 - tw :
      c.align === "center" ? x + (c.w - tw) / 2 :
      x + 6;

    drawBoldLike(ctx.page, ctx.fontBold, text, tx, yTop - 16, 10, rgb(0, 0, 0));
    x += c.w;
  }

  ctx.y -= (rowH + 6);
}

function tableRow(
  ctx: Ctx,
  cols: Col[],
  cells: string[],
  opts?: { shade?: boolean; strongCols?: number[] }
) {
  const rowH = 22;
  ensureSpace(ctx, rowH + 2);

  const yTop = ctx.y;

  if (opts?.shade) {
    ctx.page.drawRectangle({
      x: ctx.x,
      y: yTop - rowH,
      width: ctx.w,
      height: rowH,
      color: rgb(0.97, 0.97, 0.97),
    });
  }

  let x = ctx.x;
  for (let i = 0; i < cols.length; i++) {
    const w = cols[i].w;

    ctx.page.drawRectangle({
      x,
      y: yTop - rowH,
      width: w,
      height: rowH,
      borderColor: rgb(0.75, 0.75, 0.75),
      borderWidth: 1,
    });

    const fs = 9;
    const innerW = w - 10;

    const raw = String(cells[i] ?? "");
    const txt = ellipsize(ctx.font, raw, fs, innerW);
    const tw = textWidth(ctx.font, txt, fs);

    const tx =
      cols[i].align === "right" ? x + w - 6 - tw :
      cols[i].align === "center" ? x + (w - tw) / 2 :
      x + 6;

    const isStrong = (opts?.strongCols || []).includes(i);
    if (isStrong) drawBoldLike(ctx.page, ctx.fontBold, txt, tx, yTop - 15, fs, rgb(0, 0, 0));
    else ctx.page.drawText(txt, { x: tx, y: yTop - 15, size: fs, font: ctx.font, color: rgb(0, 0, 0) });

    x += w;
  }

  ctx.y -= (rowH + 2);
}

function normalizeColWidths(totalW: number, ratios: number[]) {
  const raw = ratios.map(r => Math.round(totalW * r));
  const sum = raw.reduce((a, b) => a + b, 0);
  raw[raw.length - 1] += (totalW - sum); // 补差到最后一列，保证刚好=totalW
  return raw;
}

export async function renderBudgetPdfBytes(
  input: BudgetPdfInput,
  opts: RenderBudgetPdfOpts
): Promise<Uint8Array> {
  const budget = buildBudgetSummary(input.budgetTier, input.companySize);

  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);

  const fontBytes = await loadFontBytes("public/fonts/NotoSansSC-Regular.ttf");
  const font = await doc.embedFont(fontBytes, { subset: true });
  const fontBold = font; // 同字体伪粗体

  const margin = 48;
  const ctx: Ctx = {
    doc,
    font,
    fontBold,
    page: doc.addPage([A4_W, A4_H]),
    x: margin,
    y: A4_H - margin,
    w: A4_W - margin * 2,
    margin,
  };

  const nowText = new Date().toLocaleString("zh-CN", { hour12: false });

  const sections: BudgetPdfSection[] =
    opts.sections && opts.sections.length
      ? opts.sections
      : ["header", "overall", "compare", "table", "supplement", "remarks"];

  const renderHeader = () => {
    h1(ctx, "企业健身房预算方案（设备报价映射）");

    // 版本信息：放在正文区右侧，绝不越界
    const v = `${opts.pdfVersion} | ${new Date().toISOString()}`;
    const vw = textWidth(font, v, 8);
    ctx.page.drawText(v, {
      x: ctx.x + ctx.w - vw,
      y: ctx.y + 6,
      size: 8,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });

    p(ctx, `Plan ID：${input.planId}`, 10, rgb(0.2, 0.2, 0.2));
    p(ctx, `企业名称：${input.companyName}`, 10, rgb(0.2, 0.2, 0.2));
    p(ctx, `企业规模：${input.companySize} 人`, 10, rgb(0.2, 0.2, 0.2));
    p(
      ctx,
      `预算等级：${
        input.budgetTier === "low" ? "低" : input.budgetTier === "mid" ? "中" : "高"
      }`,
      10,
      rgb(0.2, 0.2, 0.2)
    );

    const r = clamp01(input.participationRate);
    if (r != null) p(ctx, `参与率：${Math.round(r * 100)}%`, 10, rgb(0.2, 0.2, 0.2));
    else p(ctx, "参与率：（未填写）", 10, rgb(0.2, 0.2, 0.2));

    hr(ctx);
  };

  const renderOverall = () => {
    h2(ctx, "整体预算区间（含基础器材+配套，含税含安装）");
    const a = budget.overallTotal;
    const b = budget.estimatedBySubtotals;
    const reserveMin = Math.max(0, a.min - b.min);
    const reserveMax = Math.max(0, a.max - b.max);

    p(ctx, `表内整体总计区间：${formatRange(a)}`);
    p(ctx, `按分项小计加总估算：${formatRange(b)}`);
    p(ctx, `预留（税/安装/运输/配套/施工等经验项）：${formatRange({ min: reserveMin, max: reserveMax })}`);
    hr(ctx);
  };

  const renderCompare = () => {
    h2(ctx, "预算对比（低 / 中 / 高）");

    const bLow = buildBudgetSummary("low" as BudgetTier, input.companySize);
    const bMid = buildBudgetSummary("mid" as BudgetTier, input.companySize);
    const bHigh = buildBudgetSummary("high" as BudgetTier, input.companySize);

    const widths = normalizeColWidths(ctx.w, [0.20, 0.40, 0.40]);
    const cols: Col[] = [
      { title: "档位", w: widths[0], align: "left" },
      { title: "整体总计区间", w: widths[1], align: "center" },
      { title: "分项加总估算", w: widths[2], align: "center" },
    ];

    tableHeader(ctx, cols);

    const row = (label: string, b: any, isCurrent: boolean) => {
      tableRow(
        ctx,
        cols,
        [label, formatRangeSmart(b.overallTotal, 18), formatRangeSmart(b.estimatedBySubtotals, 18)],
        isCurrent ? { shade: true, strongCols: [0, 1, 2] } : undefined
      );
    };

    row("低", bLow, input.budgetTier === "low");
    row("中", bMid, input.budgetTier === "mid");
    row("高", bHigh, input.budgetTier === "high");

    hr(ctx);
  };

  const renderTable = () => {
    h2(ctx, "分品类预算明细（4 列版）");

    const widths = normalizeColWidths(ctx.w, [0.34, 0.22, 0.18, 0.26]);
    const cols: Col[] = [
      { title: "设备分类", w: widths[0], align: "left" },
      { title: "单价区间", w: widths[1], align: "center" },
      { title: "常规数量", w: widths[2], align: "center" },
      { title: "单类小计", w: widths[3], align: "right" },
    ];

    tableHeader(ctx, cols);

    for (const line of budget.lines) {
      tableRow(ctx, cols, [
        String(line.categoryName || "-"),
        compactPriceText(line.unitPriceText || "-"),
        String(line.qtyText || "-"),
        formatRangeSmart(line.subtotal, 18),
      ]);
    }

    tableRow(
      ctx,
      cols,
      ["合计（分项加总）", "-", "-", formatRangeSmart(budget.estimatedBySubtotals, 18)],
      { shade: true, strongCols: [0, 3] }
    );

    hr(ctx);
  };

  const renderSupplement = () => {
    h2(ctx, "补充说明（适配规模/配置说明）");

    const extraLines: string[] = [];
    for (const line of budget.lines) {
      const fit = String(line.fit || "").trim();
      const note = String(line.note || "").trim();
      if (fit || note) {
        extraLines.push(
          `${line.categoryName}：${fit ? `适配${fit}` : ""}${fit && note ? "；" : ""}${note || ""}`
        );
      }
    }

    if (!extraLines.length) p(ctx, "（无）");
    else extraLines.forEach((t) => bullet(ctx, t));

    hr(ctx);
  };

  const renderBrands = () => {
    h2(ctx, "品牌建议（可选）");
    bullet(ctx, "有氧设备：舒华/英派斯/乔山（按预算匹配）");
    bullet(ctx, "力量器械：英派斯/国产中端线/必确（按预算匹配）");
    bullet(ctx, "配套与地垫：专业橡胶地垫（按面积核算）");
    hr(ctx);
  };

  const renderRemarks = () => {
    h2(ctx, "其他备注");
    budget.notes.forEach((t: string) => bullet(ctx, t));

    const r = clamp01(input.participationRate);
    if (r != null) {
      const est = Math.round(Number(input.companySize) * r);
      const pct = Math.round(r * 100);
      bullet(
        ctx,
        `参与率说明：参与率 = 在企业总人数里，预计“经常使用健身房”的那一部分比例。例如：${input.companySize} 人 × ${pct}% ≈ ${est} 人会较频繁使用。`
      );
    } else {
      bullet(ctx, "参与率说明：参与率 = 在企业总人数里，预计“经常使用健身房”的那一部分比例（未填写则按默认经验假设）。");
    }

    if (Number.isFinite(input.spaceSqm as any) && (input.spaceSqm as number) > 0) {
      bullet(ctx, `面积输入：约 ${input.spaceSqm} ㎡（用于辅助判断数量上限与动线余量）。`);
    }
    if (input.goal && input.goal !== "general") {
      bullet(
        ctx,
        `训练目标偏好：${
          input.goal === "fatloss" ? "减脂/心肺" : input.goal === "strength" ? "力量/增肌" : "康复/拉伸"
        }（用于解释配置倾向）。`
      );
    }
    if (input.preferSmart) bullet(ctx, "偏好：智能设备（可能增加预算但提升体验与可视化管理）。");
    if (input.preferQuiet) bullet(ctx, "偏好：低噪/减震（建议地垫加厚、选择低噪设备）。");

    // footer（保证在页内）
    ensureSpace(ctx, 18);
    ctx.page.drawText(`导出时间：${nowText}`, {
      x: ctx.x,
      y: ctx.margin - 18,
      size: 9,
      font: ctx.font,
      color: rgb(0.45, 0.45, 0.45),
    });
  };

  for (const sec of sections) {
    if (sec === "header") renderHeader();
    else if (sec === "overall") renderOverall();
    else if (sec === "compare") renderCompare();
    else if (sec === "table") renderTable();
    else if (sec === "brands") renderBrands();
    else if (sec === "supplement") renderSupplement();
    else if (sec === "remarks") renderRemarks();
  }

  return await doc.save();
}
