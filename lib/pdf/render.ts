// lib/pdf/render.ts
import {
  renderBudgetPdfBuffer,
  BUDGET_PDF_VERSION,
  type BudgetPdfInput,
  type RenderBudgetPdfOpts,
} from "@/lib/pdf/budgetRender";

import type { PdfTheme } from "@/lib/pdf/engine/theme";
import { renderPlan22PdfBytes } from "@/lib/pdf/plan/renderPlan22";

type Mode = "preview" | "full" | "budget";

type RenderOptions = {
  mode?: Mode;
  theme?: PdfTheme;
  watermark?: boolean;
  pdfVersion?: string;
  budgetInput?: BudgetPdfInput;
  budgetOpts?: RenderBudgetPdfOpts;
};

// -------------------- ENTRY --------------------
export async function renderPdf(planId: string, options: RenderOptions = {}) {
  const mode: Mode = options.mode || "full";

  // ✅ 预算分支：原样透传 budgetInput 和 budgetOpts（包含 reqSig）
  if (mode === "budget") {
    const budgetInput = (options as any)?.budgetInput as BudgetPdfInput | undefined;
    const budgetOpts = (options as any)?.budgetOpts as RenderBudgetPdfOpts | undefined;

    if (!budgetInput) {
      throw new Error("Missing budgetInput for mode=budget");
    }

    // ✅ 关键：budgetOpts 必须原样透传（包含 reqsig）
    const out = await renderBudgetPdfBuffer(budgetInput, {
      pdfVersion: budgetOpts?.pdfVersion || BUDGET_PDF_VERSION,
      reqsig: budgetOpts?.reqsig,
    });

    // 维持 route.ts 的兼容逻辑：返回 { pdfBytes, meta, summary }
    return out;
  }

  // ✅ 方案：直接回放 22 页金样板
  return await renderPlan22PdfBytes(planId);
}
