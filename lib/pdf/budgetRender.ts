// lib/pdf/budgetRender.ts
import fs from "fs/promises";
import path from "path";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, PDFFont, PDFPage, rgb } from "pdf-lib";

import { buildBudgetSummary } from "@/lib/gym-budget";
import type { BudgetTier, CompanySize } from "@/lib/types/gym-budget";

export const BUDGET_ENGINE_FP = "BUDGET_ENGINE_FP_20260226_TIERFIX";
export const BUDGET_PDF_VERSION = "BUDGET_PDF_V20260226_TIERFIX";

export type BudgetPdfInput = {
  planId: string;
  companyName: string;
  companySize: CompanySize | number | string;
  budgetTier?: BudgetTier | string;
  tier?: string;
};

export type RenderBudgetPdfOpts = {
  pdfVersion: string;
  debug?: boolean;
  reqSig?: string; // ✅ 由 route.ts 传入
};

export type BudgetPdfSection =
  | "header"
  | "overall"
  | "compare"
  | "table"
  | "brands"
  | "supplement"
  | "remarks";

type BudgetRenderMeta = {
  impl: string;
  engineFp: string;
  engineVersion: string;

  summaryStatus?: "SUMMARY_OK" | "SUMMARY_ERR";
  summaryWarn?: string;
  summaryErr?: string;
  summaryTrunc?: string;

  summaryTier?: string;
  summary?: any;
};

function toInt(v: any, fallback: number) {
  const s = String(v ?? "").trim();
  if (!s) return fallback;
  const n = Number(s);
  if (!Number.isFinite(n)) return fallback;
  const i = Math.floor(n);
  return i > 0 ? i : fallback;
}

function normalizeTierLoose(tier: any): BudgetTier {
  const s = String(tier ?? "").trim().toLowerCase();
  if (s === "low" || s === "l" || s === "basic") return "low";
  if (s === "high" || s === "h" || s === "premium" || s === "pro") return "high";
  return "mid";
}

async function loadFontBytes(rel: string) {
  return fs.readFile(path.join(process.cwd(), rel));
}

function moneyRange(min: number, max: number) {
  const f = (n: number) => `${n.toLocaleString("en-US")}`;
  return `${f(min)} - ${f(max)}`;
}

function drawText(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  size: number,
  font: PDFFont,
  color = rgb(0, 0, 0)
) {
  page.drawText(text, { x, y, size, font, color });
}

/** ✅ 双保险：1) PDF metadata 2) PDF 隐形文字（白色 1pt） */
function embedSignatureEverywhere(params: {
  doc: PDFDocument;
  page1: PDFPage;
  font: PDFFont;
  reqSig?: string;
  planId: string;
  tier: BudgetTier;
  companySize: number;
  pdfVersion: string;
  engineFp: string;
}) {
  const { doc, page1, font, reqSig, planId, tier, companySize, pdfVersion, engineFp } = params;
  if (!reqSig) return;

  const sigLine = `REQSIG:${reqSig}`;
  const kw = [
    "AI_FITNESS_SOLUTION",
    sigLine,
    `PLAN:${planId}`,
    `TIER:${tier}`,
    `SIZE:${companySize}`,
    `PDFVER:${pdfVersion}`,
    `ENGINEFP:${engineFp}`,
  ].join(";");

  // --- (A) 标准 /Info 元数据（pypdf 能直接读） ---
  doc.setTitle(`Budget-${planId}-${tier}-size${companySize}`);
  doc.setSubject(`AI Fitness Solution Budget | ${sigLine}`);
  doc.setKeywords([kw]);

  // --- (B) PDF 本体隐形文字（就算 metadata 被清也能验真） ---
  // 颜色白 + 1pt + 放在最底部，正常打印/阅读不可见
  page1.drawText(kw, {
    x: 6,
    y: 6,
    size: 1,
    font,
    color: rgb(1, 1, 1),
    maxWidth: 580,
    lineHeight: 2,
  });
}

export async function renderBudgetPdfBuffer(
  input: BudgetPdfInput,
  opts: RenderBudgetPdfOpts
): Promise<{ pdfBytes: Uint8Array; meta: BudgetRenderMeta; summary?: any }> {
  const meta: BudgetRenderMeta = {
    impl: "budgetRender.ts",
    engineFp: BUDGET_ENGINE_FP,
    engineVersion: opts?.pdfVersion || BUDGET_PDF_VERSION,
  };

  const debug = !!opts?.debug;
  const reqSig = opts?.reqSig;

  const tierIn = normalizeTierLoose(input?.budgetTier ?? input?.tier);
  const sizeNum = toInt(input?.companySize, 200);

  let summary: any = null;
  try {
    summary = buildBudgetSummary(tierIn as any, sizeNum as any);
    meta.summaryStatus = "SUMMARY_OK";
    meta.summary = debug ? summary : undefined;
    meta.summaryTier = summary?.tier || tierIn;

    meta.summaryTrunc = encodeURIComponent(
      JSON.stringify({
        tier: summary.tier,
        overallTotal: summary.overallTotal,
      })
    );
  } catch (e: any) {
    meta.summaryStatus = "SUMMARY_ERR";
    meta.summaryErr = String(e?.message || e);
    meta.summaryTier = tierIn;
  }

  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);

  const fontBytes = await loadFontBytes("public/fonts/NotoSansSC-Regular.ttf");
  const font = await doc.embedFont(fontBytes, { subset: true });
  const fontBold = font;

  const pageW = 595.28;
  const pageH = 841.89;
  const margin = 48;

  const page1 = doc.addPage([pageW, pageH]);
  const page2 = doc.addPage([pageW, pageH]);

  // ✅ 在你画任何内容之前/之后都行，这里放在创建 page 后立刻写
  embedSignatureEverywhere({
    doc,
    page1,
    font,
    reqSig,
    planId: input.planId,
    tier: tierIn,
    companySize: sizeNum,
    pdfVersion: opts?.pdfVersion || BUDGET_PDF_VERSION,
    engineFp: BUDGET_ENGINE_FP,
  });

  const footer = (page: PDFPage, pageNo: number, total: number) => {
    drawText(
      page,
      `Plan ID: ${input.planId}    |    ${new Date()
        .toLocaleDateString("zh-CN")
        .replaceAll("-", "/")}    |    ${pageNo}/${total}`,
      margin,
      28,
      9,
      font,
      rgb(0.45, 0.45, 0.45)
    );

    // ✅ debug 时可见
    if (debug && reqSig) {
      drawText(
        page,
        `SIG: ${reqSig}`,
        pageW - margin - 150,
        28,
        8,
        font,
        rgb(0.6, 0.6, 0.6)
      );
    }
  };

  // ---- Page 1 ----
  let y = pageH - margin;
  drawText(page1, "企业健身房预算概览（自动生成）", margin, y - 10, 20, fontBold);
  y -= 40;

  drawText(page1, `企业：${input.companyName}`, margin, y, 12, font);
  y -= 18;
  drawText(page1, `规模：${sizeNum} 人`, margin, y, 12, font);
  y -= 18;
  drawText(page1, `预算档位：${tierIn.toUpperCase()}`, margin, y, 12, fontBold);
  y -= 26;

  drawText(page1, "一、总体预算区间", margin, y, 12, fontBold);
  y -= 18;

  if (summary?.overallTotal) {
    drawText(
      page1,
      `建议总价区间： ${moneyRange(summary.overallTotal.min, summary.overallTotal.max)}`,
      margin,
      y,
      12,
      fontBold
    );
    y -= 18;
  }
  if (summary?.estimatedBySubtotals) {
    drawText(
      page1,
      `按分项小计估算： ${moneyRange(summary.estimatedBySubtotals.min, summary.estimatedBySubtotals.max)}`,
      margin,
      y,
      11,
      font
    );
    y -= 18;
  }

  drawText(
    page1,
    "说明：总体预算为经验区间，分项小计为参考估算，最终以场地、品牌与采购策略为准。",
    margin,
    y,
    10,
    font,
    rgb(0.25, 0.25, 0.25)
  );
  y -= 26;

  drawText(page1, "二、三档差异说明（Low / Mid / High）", margin, y, 12, fontBold);
  y -= 18;
  drawText(page1, "  Low：适合健身角 / 小规模试点，基础有氧 + 核心力量覆盖。", margin, y, 10, font);
  y -= 14;
  drawText(page1, "  Mid：适合 50-100 人使用密度，商用入门/标准款，耐用与体验均衡。", margin, y, 10, font);
  y -= 14;
  drawText(page1, "  High：适合 100-200 人与高频使用，智能联网/更高安全标准与更完整训练覆盖。", margin, y, 10, font);

  footer(page1, 1, 2);
  footer(page2, 2, 2);

  const pdfBytes = await doc.save();
  return { pdfBytes, meta, summary };
}