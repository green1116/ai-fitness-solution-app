// lib/pdf/budgetRender.ts
import fs from "fs/promises";
import path from "path";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, PDFFont, PDFPage, rgb, StandardFonts } from "pdf-lib";

import { getBudgetSummary } from "@/lib/services/budgetService";
import type { BudgetSummary } from "@/lib/pdf/contracts/budgetSummary";
import { wrapTextCN } from "@/lib/pdf/engine/text";
import { THEMES, drawHeader as drawThemeHeader, drawFooter as drawThemeFooter } from "@/lib/pdf/theme";
import { PAGE_BOTTOM_SAFE, GAP_SM, GAP_MD, GAP_LG } from "@/lib/pdf/brand";
import { TOKENS } from "@/lib/pdf/tokens";

export type BudgetPdfInput = {
  planId: string;
  companyName: string;
  companySize: number;
  budgetTier: "low" | "mid" | "high";
};

export type BudgetLevel = "saas" | "enterprise" | "government";

function normalizeLevel(v?: string): BudgetLevel {
  const s = String(v || "").toLowerCase();
  if (s === "brand") return "saas"; // legacy
  if (s === "saas") return "saas";
  if (s === "enterprise") return "enterprise";
  if (s === "government") return "government";
  return "saas";
}

export type BudgetPdfSection =
  | "header"
  | "overall"
  | "compare"
  | "table_lines"
  | "table_items"
  | "remarks"
  // ✅ enterprise terms
  | "pricing_terms"
  | "delivery_terms"
  | "payment_terms"
  | "after_sales"
  | "sign_seal";

export type RenderBudgetPdfOpts = {
  pdfVersion?: string;
  engineFP?: string;
  sections?: BudgetPdfSection[];
  reqsig?: string;
  dateTokyoYmd?: string;

  level?: BudgetLevel;

  docSeq?: string;

  debugRows?: boolean;

  // ✅ NEW: theme routing from API ("brand" | "tender")
  theme?: "brand" | "tender";
};

export const BUDGET_PDF_VERSION = "BUDGET_PDF_V_GOV_BRAND_DUAL_20260228";
export const BUDGET_ENGINE_FP = "BUDGET_ENGINE_FP_GOV_BRAND_DUAL_20260228";

if (process.env.NODE_ENV !== "production") {
  console.log("[BUDGET_RENDER]", BUDGET_ENGINE_FP, BUDGET_PDF_VERSION);
}

// -------------------------------
// Utilities
// -------------------------------
function ymdTokyoCompact() {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = fmt.formatToParts(new Date());
  const y = parts.find((p) => p.type === "year")?.value || "0000";
  const m = parts.find((p) => p.type === "month")?.value || "00";
  const d = parts.find((p) => p.type === "day")?.value || "00";
  return `${y}${m}${d}`;
}

function ymdTokyoSlash() {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(new Date()).replace(/-/g, "/");
}

function asciiSafe(s: string) {
  return (s || "file")
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/[\\/:*?"<>|]/g, "-")
    .trim()
    .slice(0, 120);
}

function fmtMoney(n: number) {
  const x = Math.round(Number(n || 0));
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

type MoneyRange = { min: number; max: number };

type StrictItem = {
  category: string;
  categoryName?: string;
  name: string;

  qtyMin: number;
  qtyMax: number;

  priceMin: number;
  priceMax: number;

  subtotalMin: number;
  subtotalMax: number;

  note?: string;
};

type StrictSummary = {
  docNo: string;
  planId: string;
  companyName: string;
  companySize: number;
  tier: "low" | "mid" | "high";

  items: StrictItem[];
  total: MoneyRange;
};

function pickRangeFromText(text: string): MoneyRange | null {
  const s = (text || "").replace(/[,，]/g, "");
  const m = s.match(/(\d+)\s*-\s*(\d+)/);
  if (!m) return null;
  return { min: Number(m[1]), max: Number(m[2]) };
}

function pickMoneyRangeFromText(text: string): MoneyRange | null {
  const s = (text || "")
    .replace(/[¥￥,，]/g, "")
    .replace(/\s+/g, " ");
  const m = s.match(/(\d+)\s*-\s*(\d+)/);
  if (!m) return null;
  return { min: Number(m[1]), max: Number(m[2]) };
}

function splitQtyText(qtyText: string): Array<{ name: string; qty: MoneyRange }> {
  const parts = (qtyText || "")
    .split(/[;；]/g)
    .map((x) => x.trim())
    .filter(Boolean);

  const out: Array<{ name: string; qty: MoneyRange }> = [];
  for (const p of parts) {
    const r = pickRangeFromText(p);
    if (!r) continue;

    let name = p.replace(/(\d+)\s*-\s*(\d+).*/g, "").trim();
    name = name.replace(/[（(].*?[)）]/g, "").trim();
    if (!name) continue;

    out.push({ name, qty: r });
  }
  return out;
}

function toStrictSummaryFromBudgetSummary(
  s: BudgetSummary,
  ctx: { planId: string; companyName: string; companySize: number; tier: "low" | "mid" | "high" },
  docNo: string
): StrictSummary {
  const lines: any[] = (s as any)?.lines || [];
  const items: StrictItem[] = [];

  for (const ln of lines) {
    const price = pickMoneyRangeFromText(ln.unitPriceText || "");
    const splits = splitQtyText(ln.qtyText || "");
    if (!price) continue;

    if (splits.length > 0) {
      for (const sp of splits) {
        items.push({
          category: String(ln.category || ""),
          categoryName: ln.categoryName,
          name: sp.name,
          qtyMin: sp.qty.min,
          qtyMax: sp.qty.max,
          priceMin: price.min,
          priceMax: price.max,
          subtotalMin: sp.qty.min * price.min,
          subtotalMax: sp.qty.max * price.max,
          note: ln.note,
        });
      }
      continue;
    }

    const q = pickRangeFromText(ln.qtyText || "");
    if (!q) continue;

    const mergedName =
      ln.categoryName?.includes("固定") ? "固定器械合计（合并项）" : "合并项（未拆分）";

    items.push({
      category: String(ln.category || ""),
      categoryName: ln.categoryName,
      name: mergedName,
      qtyMin: q.min,
      qtyMax: q.max,
      priceMin: price.min,
      priceMax: price.max,
      subtotalMin: q.min * price.min,
      subtotalMax: q.max * price.max,
      note: ln.note,
    });
  }

  const total = items.reduce(
    (acc, it) => ({ min: acc.min + it.subtotalMin, max: acc.max + it.subtotalMax }),
    { min: 0, max: 0 }
  );

  return {
    docNo,
    planId: ctx.planId,
    companyName: ctx.companyName,
    companySize: ctx.companySize,
    tier: ctx.tier,
    items,
    total,
  };
}

function assertStrict(strict: StrictSummary) {
  if (!strict.items || strict.items.length === 0) {
    throw new Error("GOV_BUDGET_NO_STRICT_ITEMS: qty/unitPrice parse failed (items=0)");
  }
  const sum = strict.items.reduce(
    (acc, it) => ({ min: acc.min + it.subtotalMin, max: acc.max + it.subtotalMax }),
    { min: 0, max: 0 }
  );
  if (sum.min !== strict.total.min || sum.max !== strict.total.max) {
    throw new Error(
      `GOV_BUDGET_TOTAL_MISMATCH: itemsSum=${sum.min}-${sum.max} total=${strict.total.min}-${strict.total.max}`
    );
  }
}

// -------------------------------
// Drawing primitives
// -------------------------------
type DrawCtx = {
  doc: PDFDocument;
  font: PDFFont;
  fontBold: PDFFont;
  fontMono: PDFFont;
};

function drawTextF(page: PDFPage, font: PDFFont, text: string, x: number, y: number, size: number, color = rgb(0, 0, 0)) {
  page.drawText(text || "", { x, y, size, font, color });
}

function drawLine(page: PDFPage, x1: number, y1: number, x2: number, y2: number, w = 1, color = rgb(0.85, 0.85, 0.85)) {
  page.drawLine({ start: { x: x1, y: y1 }, end: { x: x2, y: y2 }, thickness: w, color });
}

function drawBox(page: PDFPage, x: number, y: number, w: number, h: number, border = rgb(0.85, 0.85, 0.85)) {
  page.drawRectangle({ x, y, width: w, height: h, borderColor: border, borderWidth: 1, color: rgb(1, 1, 1) });
}

function ellipsisToWidth(text: string, font: PDFFont, size: number, maxWidth: number) {
  const s = (text || "").trim();
  if (!s) return "";
  if (font.widthOfTextAtSize(s, size) <= maxWidth) return s;

  const ell = "…";
  const ellW = font.widthOfTextAtSize(ell, size);
  let out = "";
  for (const ch of s) {
    const w = font.widthOfTextAtSize(out + ch, size);
    if (w + ellW > maxWidth) break;
    out += ch;
  }
  return out ? out + ell : ell;
}

function drawVLines(page: PDFPage, xs: number[], y: number, h: number, w = 1, color = rgb(0.85, 0.85, 0.85)) {
  for (const x of xs) {
    drawLine(page, x, y, x, y + h, w, color);
  }
}

function drawLegacyFooter(
  page: PDFPage,
  ctx: DrawCtx,
  leftText: string,
  rightText?: string
) {
  const y = 24;
  const m = 48;
  const W = page.getWidth();

  if (leftText) {
    page.drawText(leftText, {
      x: m,
      y,
      size: 8,
      font: ctx.font,
      color: rgb(0.35, 0.35, 0.35),
    });
  }

  if (rightText) {
    const width = ctx.fontMono.widthOfTextAtSize(rightText, 8);
    page.drawText(rightText, {
      x: W - m - width,
      y,
      size: 8,
      font: ctx.fontMono,
      color: rgb(0.35, 0.35, 0.35),
    });
  }
}

// -------------------------------
// Main entry
// -------------------------------
export async function renderBudgetPdfBuffer(input: BudgetPdfInput, opts: RenderBudgetPdfOpts = {}) {
  const level: BudgetLevel = normalizeLevel(opts.level);
  const themeName: "brand" | "tender" = opts.theme === "tender" ? "tender" : "brand";

  if (process.env.NODE_ENV !== "production") {
    console.log("[BUDGET_RENDER]", "level=", level, "theme=", themeName, "planId=", input.planId);
  }

  const planId = input.planId;
  const companyName = input.companyName || "企业";
  const companySize = Number(input.companySize || 0);

  const summary = await getBudgetSummary({
    planId,
    companyName,
    companySize,
    budgetTier: input.budgetTier,
  });

  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);

  const fontPath = path.join(process.cwd(), "public", "fonts", "NotoSansSC-Regular.ttf");
  const fontBytes = await fs.readFile(fontPath);

  const font = await doc.embedFont(fontBytes, { subset: true });
  const fontBold = font;
  const fontMono = await doc.embedFont(StandardFonts.Courier);

  // SAAS / ENTERPRISE
  if (level !== "government") {
    await renderBrand2Pages(doc, { doc, font, fontBold, fontMono }, input, summary, opts);

    if (level === "enterprise") {
      await renderEnterpriseTermsPlaceholder(doc, { doc, font, fontBold, fontMono }, input, opts);

      // ✅ restamp with correct totals + correct theme
      const theme = THEMES[themeName];
      const dateYmd = opts.dateTokyoYmd || ymdTokyoSlash();
      const reqsig = opts.reqsig ? String(opts.reqsig) : "";
      const pdfVersion = opts.pdfVersion || BUDGET_PDF_VERSION;

      restampThemeFooters(doc, theme, font, {
        planId: input.planId,
        dateYmd,
        sig: reqsig || undefined,
        fp: pdfVersion,
      });
    }

    return Buffer.from(await doc.save());
  }

  // GOVERNMENT
  const ymd = ymdTokyoCompact();
  const seq = (opts.docSeq || "01").padStart(2, "0");
  const docNo = `AFS-GOV-${ymd}-${asciiSafe(planId).toUpperCase()}-${seq}`;

  const strict = toStrictSummaryFromBudgetSummary(
    summary as any,
    { planId, companyName, companySize, tier: input.budgetTier },
    docNo
  );
  assertStrict(strict);

  if (process.env.NODE_ENV !== "production" && opts.debugRows) {
    const times = 8;
    const base = strict.items.slice();
    strict.items = Array.from({ length: times }).flatMap(() => base);
    strict.total = strict.items.reduce(
      (acc, it) => ({ min: acc.min + it.subtotalMin, max: acc.max + it.subtotalMax }),
      { min: 0, max: 0 }
    );
  }

  await renderGovernment5Pages(doc, { doc, font, fontBold, fontMono }, strict, opts);
  return Buffer.from(await doc.save());
}

// -------------------------------
// BRAND/ENTERPRISE: 2 base pages (theme aware)
// -------------------------------
async function renderBrand2Pages(
  doc: PDFDocument,
  ctx: DrawCtx,
  input: BudgetPdfInput,
  summary: BudgetSummary,
  opts: RenderBudgetPdfOpts
) {
  const A4: [number, number] = [595.28, 841.89];

  // ✅ use theme from opts (enterprise tender / saas brand)
  const themeName: "brand" | "tender" = opts.theme === "tender" ? "tender" : "brand";
  const theme = THEMES[themeName];
  const M = theme.margin;

  const pdfVersion = opts.pdfVersion || BUDGET_PDF_VERSION;
  const reqsig = opts.reqsig ? String(opts.reqsig) : "";
  const dateYmd = opts.dateTokyoYmd || ymdTokyoSlash();

  const strict = toStrictSummaryFromBudgetSummary(
    summary as any,
    {
      planId: input.planId,
      companyName: input.companyName,
      companySize: input.companySize,
      tier: input.budgetTier,
    },
    `AFS-${themeName.toUpperCase()}-${ymdTokyoCompact()}-${asciiSafe(input.planId).toUpperCase()}`
  );

  // Page 1
  {
    const p = doc.addPage(A4);
    const W = p.getWidth();

    let y = drawThemeHeader(p, theme, ctx.font, "企业健身空间设备采购预算测算报告", {
      companyName: input.companyName || "示例企业",
      companySize: input.companySize,
      tierLabel: String(input.budgetTier).toUpperCase(),
      planId: input.planId,
      dateYmd,
    });

    y = y + 6;
    drawTextF(
      p,
      ctx.font,
      "（企业级测算版本 / 用于方案评审与预算沟通）",
      M.l,
      y,
      theme.fontSizes.h2,
      theme.colors.sub
    );
    y -= GAP_MD;

    const recLine = `建议：按 ${String(input.budgetTier).toUpperCase()} 档位配置，可覆盖常规高频使用与基础扩展需求。`;
    const recLines = wrapTextCN(`• ${recLine}`, {
      font: ctx.font,
      fontSize: 10,
      maxWidth: W - M.l - M.r,
      maxLines: 2,
    });
    y -= 4;
    for (const line of recLines) {
      drawTextF(p, ctx.font, line, M.l, y, 10);
      y -= 14;
    }

    const totalMin = strict.total.min;
    const totalMax = strict.total.max;

    y -= GAP_SM;
    drawBox(p, M.l, y - 6, W - M.l - M.r, 92, rgb(0.82, 0.82, 0.82));
    drawTextF(p, ctx.fontBold, "建议预算区间（CNY）", M.l + 14, y + 60, 12);
    drawTextF(p, ctx.fontBold, `${fmtMoney(totalMin)}  -  ${fmtMoney(totalMax)}`, M.l + 14, y + 22, 22);

    const vx = M.l + (W - M.l - M.r) * 0.62;
    let vy = y + 58;
    const values = [
      "商用标准配置，适配高使用密度",
      "分项闭环核算，便于内部审批/对外沟通",
      "可选项可拆分（地板/橡胶地垫等）",
    ];
    for (const t of values) {
      const lines = wrapTextCN(`✓ ${t}`, {
        font: ctx.font,
        fontSize: 10,
        maxWidth: W - M.r - vx,
        maxLines: 2,
      });
      for (const line of lines) {
        drawTextF(p, ctx.font, line, vx, vy, 10, rgb(0.2, 0.2, 0.2));
        vy -= 14;
      }
      vy -= 4;
    }

    y -= 120;

    const map = new Map<string, MoneyRange>();
    for (const it of strict.items) {
      const key = it.categoryName || it.category || "其他";
      const cur = map.get(key) || { min: 0, max: 0 };
      map.set(key, { min: cur.min + it.subtotalMin, max: cur.max + it.subtotalMax });
    }
    const rows = Array.from(map.entries());

    const tableW = W - M.l - M.r;
    const colCat = 210;
    const colMin = 160;
    const colMax = tableW - colCat - colMin;
    const rowH = 26;
    const x0 = M.l;
    const x1 = x0 + colCat;
    const x2 = x0 + colCat + colMin;

    drawTextF(p, ctx.fontBold, "分项预算汇总", M.l, y + 18, 12);
    y -= GAP_SM;

    p.drawRectangle({
      x: x0,
      y,
      width: tableW,
      height: rowH,
      color: TOKENS.colorBrand,
      borderWidth: 0,
    });
    drawVLines(p, [x1, x2], y, rowH);
    drawTextF(p, ctx.fontBold, "类别", x0 + 8, y + 8, 10, rgb(1, 1, 1));
    const minLblW = ctx.fontBold.widthOfTextAtSize("最低估算", 10);
    const maxLblW = ctx.fontBold.widthOfTextAtSize("最高估算", 10);
    drawTextF(p, ctx.fontBold, "最低估算", x2 - 8 - minLblW, y + 8, 10, rgb(1, 1, 1));
    drawTextF(p, ctx.fontBold, "最高估算", x0 + tableW - 8 - maxLblW, y + 8, 10, rgb(1, 1, 1));

    y -= rowH;

    rows.forEach(([k, v], idx) => {
      if (y < PAGE_BOTTOM_SAFE + 125) return;
      const alt = idx % 2 === 1;
      if (alt) {
        p.drawRectangle({
          x: x0,
          y,
          width: tableW,
          height: rowH,
          color: TOKENS.colorBrandLight,
          borderWidth: 0,
        });
      } else {
        drawBox(p, x0, y, tableW, rowH);
      }
      drawVLines(p, [x1, x2], y, rowH);

      drawTextF(p, ctx.font, ellipsisToWidth(k, ctx.font, 10, colCat - 14), x0 + 8, y + 8, 10);

      const minText = fmtMoney(v.min);
      const maxText = fmtMoney(v.max);
      const minW = ctx.font.widthOfTextAtSize(minText, 10);
      const maxW = ctx.font.widthOfTextAtSize(maxText, 10);
      drawTextF(p, ctx.font, minText, x2 - 8 - minW, y + 8, 10);
      drawTextF(p, ctx.font, maxText, x0 + tableW - 8 - maxW, y + 8, 10);

      y -= rowH;
    });

    const scope = [
      "仅含设备采购及基础交付费用；不含装修/强弱电/消防。",
      "运动地板/力量区橡胶地垫可作为可选项单列。",
    ];
    y -= GAP_MD;
    drawTextF(p, ctx.fontBold, "预算口径", M.l, y, 11);
    y -= GAP_MD;
    for (const s of scope) {
      const lines = wrapTextCN(`• ${s}`, { font: ctx.font, fontSize: 10, maxWidth: W - M.l - M.r, maxLines: 2 });
      for (const line of lines) {
        drawTextF(p, ctx.font, line, M.l, y, 10);
        y -= 14;
      }
      y -= 2;
    }

    drawThemeFooter(p, theme, ctx.font, {
      planId: input.planId,
      dateYmd,
      pageNo: 1,
      pageTotal: 2,
      sig: reqsig ? reqsig : undefined,
      fp: pdfVersion,
    });
  }

  // Page 2
  {
    const p = doc.addPage(A4);
    const W = p.getWidth();
    const H = p.getHeight();

    drawTextF(p, ctx.fontBold, "设备采购明细及测算表", M.l, H - 76, 14);
    drawLine(p, M.l, H - 92, W - M.r, H - 92);

    const x0 = M.l;
    const tableW = W - M.l - M.r;

    const cCat = 74;
    const cName = 190;
    const cQty = 78;
    const cPrice = 92;
    const cSub = tableW - (cCat + cName + cQty + cPrice);

    const rowH = 22;
    let y = H - 130;

    p.drawRectangle({
      x: x0,
      y,
      width: tableW,
      height: rowH,
      color: TOKENS.colorBrand,
      borderWidth: 0,
    });
    const xs = [x0 + cCat, x0 + cCat + cName, x0 + cCat + cName + cQty, x0 + cCat + cName + cQty + cPrice];
    drawVLines(p, xs, y, rowH);

    drawTextF(p, ctx.fontBold, "类别", x0 + 6, y + 6, 9, rgb(1, 1, 1));
    drawTextF(p, ctx.fontBold, "设备", x0 + cCat + 6, y + 6, 9, rgb(1, 1, 1));
    const qtyW = ctx.fontBold.widthOfTextAtSize("数量区间", 9);
    const priceW = ctx.fontBold.widthOfTextAtSize("单价区间", 9);
    const subW = ctx.fontBold.widthOfTextAtSize("小计区间", 9);
    drawTextF(
      p,
      ctx.fontBold,
      "数量区间",
      x0 + cCat + cName + cQty - 6 - qtyW,
      y + 6,
      9,
      rgb(1, 1, 1)
    );
    drawTextF(
      p,
      ctx.fontBold,
      "单价区间",
      x0 + cCat + cName + cQty + cPrice - 6 - priceW,
      y + 6,
      9,
      rgb(1, 1, 1)
    );
    drawTextF(
      p,
      ctx.fontBold,
      "小计区间",
      x0 + tableW - 6 - subW,
      y + 6,
      9,
      rgb(1, 1, 1)
    );

    y -= rowH;

    strict.items.forEach((it, idx) => {
      if (y < PAGE_BOTTOM_SAFE + 30) return;
      const alt = idx % 2 === 1;
      if (alt) {
        p.drawRectangle({
          x: x0,
          y,
          width: tableW,
          height: rowH,
          color: TOKENS.colorBrandLight,
          borderWidth: 0,
        });
      } else {
        drawBox(p, x0, y, tableW, rowH);
      }
      drawVLines(p, xs, y, rowH);

      const cat = ellipsisToWidth(it.categoryName || it.category || "", ctx.font, 9, cCat - 10);
      const nm = ellipsisToWidth(it.name || "", ctx.font, 9, cName - 10);

      drawTextF(p, ctx.font, cat, x0 + 6, y + 6, 9);
      drawTextF(p, ctx.font, nm, x0 + cCat + 6, y + 6, 9);

      const qtyText = `${it.qtyMin}-${it.qtyMax}`;
      const priceText = `${fmtMoney(it.priceMin)}-${fmtMoney(it.priceMax)}`;
      const subText = `${fmtMoney(it.subtotalMin)}-${fmtMoney(it.subtotalMax)}`;

      drawTextF(p, ctx.font, qtyText, x0 + cCat + cName + 6, y + 6, 9);
      drawTextF(p, ctx.font, priceText, x0 + cCat + cName + cQty + 6, y + 6, 9);

      const subW = ctx.font.widthOfTextAtSize(subText, 9);
      drawTextF(p, ctx.font, subText, x0 + tableW - 6 - subW, y + 6, 9);

      y -= rowH;
    });

    drawTextF(
      p,
      ctx.font,
      "说明：本报告为预算测算依据文件，最终采购清单及价格以正式合同或供应商报价为准。",
      M.l,
      60,
      9,
      rgb(0.35, 0.35, 0.35)
    );

    drawThemeFooter(p, theme, ctx.font, {
      planId: input.planId,
      dateYmd,
      pageNo: 2,
      pageTotal: 2,
      sig: reqsig ? reqsig : undefined,
      fp: pdfVersion,
    });
  }
}

// -------------------------------
// GOVERNMENT: 5 pages strict template
// -------------------------------
async function renderGovernment5Pages(
  doc: PDFDocument,
  ctx: DrawCtx,
  strict: StrictSummary,
  opts: RenderBudgetPdfOpts
) {
  const A4: [number, number] = [595.28, 841.89];
  const m = 48;

  const pdfVersion = opts.pdfVersion || BUDGET_PDF_VERSION;
  const reqsig = opts.reqsig ? String(opts.reqsig) : "";
  const dateYmd = opts.dateTokyoYmd || ymdTokyoSlash();

  // Page 0: Cover
  {
    const p = doc.addPage(A4);
    const W = p.getWidth();
    const H = p.getHeight();

    drawTextF(p, ctx.fontBold, "企业健身空间设备采购预算测算报告", m, H - 90, 18);
    drawTextF(p, ctx.font, "（政府评审版）", m, H - 118, 12, rgb(0.25, 0.25, 0.25));
    drawLine(p, m, H - 138, W - m, H - 138);

    const rows: Array<[string, string]> = [
      ["项目名称", "企业健身空间设备采购（新建）"],
      ["企业名称", strict.companyName],
      ["企业规模", `${strict.companySize} 人`],
      ["预算档位", String(strict.tier).toUpperCase()],
      ["编制日期", dateYmd],
      ["文档编号", strict.docNo],
    ];

    let y = H - 190;
    for (const [k, v] of rows) {
      drawTextF(p, ctx.fontBold, `${k}：`, m, y, 11);
      drawTextF(p, ctx.font, v, m + 80, y, 11);
      y -= 22;
    }

    drawLegacyFooter(
      p,
      ctx,
      `Plan ID: ${strict.planId} | ${dateYmd}`,
      `DOCNO:${strict.docNo}${reqsig ? ` | SIG:${reqsig}` : ""}`
    );
  }

  // Page 1: Method + Scope boundary
  {
    const p = doc.addPage(A4);
    const W = p.getWidth();
    const H = p.getHeight();

    drawTextF(p, ctx.fontBold, "一、测算依据与方法", m, H - 70, 14);
    drawLine(p, m, H - 86, W - m, H - 86);

    const bullets1 = [
      `企业规模：${strict.companySize} 人；预算档位：${String(strict.tier).toUpperCase()}。`,
      "测算模型：规模 × 使用密度 × 商用设备标准配置模型，形成数量区间。",
      "单价口径：参考主流商用设备公开报价区间，按同档位统一口径归并。",
      "小计口径：数量区间 × 单价区间自动计算（可核算）。",
    ];

    let y = H - 120;
    for (const b of bullets1) {
      const lines = wrapTextCN(`• ${b}`, {
        font: ctx.font,
        fontSize: 10,
        maxWidth: W - 2 * m,
        maxLines: 999,
      });
      for (const line of lines) {
        drawTextF(p, ctx.font, line, m, y, 10);
        y -= 14;
      }
      y -= 4;
    }

    drawTextF(p, ctx.fontBold, "二、预算范围边界（固定口径）", m, y - 10, 12);
    y -= 34;

    const bullets2 = [
      "本预算仅包含健身设备采购及基础交付费用。",
      "不包含装修工程费用。",
      "不包含强弱电工程费用。",
      "不包含消防系统工程费用。",
      "如需铺设运动地板或力量区橡胶地垫，将作为设备配套项单列（可选）。",
    ];

    for (const b of bullets2) {
      const lines = wrapTextCN(`• ${b}`, {
        font: ctx.font,
        fontSize: 10,
        maxWidth: W - 2 * m,
        maxLines: 999,
      });
      for (const line of lines) {
        drawTextF(p, ctx.font, line, m, y, 10);
        y -= 14;
      }
      y -= 4;
    }

    drawLegacyFooter(
      p,
      ctx,
      "预算测算依据与范围边界说明",
      `DOCNO:${strict.docNo}${reqsig ? ` | SIG:${reqsig}` : ""}`
    );
  }

  // Page 2: Total summary table (closed loop)
  {
    const p = doc.addPage(A4);
    const W = p.getWidth();
    const H = p.getHeight();

    drawTextF(p, ctx.fontBold, "三、总体预算汇总（闭环）", m, H - 70, 14);
    drawLine(p, m, H - 86, W - m, H - 86);

    const map = new Map<string, MoneyRange>();
    for (const it of strict.items) {
      const key = it.categoryName || it.category || "其他";
      const cur = map.get(key) || { min: 0, max: 0 };
      map.set(key, { min: cur.min + it.subtotalMin, max: cur.max + it.subtotalMax });
    }

    const rows = Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0], "zh-Hans-CN"));

    const x0 = m;
    const tableW = W - 2 * m;
    const col1 = 180;
    const col2 = 160;
    const col3 = tableW - col1 - col2;
    void col3;

    const rowH = 26;

    const xCol1 = x0 + col1;
    const xCol2 = x0 + col1 + col2;

    let y = H - 130;

    drawBox(p, x0, y, tableW, rowH, rgb(0.75, 0.75, 0.75));
    drawVLines(p, [xCol1, xCol2], y, rowH);
    drawTextF(p, ctx.fontBold, "类别", x0 + 8, y + 8, 10);
    drawTextF(p, ctx.fontBold, "最低估算（CNY）", xCol1 + 8, y + 8, 10);
    drawTextF(p, ctx.fontBold, "最高估算（CNY）", xCol2 + 8, y + 8, 10);

    y -= rowH;

    for (const [k, v] of rows) {
      if (y < PAGE_BOTTOM_SAFE + 60) break;
      drawBox(p, x0, y, tableW, rowH);
      drawVLines(p, [xCol1, xCol2], y, rowH);

      drawTextF(p, ctx.font, k, x0 + 8, y + 8, 10);
      drawTextF(p, ctx.font, fmtMoney(v.min), xCol1 + 8, y + 8, 10);
      drawTextF(p, ctx.font, fmtMoney(v.max), xCol2 + 8, y + 8, 10);

      y -= rowH;
    }

    drawBox(p, x0, y, tableW, rowH, rgb(0.93, 0.93, 0.93));
    drawVLines(p, [xCol1, xCol2], y, rowH);
    drawTextF(p, ctx.fontBold, "合计", x0 + 8, y + 8, 10);
    drawTextF(p, ctx.fontBold, fmtMoney(strict.total.min), xCol1 + 8, y + 8, 10);
    drawTextF(p, ctx.fontBold, fmtMoney(strict.total.max), xCol2 + 8, y + 8, 10);

    drawLegacyFooter(
      p,
      ctx,
      "总体预算汇总（闭环计算）",
      `DOCNO:${strict.docNo}${reqsig ? ` | SIG:${reqsig}` : ""}`
    );
  }

  // Page 3: Detailed strict table (AUTO PAGINATION)
  {
    const topTitleY = 70;
    const topTableY = 130;
    const bottomY = 70;
    const rowH = 22;

    const makeCols = (tableW: number) => {
      const cCat = 58;
      const cName = 132;
      const cQty = 52;
      const cPrice = 66;
      const cSub = tableW - (cCat + cName + cQty + cQty + cPrice + cPrice);
      return { cCat, cName, cQty, cPrice, cSub };
    };

    const drawPageTitle = (p: PDFPage) => {
      const W = p.getWidth();
      const H = p.getHeight();
      drawTextF(p, ctx.fontBold, "四、设备明细核算表（可核算）", m, H - topTitleY, 14);
      drawLine(p, m, H - (topTitleY + 16), W - m, H - (topTitleY + 16));
    };

    const drawHeaderRow = (p: PDFPage, x0: number, y: number, tableW: number) => {
      const { cCat, cName, cQty, cPrice, cSub } = makeCols(tableW);

      drawBox(p, x0, y, tableW, rowH, rgb(0.75, 0.75, 0.75));
      let cx = x0;

      const headers: Array<[string, number]> = [
        ["类别", cCat],
        ["设备", cName],
        ["数量min", cQty],
        ["数量max", cQty],
        ["单价min", cPrice],
        ["单价max", cPrice],
        ["小计区间", cSub],
      ];

      for (const [t, w] of headers) {
        drawTextF(p, ctx.fontBold, t, cx + 6, y + 6, 9);
        cx += w;
        drawLine(p, cx, y, cx, y + rowH);
      }

      return { cCat, cName, cQty, cPrice, cSub };
    };

    const drawOneRow = (p: PDFPage, x0: number, y: number, tableW: number, it: StrictItem) => {
      const { cCat, cName, cQty, cPrice } = makeCols(tableW);

      drawBox(p, x0, y, tableW, rowH);

      let x = x0 + cCat;
      drawLine(p, x, y, x, y + rowH);
      x += cName;
      drawLine(p, x, y, x, y + rowH);
      x += cQty;
      drawLine(p, x, y, x, y + rowH);
      x += cQty;
      drawLine(p, x, y, x, y + rowH);
      x += cPrice;
      drawLine(p, x, y, x, y + rowH);
      x += cPrice;
      drawLine(p, x, y, x, y + rowH);

      const cat = ellipsisToWidth((it.categoryName || it.category || "").trim(), ctx.font, 9, cCat - 10);
      drawTextF(p, ctx.font, cat, x0 + 6, y + 6, 9);

      const nm = ellipsisToWidth((it.name || "").trim(), ctx.font, 9, cName - 10);
      drawTextF(p, ctx.font, nm, x0 + cCat + 6, y + 6, 9);

      drawTextF(p, ctx.font, String(it.qtyMin), x0 + cCat + cName + 6, y + 6, 9);
      drawTextF(p, ctx.font, String(it.qtyMax), x0 + cCat + cName + cQty + 6, y + 6, 9);

      drawTextF(p, ctx.font, fmtMoney(it.priceMin), x0 + cCat + cName + cQty + cQty + 6, y + 6, 9);
      drawTextF(p, ctx.font, fmtMoney(it.priceMax), x0 + cCat + cName + cQty + cQty + cPrice + 6, y + 6, 9);

      const subText = `${fmtMoney(it.subtotalMin)}-${fmtMoney(it.subtotalMax)}`;
      drawTextF(p, ctx.font, subText, x0 + cCat + cName + cQty + cQty + cPrice + cPrice + 6, y + 7, 8);
    };

    const drawFooterSafe = (p: PDFPage) => {
      const left = "明细小计 = 数量 × 单价（自动计算）";
      const right = `DOCNO:${strict.docNo}${reqsig ? ` | SIG:${reqsig}` : ""}`;
      const y = 24;
      const W = p.getWidth();
      drawTextF(p, ctx.font, left, m, y, 8, rgb(0.35, 0.35, 0.35));
      const w = ctx.fontMono.widthOfTextAtSize(right, 8);
      drawTextF(p, ctx.fontMono, right, W - m - w, y, 8, rgb(0.35, 0.35, 0.35));
    };

    let p = doc.addPage(A4);
    drawPageTitle(p);

    const W = p.getWidth();
    const H = p.getHeight();
    const x0 = m;
    const tableW = W - 2 * m;

    let y = H - topTableY;

    drawHeaderRow(p, x0, y, tableW);
    y -= rowH;

    for (const it of strict.items) {
      if (y < bottomY) {
        drawFooterSafe(p);

        p = doc.addPage(A4);
        drawPageTitle(p);

        const H2 = p.getHeight();
        y = H2 - topTableY;

        drawHeaderRow(p, x0, y, tableW);
        y -= rowH;
      }

      drawOneRow(p, x0, y, tableW, it);
      y -= rowH;
    }

    drawFooterSafe(p);
  }

  // Page 4: Delivery + Warranty
  {
    const p = doc.addPage(A4);
    const W = p.getWidth();
    const H = p.getHeight();

    drawTextF(p, ctx.fontBold, "五、交付与质保说明", m, H - 70, 14);
    drawLine(p, m, H - 86, W - m, H - 86);

    const txt = [
      "1）交付周期：受供货周期与场地施工窗口影响，可提供分批到货与分批交付方案。",
      "2）安装与调试：提供设备到场安装、基础调试与使用说明交付。",
      "3）质保范围：设备质保按品牌标准执行；可按单位制度升级延保/巡检/驻场方案。",
      "4）验收口径：按设备清单、数量、功能测试及外观检查完成验收。",
      "5）范围边界复述：不含装修、不含强弱电、不含消防；运动地板/橡胶地垫如需纳入将单列。",
    ];

    let y = H - 130;
    for (const t of txt) {
      const lines = wrapTextCN(t, {
        font: ctx.font,
        fontSize: 10,
        maxWidth: W - 2 * m,
        maxLines: 999,
      });
      for (const line of lines) {
        drawTextF(p, ctx.font, line, m, y, 10);
        y -= 14;
      }
      y -= 6;
    }

    drawLegacyFooter(
      p,
      ctx,
      `Plan ID: ${strict.planId} | ${dateYmd}`,
      `${pdfVersion}${reqsig ? ` | SIG:${reqsig}` : ""}`
    );
  }
}

// -------------------------------
// ENTERPRISE: Terms pages (tender feel)
// -------------------------------
async function renderEnterpriseTermsPlaceholder(
  doc: PDFDocument,
  ctx: DrawCtx,
  input: BudgetPdfInput,
  opts: RenderBudgetPdfOpts
) {
  const A4: [number, number] = [595.28, 841.89];
  const theme = THEMES.tender; // ✅ terms 永远 tender（评审/招标感）
  const M = theme.margin;

  const sections = opts.sections || [];
  const reqsig = opts.reqsig ? String(opts.reqsig) : "";
  const dateYmd = opts.dateTokyoYmd || ymdTokyoSlash();
  const fp = opts.pdfVersion || BUDGET_PDF_VERSION;

  const need = (k: string) => sections.includes(k as any);

  const addPage = (title: string, bullets: string[]) => {
    const p = doc.addPage(A4);
    const W = p.getWidth();

    let y = drawThemeHeader(p, theme, ctx.font, title, {
      companyName: input.companyName || "示例企业",
      companySize: input.companySize,
      tierLabel: String(input.budgetTier).toUpperCase(),
      planId: input.planId,
      dateYmd,
    });

    y -= 10;

    for (const b of bullets) {
      const lines = wrapTextCN(`• ${b}`, {
        font: ctx.font,
        fontSize: 10,
        maxWidth: W - M.l - M.r,
        maxLines: 999,
      });
      for (const line of lines) {
        drawTextF(p, ctx.font, line, M.l, y, 10);
        y -= 14;
      }
      y -= 6;
    }

    // 先画占位 footer，最终会被 restamp 覆盖为真实页码
    drawThemeFooter(p, theme, ctx.font, {
      planId: input.planId,
      dateYmd,
      pageNo: 0,
      pageTotal: 0,
      sig: reqsig ? reqsig : undefined,
      fp,
    });
  };

  if (need("pricing_terms")) {
    addPage("报价与计价条款（企业招标版）", [
      "报价为区间估算，最终以供应商正式报价/合同为准。",
      "计价口径：数量区间 × 单价区间闭环核算；可按评审要求提供分项报价表。",
      "本报价不含装修/强弱电/消防；如需运动地板/橡胶地垫，按可选项单列。",
    ]);
  }

  if (need("delivery_terms")) {
    addPage("交付条款", [
      "交付周期：按供货周期与场地窗口协同，可提供分批到货/分批交付。",
      "交付内容：设备到场、安装、基础调试、使用说明与培训交付。",
      "验收口径：按设备清单、数量、功能测试及外观检查完成验收。",
    ]);
  }

  if (need("payment_terms")) {
    addPage("付款条款", [
      "付款方式：可支持预付款 + 到货/验收节点付款（按贵司制度调整）。",
      "发票要求：支持增值税发票（税率及开票信息以合同为准）。",
      "报价有效期：建议 15–30 天（可按评审要求调整）。",
    ]);
  }

  if (need("after_sales")) {
    addPage("售后与质保", [
      "质保范围：按设备品牌标准质保执行；可提供延保/巡检/驻场方案（选配）。",
      "响应机制：故障报修响应与备件支持按合同约定执行。",
      "培训支持：提供基础使用培训与安全规范说明。",
    ]);
  }

  if (need("sign_seal")) {
    addPage("签章页", [
      "投标单位（盖章）：AI Fitness Solution",
      "法定代表人/授权代表（签字）：________________",
      `签署日期：${dateYmd}`,
      reqsig ? `验真信息：SIG:${reqsig}` : "验真信息：—",
    ]);
  }
}

// -------------------------------
// Restamp theme footers
// -------------------------------
function restampThemeFooters(
  doc: PDFDocument,
  theme: any,
  font: PDFFont,
  opts: {
    planId: string;
    dateYmd: string;
    sig?: string;
    fp?: string;
  }
) {
  const total = doc.getPageCount();
  for (let i = 0; i < total; i++) {
    const page = doc.getPage(i);
    drawThemeFooter(page, theme, font, {
      planId: opts.planId,
      dateYmd: opts.dateYmd,
      pageNo: i + 1,
      pageTotal: total,
      sig: opts.sig,
      fp: opts.fp,
      cover: true,
    } as any);
  }
}