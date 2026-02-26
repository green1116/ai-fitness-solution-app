// lib/pdf/budget.ts
import fs from "fs/promises";
import path from "path";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, PDFFont, PDFPage, rgb } from "pdf-lib";

export type BudgetPdfSection =
  | "header"
  | "overall"
  | "compare" // alias
  | "budgetCompare"
  | "table"
  | "brands"
  | "supplement"
  | "remarks"
  | "footer";

export type BudgetPdfInput = {
  planId: string;
  companyName: string;
  companySize: any; // 你项目里可能是 enum，这里不强绑，避免编译炸
  budgetTier: any;  // low/mid/high
  spaceSqm?: number;
  participationRate?: number; // 0~1 or 0~100
  buildType?: "new_build" | "renovation" | string;
  preferSmart?: boolean;
  preferQuiet?: boolean;
};

export type RenderBudgetPdfOpts = {
  pdfVersion: string;
  sections?: BudgetPdfSection[];
};

/** -------- utils -------- */

function normalizeParticipation(v: any): number {
  if (typeof v !== "number" || !isFinite(v)) return 0.3;
  if (v > 1.01) return Math.max(0, Math.min(1, v / 100));
  return Math.max(0, Math.min(1, v));
}

function fmtPct(v01: number) {
  return `${Math.round(v01 * 100)}%`;
}

function safeText(s: any, fallback = "—") {
  const t = (s ?? "").toString().trim();
  return t ? t : fallback;
}

async function loadFontBytes(rel: string) {
  return fs.readFile(path.join(process.cwd(), rel));
}

/** ✅ alias 兼容：compare vs budgetCompare */
function normalizeBudgetSection(s: any): BudgetPdfSection {
  const k = String(s || "").trim();
  if (!k) return "table";
  if (k === "compare") return "budgetCompare";
  if (k === "budgetCompare") return "budgetCompare";
  return k as BudgetPdfSection;
}

function money(n: number) {
  // 简单格式化：1,234
  const x = Math.round(n);
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

type BudgetRow = {
  category: string;
  item: string;
  qty: number;
  unitPrice: number; // RMB
};

function buildDefaultRows(tier: string): BudgetRow[] {
  const t = (tier || "mid").toLowerCase();

  if (t === "low") {
    return [
      { category: "有氧", item: "跑步机（入门）", qty: 2, unitPrice: 22000 },
      { category: "有氧", item: "动感单车", qty: 4, unitPrice: 5500 },
      { category: "力量", item: "综合训练架/史密斯（基础）", qty: 1, unitPrice: 18000 },
      { category: "力量", item: "哑铃套装（基础）", qty: 1, unitPrice: 12000 },
      { category: "辅助", item: "瑜伽垫/弹力带/泡沫轴", qty: 1, unitPrice: 3000 },
      { category: "配套", item: "地胶/防震/安装辅材", qty: 1, unitPrice: 12000 },
    ];
  }

  if (t === "high") {
    return [
      { category: "有氧", item: "跑步机（商用）", qty: 6, unitPrice: 38000 },
      { category: "有氧", item: "椭圆机（商用）", qty: 4, unitPrice: 32000 },
      { category: "有氧", item: "动感单车（商用）", qty: 14, unitPrice: 8500 },
      { category: "力量", item: "固定力量器械（全套）", qty: 12, unitPrice: 15000 },
      { category: "力量", item: "深蹲架", qty: 3, unitPrice: 18000 },
      { category: "力量", item: "卧推架", qty: 3, unitPrice: 16000 },
      { category: "力量", item: "哑铃套装（2套）", qty: 2, unitPrice: 24000 },
      { category: "功能", item: "壶铃/战绳/小工具组合", qty: 1, unitPrice: 15000 },
      { category: "配套", item: "地胶/防震/通风优化/安装", qty: 1, unitPrice: 60000 },
    ];
  }

  // mid 默认
  return [
    { category: "有氧", item: "跑步机（商用入门）", qty: 3, unitPrice: 30000 },
    { category: "有氧", item: "椭圆机（入门）", qty: 2, unitPrice: 22000 },
    { category: "有氧", item: "动感单车", qty: 8, unitPrice: 6500 },
    { category: "力量", item: "固定力量器械（基础套装）", qty: 8, unitPrice: 12000 },
    { category: "力量", item: "深蹲架", qty: 1, unitPrice: 16000 },
    { category: "力量", item: "卧推架", qty: 1, unitPrice: 14000 },
    { category: "力量", item: "哑铃套装（进阶）", qty: 1, unitPrice: 22000 },
    { category: "辅助", item: "瑜伽垫/弹力带/泡沫轴", qty: 1, unitPrice: 5000 },
    { category: "配套", item: "地胶/防震/安装辅材", qty: 1, unitPrice: 30000 },
  ];
}

/** -------- layout helpers -------- */

function drawTextBoldLike(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  size: number,
  font: PDFFont,
  color = rgb(0, 0, 0)
) {
  page.drawText(text, { x, y, size, font, color });
  page.drawText(text, { x: x + 0.35, y, size, font, color });
}

function drawHr(page: PDFPage, x: number, y: number, w: number) {
  page.drawLine({
    start: { x, y },
    end: { x: x + w, y },
    thickness: 1,
    color: rgb(0.85, 0.85, 0.85),
  });
}

/** 简单自动换行：按 maxWidth 拆字（中英文都能用） */
function wrapText(font: PDFFont, text: string, size: number, maxWidth: number) {
  const s = String(text || "");
  const lines: string[] = [];
  let cur = "";

  for (const ch of s) {
    const next = cur + ch;
    const w = font.widthOfTextAtSize(next, size);
    if (w > maxWidth && cur) {
      lines.push(cur);
      cur = ch;
    } else {
      cur = next;
    }
  }
  if (cur) lines.push(cur);
  return lines.length ? lines : [""];
}

/** -------- renderers -------- */

type Ctx = {
  doc: PDFDocument;
  font: PDFFont;
  fontBold: PDFFont;
  pageW: number;
  pageH: number;
  input: BudgetPdfInput;
  pdfVersion: string;
};

function addPage(ctx: Ctx) {
  return ctx.doc.addPage([ctx.pageW, ctx.pageH]);
}

function renderHeader(ctx: Ctx) {
  const page = addPage(ctx);
  const m = 48;
  let y = ctx.pageH - m;

  drawTextBoldLike(page, "预算清单（投标/评审版）", m, y - 10, 18, ctx.fontBold, rgb(0.1, 0.1, 0.1));
  y -= 34;

  page.drawText(`企业：${safeText(ctx.input.companyName)}`, {
    x: m,
    y,
    size: 11,
    font: ctx.font,
    color: rgb(0.2, 0.2, 0.2),
  });
  y -= 16;

  const p = normalizeParticipation(ctx.input.participationRate);
  page.drawText(
    `规模：${safeText(ctx.input.companySize)} ｜ 面积：${safeText(ctx.input.spaceSqm, "—")}㎡ ｜ 参与率：${fmtPct(p)} ｜ 档位：${safeText(ctx.input.budgetTier)}`,
    {
      x: m,
      y,
      size: 10,
      font: ctx.font,
      color: rgb(0.3, 0.3, 0.3),
    }
  );
  y -= 14;

  page.drawText(`PDF_VERSION：${ctx.pdfVersion}`, {
    x: m,
    y: 28,
    size: 9,
    font: ctx.font,
    color: rgb(0.45, 0.45, 0.45),
  });

  return page;
}

function renderOverall(ctx: Ctx, rows: BudgetRow[]) {
  const page = addPage(ctx);
  const m = 48;
  let y = ctx.pageH - m;

  drawTextBoldLike(page, "总体预算概览", m, y - 10, 16, ctx.fontBold, rgb(0.1, 0.1, 0.1));
  y -= 34;

  const total = rows.reduce((sum, r) => sum + r.qty * r.unitPrice, 0);
  const equip = Math.round(total * 0.88);
  const install = total - equip;

  const lines = [
    `设备合计（估算）：¥ ${money(equip)}`,
    `施工/安装/辅材（估算）：¥ ${money(install)}`,
    `预算总计（估算）：¥ ${money(total)}`,
    `备注：本预算为区间估算，最终以清单确认与合同报价为准。`,
  ];

  for (const t of lines) {
    page.drawText("• " + t, {
      x: m,
      y,
      size: 11,
      font: ctx.font,
      color: rgb(0.18, 0.18, 0.18),
      maxWidth: ctx.pageW - m * 2,
      lineHeight: 14,
    });
    y -= 22;
  }

  page.drawText(`Plan ID：${ctx.input.planId}`, {
    x: m,
    y: 48,
    size: 9,
    font: ctx.font,
    color: rgb(0.45, 0.45, 0.45),
  });

  return page;
}

function renderBudgetCompare(ctx: Ctx) {
  const page = addPage(ctx);
  const m = 48;
  let y = ctx.pageH - m;

  drawTextBoldLike(page, "档位对比（预算口径）", m, y - 10, 16, ctx.fontBold, rgb(0.1, 0.1, 0.1));
  y -= 34;

  const items = [
    "Lite：基础覆盖，适合快速落地与成本可控场景",
    "Standard：容量与体验平衡（推荐），适合多数企业园区/总部",
    "Pro：高参与率与高峰值组织，强调可运营与冗余容量",
  ];

  for (const t of items) {
    page.drawText("• " + t, {
      x: m,
      y,
      size: 11,
      font: ctx.font,
      color: rgb(0.18, 0.18, 0.18),
      maxWidth: ctx.pageW - m * 2,
      lineHeight: 14,
    });
    y -= 22;
  }

  return page;
}

/**
 * ✅ 核心：恢复“表格清单”（4列 A4 不乱）
 * 列：品类 | 项目 | 数量 | 小计（元）
 */
function renderBudgetTable(ctx: Ctx, rows: BudgetRow[]) {
  const page = addPage(ctx);
  const m = 48;
  const tableW = ctx.pageW - m * 2;

  // 4 列宽（适配 A4）
  const col1 = 70;  // 品类
  const col2 = tableW - col1 - 60 - 90; // 项目（自适应）
  const col3 = 60;  // 数量
  const col4 = 90;  // 小计

  let y = ctx.pageH - m;

  drawTextBoldLike(page, "分品类预算明细（表格清单）", m, y - 10, 16, ctx.fontBold, rgb(0.1, 0.1, 0.1));
  y -= 30;

  // header row
  const headerY = y;
  page.drawRectangle({
    x: m,
    y: headerY - 18,
    width: tableW,
    height: 22,
    color: rgb(0.96, 0.96, 0.96),
    borderColor: rgb(0.85, 0.85, 0.85),
    borderWidth: 1,
  });

  const hSize = 10;
  page.drawText("品类", { x: m + 6, y: headerY - 12, size: hSize, font: ctx.fontBold, color: rgb(0.2, 0.2, 0.2) });
  page.drawText("项目", { x: m + col1 + 6, y: headerY - 12, size: hSize, font: ctx.fontBold, color: rgb(0.2, 0.2, 0.2) });
  page.drawText("数量", { x: m + col1 + col2 + 6, y: headerY - 12, size: hSize, font: ctx.fontBold, color: rgb(0.2, 0.2, 0.2) });
  page.drawText("小计（元）", { x: m + col1 + col2 + col3 + 6, y: headerY - 12, size: hSize, font: ctx.fontBold, color: rgb(0.2, 0.2, 0.2) });

  y -= 30;

  const cellSize = 10;
  const rowGap = 6;

  let grand = 0;

  for (const r of rows) {
    const subtotal = r.qty * r.unitPrice;
    grand += subtotal;

    // 项目列可能需要换行
    const itemLines = wrapText(ctx.font, r.item, cellSize, col2 - 10);
    const rowH = Math.max(18, itemLines.length * 12 + 6);

    // 分页（当前仅单页；后续你要多页我再给你跨页版）
    if (y - rowH < 90) break;

    // row border
    page.drawRectangle({
      x: m,
      y: y - rowH,
      width: tableW,
      height: rowH,
      borderColor: rgb(0.88, 0.88, 0.88),
      borderWidth: 1,
      color: rgb(1, 1, 1),
    });

    // vertical lines
    page.drawLine({ start: { x: m + col1, y: y }, end: { x: m + col1, y: y - rowH }, thickness: 1, color: rgb(0.9, 0.9, 0.9) });
    page.drawLine({ start: { x: m + col1 + col2, y: y }, end: { x: m + col1 + col2, y: y - rowH }, thickness: 1, color: rgb(0.9, 0.9, 0.9) });
    page.drawLine({ start: { x: m + col1 + col2 + col3, y: y }, end: { x: m + col1 + col2 + col3, y: y - rowH }, thickness: 1, color: rgb(0.9, 0.9, 0.9) });

    // cells
    page.drawText(safeText(r.category), { x: m + 6, y: y - 14, size: cellSize, font: ctx.font, color: rgb(0.15, 0.15, 0.15) });

    let iy = y - 14;
    for (const ln of itemLines) {
      page.drawText(ln, { x: m + col1 + 6, y: iy, size: cellSize, font: ctx.font, color: rgb(0.15, 0.15, 0.15) });
      iy -= 12;
    }

    page.drawText(String(r.qty), { x: m + col1 + col2 + 6, y: y - 14, size: cellSize, font: ctx.font, color: rgb(0.15, 0.15, 0.15) });

    page.drawText(money(subtotal), { x: m + col1 + col2 + col3 + 6, y: y - 14, size: cellSize, font: ctx.font, color: rgb(0.15, 0.15, 0.15) });

    y -= rowH + rowGap;
  }

  y -= 4;
  drawHr(page, m, y, tableW);
  y -= 18;

  drawTextBoldLike(page, `预算总计（估算）：¥ ${money(grand)}`, m, y, 12, ctx.fontBold, rgb(0.1, 0.1, 0.1));

  page.drawText(`Plan ID：${ctx.input.planId}`, {
    x: m,
    y: 48,
    size: 9,
    font: ctx.font,
    color: rgb(0.45, 0.45, 0.45),
  });

  return page;
}

function renderBrands(ctx: Ctx) {
  const page = addPage(ctx);
  const m = 48;
  let y = ctx.pageH - m;

  drawTextBoldLike(page, "品牌建议", m, y - 10, 16, ctx.fontBold, rgb(0.1, 0.1, 0.1));
  y -= 34;

  const items = [
    "建议提供 ≥2 家品牌/型号可比报价，满足评审可审计性。",
    "关键器械建议优先选择商用口碑型号，确保耐用与维保响应。",
  ];

  for (const t of items) {
    page.drawText("• " + t, {
      x: m,
      y,
      size: 11,
      font: ctx.font,
      color: rgb(0.18, 0.18, 0.18),
      maxWidth: ctx.pageW - m * 2,
      lineHeight: 14,
    });
    y -= 22;
  }

  return page;
}

function renderSupplement(ctx: Ctx) {
  const page = addPage(ctx);
  const m = 48;
  let y = ctx.pageH - m;

  drawTextBoldLike(page, "补充说明", m, y - 10, 16, ctx.fontBold, rgb(0.1, 0.1, 0.1));
  y -= 34;

  const items = [
    "费用口径包含：设备、基础安装、辅材；不含土建大改造（如需另行估算）。",
    "若存在高层搬运/特殊加固/夜间施工等情况，需另行计费。",
  ];

  for (const t of items) {
    page.drawText("• " + t, {
      x: m,
      y,
      size: 11,
      font: ctx.font,
      color: rgb(0.18, 0.18, 0.18),
      maxWidth: ctx.pageW - m * 2,
      lineHeight: 14,
    });
    y -= 22;
  }

  return page;
}

function renderRemarks(ctx: Ctx) {
  const page = addPage(ctx);
  const m = 48;
  let y = ctx.pageH - m;

  drawTextBoldLike(page, "备注与风险提示", m, y - 10, 16, ctx.fontBold, rgb(0.1, 0.1, 0.1));
  y -= 34;

  const items = [
    "本预算为估算值，最终以清单确认、现场复核与合同报价为准。",
    "建议附带：设备清单（含型号/数量/单价/小计）、维保条款、交付周期与验收标准。",
  ];

  for (const t of items) {
    page.drawText("• " + t, {
      x: m,
      y,
      size: 11,
      font: ctx.font,
      color: rgb(0.18, 0.18, 0.18),
      maxWidth: ctx.pageW - m * 2,
      lineHeight: 14,
    });
    y -= 22;
  }

  return page;
}

/** ---------------- main entry ---------------- */

export async function renderBudgetPdfBuffer(input: BudgetPdfInput, opts: RenderBudgetPdfOpts): Promise<Uint8Array> {
  const pdfVersion = opts?.pdfVersion || "BUDGET_ENGINE_V20260225_TABLE_RESTORE_01";

  // ✅ sections：优先使用传入（API / route 会传），否则使用默认
  const rawSections =
    (opts?.sections && opts.sections.length
      ? opts.sections
      : ([
          "header",
          "overall",
          "budgetCompare",
          "table",
          "brands",
          "supplement",
          "remarks",
        ] as BudgetPdfSection[]));

  const sections = rawSections.map(normalizeBudgetSection);

  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);

  const fontBytes = await loadFontBytes("public/fonts/NotoSansSC-Regular.ttf");
  const font = await doc.embedFont(fontBytes, { subset: true });
  const fontBold = font;

  const pageW = 595.28;
  const pageH = 841.89;

  const ctx: Ctx = {
    doc,
    font,
    fontBold,
    pageW,
    pageH,
    input: {
      ...input,
      companyName: safeText(input.companyName, "企业客户"),
    },
    pdfVersion,
  };

  // ✅ 用 tier 生成一套“表格清单”行（你后续可替换成真实 buildBudgetSummary）
  const rows = buildDefaultRows(String(input.budgetTier || "mid"));

  for (const sec of sections) {
    switch (sec) {
      case "header":
        renderHeader(ctx);
        break;
      case "overall":
        renderOverall(ctx, rows);
        break;
      case "budgetCompare":
        renderBudgetCompare(ctx);
        break;
      case "table":
        // ✅ 改2：table 强制输出表格清单（4列）
        renderBudgetTable(ctx, rows);
        break;
      case "brands":
        renderBrands(ctx);
        break;
      case "supplement":
        renderSupplement(ctx);
        break;
      case "remarks":
        renderRemarks(ctx);
        break;
      default:
        // 忽略未知 section，避免投标输出失败
        break;
    }
  }

  return await doc.save();
}