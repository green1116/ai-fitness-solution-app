// lib/pdf/render.ts
import {
  renderBudgetPdfBuffer,
  type BudgetPdfInput,
  type BudgetPdfSection,
  type RenderBudgetPdfOpts,
} from "@/lib/pdf/budgetRender";

import type { PdfTheme } from "@/lib/pdf/engine/theme";
import { renderPlan22PdfBytes } from "@/lib/pdf/plan/renderPlan22";

type Mode = "preview" | "full" | "budget";

type RenderOptions = {
  mode?: Mode;
  theme?: PdfTheme; // A方案不使用，但保留签名不破坏调用方
  watermark?: boolean; // A方案不使用，但保留签名不破坏调用方
  pdfVersion?: string; // A方案不使用，但保留签名不破坏调用方
};

// -------------------- BUDGET（保持你现状） --------------------
async function renderBudgetViaBudgetLib(planId: string): Promise<Uint8Array> {
  // 你现有预算参数从 route.ts 透传（动态 import）也行；
  // 这里维持“最小依赖”，仅 planId & tier/companySize 走默认值，
  // 真实值仍由 app/api/pdf/route.ts 负责组装传入预算渲染器。
  const input: BudgetPdfInput = {
    planId,
    companyName: "示例企业",
    companySize: 100 as any,
    budgetTier: "mid" as any,
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

  const opts: RenderBudgetPdfOpts = {
    pdfVersion: "BR_DEFAULT",
    sections,
  };

  return await renderBudgetPdfBuffer(input, opts as any);
}

// -------------------- ENTRY --------------------
export async function renderPdf(planId: string, opts: RenderOptions = {}) {
  const mode: Mode = opts.mode || "full";

  // ✅ 预算保持原路线
  if (mode === "budget") {
    return await renderBudgetViaBudgetLib(planId);
  }

  // ✅ A方案：方案直接回放 22 页金样板（止血）
  // - 不跑任何模块/TOC/branding
  // - 不会再出现“18页/补页/模块加载失败/Expression expected”
  return await renderPlan22PdfBytes(planId);
}