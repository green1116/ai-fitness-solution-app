// lib/pdf/render.ts
import fs from "fs/promises";
import path from "path";
import fontkit from "@pdf-lib/fontkit";
import { PDFDocument, rgb, PDFFont, PDFPage } from "pdf-lib";

import {
  renderBudgetPdfBuffer,
  type BudgetPdfInput,
  type BudgetPdfSection,
  type RenderBudgetPdfOpts,
} from "@/lib/pdf/budgetRender";

import { applyBrandingToDoc } from "@/lib/pdf/engine/applyBranding";
import type { PdfTheme } from "@/lib/pdf/engine/theme";
import { getThemeConfig } from "@/lib/pdf/engine/theme";

// V6 TOC anchors
import { addTocAnchor } from "@/lib/pdf/tocAnchors";

// Plan content (JSON-driven)
import { standardContent } from "./plan-content/standard";
import { liteContent } from "./plan-content/lite";
import { proContent } from "./plan-content/pro";
import { formatTokens } from "./plan-content/format";

type Mode = "preview" | "full" | "budget";

type RenderOptions = {
  mode?: Mode;
  theme?: PdfTheme;
  watermark?: boolean;
  pdfVersion?: string;
};

type PlanInput = {
  companyName?: string;
  industry?: string;
  size?: number;
  area?: number;
  budgetRange?: string;
  tier?: string;
  positioning?: string;
  participationRate?: number;
  preference?: string;
  budgetTier?: "low" | "mid" | "high";
};

type Plan = { input?: PlanInput };

type ModuleCtx = {
  doc: PDFDocument;
  font: PDFFont;
  fontBold: PDFFont;
  pageW: number;
  pageH: number;
  planId: string;
  mode: Exclude<Mode, "budget">;
  plan: Plan;
  nowText: string;
};

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

// ⚠️ 你后续可以替换成 Prisma/DB 的真实读取
async function loadPlan(planId: string): Promise<Plan> {
  return {
    input: {
      companyName: "示例企业",
      industry: "互联网",
      size: 200,
      area: 120,
      budgetRange: "10-20万",
      tier: "standard",
      positioning: "为 200 人规模企业打造的方案",
      participationRate: 0.3,
      preference: "偏好智能",
      budgetTier: "mid",
    },
  };
}

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

/**
 * 页标题页（可写 anchor）
 */
function pageTitle(
  ctx: ModuleCtx,
  title: string,
  subtitle?: string,
  anchorKey?: string
) {
  const page = ctx.doc.addPage([ctx.pageW, ctx.pageH]);

  // V6 Anchor：写在该页最开头
  if (anchorKey) addTocAnchor(ctx.doc, page, anchorKey);

  const margin = 48;
  let y = ctx.pageH - margin;

  drawTextBoldLike(
    page,
    title,
    margin,
    y - 10,
    20,
    ctx.fontBold,
    rgb(0.1, 0.1, 0.1)
  );
  y -= 44;

  if (subtitle) {
    page.drawText(subtitle, {
      x: margin,
      y,
      size: 11,
      font: ctx.font,
      color: rgb(0.25, 0.25, 0.25),
      lineHeight: 14,
    });
    y -= 20;
  }

  page.drawText(`导出时间：${ctx.nowText}`, {
    x: margin,
    y: 28,
    size: 9,
    font: ctx.font,
    color: rgb(0.45, 0.45, 0.45),
  });

  return page;
}

/**
 * bullets 页（可写 anchor）
 */
function bullets(ctx: ModuleCtx, title: string, items: string[], anchorKey?: string) {
  const page = ctx.doc.addPage([ctx.pageW, ctx.pageH]);

  // V6 Anchor
  if (anchorKey) addTocAnchor(ctx.doc, page, anchorKey);

  const margin = 48;
  let y = ctx.pageH - margin;

  drawTextBoldLike(
    page,
    title,
    margin,
    y - 10,
    18,
    ctx.fontBold,
    rgb(0.1, 0.1, 0.1)
  );
  y -= 46;

  for (const it of items) {
    page.drawText("• " + it, {
      x: margin,
      y,
      size: 11,
      font: ctx.font,
      color: rgb(0.15, 0.15, 0.15),
      maxWidth: ctx.pageW - margin * 2,
      lineHeight: 14,
    });
    y -= 22;
    if (y < 90) break; // 先保持原逻辑，后续再升级为自动跨页
  }

  page.drawText(`Plan ID：${ctx.planId}`, {
    x: margin,
    y: 48,
    size: 9,
    font: ctx.font,
    color: rgb(0.45, 0.45, 0.45),
  });

  return page;
}

/** 从 plan input 构建 token 数据 */
function buildDynamicDataFromPlan(ctx: ModuleCtx) {
  const i = ctx.plan.input || {};
  const headcount = Number(i.size || 0) || 200;
  const participationRate = normalizeParticipation(i.participationRate);
  const participationRatePct = Math.round(participationRate * 100);
  const peakUsersEstimated = Math.max(0, Math.round(headcount * participationRate));
  const peakUsersCardio = Math.max(0, Math.round(peakUsersEstimated * 0.7));

  return {
    headcount,
    participationRate,
    participationRatePct,
    peakUsersEstimated,
    peakUsersCardio,
    companyName: safeText(i.companyName, "企业客户"),
  };
}

/**
 * 将 plan-content 模块渲染为 bullets（一页）
 * 最小接入：先跑通投标文本；后续再升级表格/卡片/跨页
 */
function renderPlanContentAsBullets(ctx: ModuleCtx, mod: any, anchorKey: string) {
  // 模块不存在/blocks 非数组：跳过，不出“模块加载失败”页
  if (!mod || !Array.isArray(mod.blocks)) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[PLAN] Skip empty module:", anchorKey);
    }
    return;
  }

  const data = buildDynamicDataFromPlan(ctx);
  const items: string[] = [];

  for (const b of mod.blocks) {
    switch (b?.type) {
      case "paragraph": {
        const t = formatTokens(b.text || "", data).trim();
        if (t) items.push(t);
        break;
      }
      case "subheading": {
        const t = formatTokens(b.text || "", data).trim();
        if (t) items.push(t);
        break;
      }
      case "bullet_list": {
        if (b.title) {
          const t = formatTokens(b.title, data).trim();
          if (t) items.push(t);
        }
        for (const it of b.items || []) {
          const t = formatTokens(it, data).trim();
          if (t) items.push(t);
        }
        break;
      }
      case "callout": {
        if (b.title) {
          const t = formatTokens(b.title, data).trim();
          if (t) items.push(t);
        }
        for (const line of b.lines || []) {
          const t = formatTokens(line, data).trim();
          if (t) items.push(t);
        }
        break;
      }
      case "table": {
        if (b.title) {
          const t = formatTokens(b.title, data).trim();
          if (t) items.push(t);
        }
        const cols: string[] = b.columns || [];
        for (const row of b.rows || []) {
          const parts = (row || []).map((cell: any, idx: number) => {
            const k = cols[idx] ? `${cols[idx]}：` : "";
            return k + formatTokens(String(cell ?? ""), data);
          });
          const line = parts.join("；").trim();
          if (line) items.push(line);
        }
        break;
      }
      default:
        break;
    }
  }

  if (items.length === 0) return;
  bullets(ctx, mod.title || "方案模块", items, anchorKey);
}

/**
 * 按“18页可行方案”的结构，先把关键章节 anchors 固定下来
 * anchorKey 不要改（route.ts / tender-pack 扫这些 key）
 */
function buildModules() {
  return [
    // 概览/封面
    {
      render: async (ctx: ModuleCtx) => {
        const i = ctx.plan.input || {};
        const p = normalizeParticipation(i.participationRate);
        pageTitle(
          ctx,
          "办公健康支持方案（自动生成）",
          `企业：${safeText(i.companyName)}\n行业：${safeText(i.industry)}\n规模：${safeText(i.size)}人\n参与率：${fmtPct(p)}`,
          "PLAN.OVERVIEW"
        );
      },
    },

    // 执行摘要
    {
      render: async (ctx: ModuleCtx) => {
        bullets(
          ctx,
          "执行摘要",
          [
            "本方案为自动生成示例。",
            "结构可扩展为正式投标方案。",
            "已接入品牌系统与水印引擎。",
          ],
          "PLAN.EXEC_SUMMARY"
        );
      },
    },

    // 三档对比
    {
      render: async (ctx: ModuleCtx) => {
        bullets(
          ctx,
          "三档方案配置对比",
          ["Lite / Standard / Pro 三档定位对比（占位）", "后续可替换为真实对比表格模块。"],
          "PLAN.COMPARE"
        );
      },
    },

    // Lite（占位）
    {
      render: async (ctx: ModuleCtx) => {
        bullets(ctx, "精简版（Lite）｜使用场景与覆盖能力", ["占位：Lite 场景/覆盖能力"], "PLAN.LITE");
      },
    },
    {
      render: async (ctx: ModuleCtx) => {
        bullets(ctx, "精简版（Lite）｜器材配置方案", ["占位：Lite 器材清单/配置逻辑"], "PLAN.LITE.EQUIPMENT");
      },
    },
    {
      render: async (ctx: ModuleCtx) => {
        bullets(ctx, "精简版（Lite）｜实施计划与周期", ["占位：Lite 实施步骤/周期/验收"], "PLAN.LITE.TIMELINE");
      },
    },
    {
      render: async (ctx: ModuleCtx) => {
        bullets(ctx, "精简版（Lite）｜增购模块与推荐说明", ["占位：Lite 可选模块/推荐话术"], "PLAN.LITE.ADDONS");
      },
    },
    {
      render: async (ctx: ModuleCtx) => {
        bullets(ctx, "精简版（Lite）｜使用风险与不适合说明", ["占位：Lite 风险提示/边界条件"], "PLAN.LITE.RISK");
      },
    },

    // Standard（内容驱动：按 index）
    {
      render: async (ctx: ModuleCtx) => {
        renderPlanContentAsBullets(ctx, standardContent.modules?.[0], "PLAN.STANDARD.SCENE");
      },
    },
    {
      render: async (ctx: ModuleCtx) => {
        renderPlanContentAsBullets(ctx, standardContent.modules?.[1], "PLAN.STANDARD.EQUIPMENT");
      },
    },
    {
      render: async (ctx: ModuleCtx) => {
        renderPlanContentAsBullets(ctx, standardContent.modules?.[2], "PLAN.STANDARD.TIMELINE");
      },
    },
    {
      render: async (ctx: ModuleCtx) => {
        renderPlanContentAsBullets(ctx, standardContent.modules?.[3], "PLAN.STANDARD.ADDONS");
      },
    },
    {
      render: async (ctx: ModuleCtx) => {
        renderPlanContentAsBullets(ctx, standardContent.modules?.[4], "PLAN.STANDARD.RISK");
      },
    },

    // Pro（占位）
    {
      render: async (ctx: ModuleCtx) => {
        bullets(ctx, "强化版（Pro）｜使用场景与覆盖能力", ["占位：Pro 场景/覆盖能力"], "PLAN.PRO.SCENE");
      },
    },
    {
      render: async (ctx: ModuleCtx) => {
        bullets(ctx, "强化版（Pro）｜器材配置方案", ["占位：Pro 器材清单/配置逻辑"], "PLAN.PRO.EQUIPMENT");
      },
    },
    {
      render: async (ctx: ModuleCtx) => {
        bullets(ctx, "强化版（Pro）｜实施计划与周期", ["占位：Pro 实施步骤/周期/验收"], "PLAN.PRO.TIMELINE");
      },
    },
    {
      render: async (ctx: ModuleCtx) => {
        bullets(ctx, "强化版（Pro）｜增购模块与推荐说明", ["占位：Pro 可选模块/推荐话术"], "PLAN.PRO.ADDONS");
      },
    },
    {
      render: async (ctx: ModuleCtx) => {
        bullets(ctx, "强化版（Pro）｜使用风险与不适合说明", ["占位：Pro 风险提示/边界条件"], "PLAN.PRO.RISK");
      },
    },

    // 附录
    {
      render: async (ctx: ModuleCtx) => {
        bullets(ctx, "附录 A｜器材明细表", ["占位：器材明细/参数/数量"], "PLAN.APPENDIX_A");
      },
    },
    {
      render: async (ctx: ModuleCtx) => {
        bullets(ctx, "附录 B｜品牌建议", ["占位：品牌/系列/交付说明"], "PLAN.APPENDIX_B");
      },
    },
    {
      render: async (ctx: ModuleCtx) => {
        bullets(ctx, "附录 C｜补充说明", ["占位：口径/假设/边界"], "PLAN.APPENDIX_C");
      },
    },
    {
      render: async (ctx: ModuleCtx) => {
        bullets(ctx, "附录 D｜其他备注", ["占位：风险提示/不适合说明"], "PLAN.APPENDIX_D");
      },
    },
  ];
}

async function renderBudgetViaBudgetLib(planId: string): Promise<Uint8Array> {
  const plan = await loadPlan(planId);
  const i = plan.input || {};

  const input: BudgetPdfInput = {
    planId,
    companyName: safeText(i.companyName, "未命名企业"),
    companySize: 100 as any,
    budgetTier: (i.budgetTier || "mid") as any,
  };

  const sections: BudgetPdfSection[] = [
    "header",
    "overall",
    "compare",
    "table",
    "brands",
    "supplement",
    "remarks",
  ] as any;

  const pdfVersion = "BUDGET_PDF_V20260217_FIXLOGO";
  const opts: RenderBudgetPdfOpts = { pdfVersion, sections };

  return await renderBudgetPdfBuffer(input, opts as any);
}

export async function renderPdf(planId: string, opts: RenderOptions = {}) {
  const mode: Mode = opts.mode || "full";

  // budget 分流
  if (mode === "budget") {
    return await renderBudgetViaBudgetLib(planId);
  }

  const theme: PdfTheme = opts.theme ?? "brand";
  const themeCfg = getThemeConfig(theme);
  const watermarkEnabled = opts.watermark ?? themeCfg.watermarkDefault;

  const pdfVersion = opts.pdfVersion ?? "PLAN_ENGINE_V20260224_BRANDED_01";

  const nowText = new Date().toLocaleString("zh-CN", { hour12: false });
  const plan = await loadPlan(planId);

  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);

  const fontBytes = await loadFontBytes("public/fonts/NotoSansSC-Regular.ttf");
  const font = await doc.embedFont(fontBytes, { subset: true });
  const fontBold = font;

  const pageW = 595.28;
  const pageH = 841.89;

  const ctx: ModuleCtx = {
    doc,
    font,
    fontBold,
    pageW,
    pageH,
    planId,
    mode,
    plan,
    nowText,
  };

  const modules = buildModules();
  for (const m of modules) {
    await m.render(ctx);
  }

  // full 模式兜底补页（不要写 anchor，避免污染目录）
  if (mode === "full") {
    const targetPages = 18;
    const current = doc.getPageCount();
    for (let i = current; i < targetPages; i++) {
      bullets(ctx, `模块页（待补齐）｜第 ${i + 1} 页`, ["这里是兜底页。", "正式版本请替换 buildModules()。"]);
    }
  }

  // 统一品牌后处理
  await applyBrandingToDoc({
    doc,
    title: "企业健身房建设方案（投标/演示版）",
    companyName: (plan.input as any)?.companyName || "企业客户",
    pdfVersion,
    theme,
    watermarkEnabled,
  });

  return await doc.save();
}