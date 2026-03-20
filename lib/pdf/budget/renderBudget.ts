// lib/pdf/budget/renderBudget.ts — 预算专用入口
import type { BudgetPdfInput, RenderBudgetPdfOpts } from "@/lib/pdf/budgetRender";
import { renderBudgetPdfBuffer } from "@/lib/pdf/budgetRender";

export type { BudgetPdfInput, RenderBudgetPdfOpts };

export default async function renderBudget(
  input: BudgetPdfInput,
  opts: RenderBudgetPdfOpts
): Promise<Uint8Array | { pdfBytes: Uint8Array; meta?: any; summary?: any }> {
  return renderBudgetPdfBuffer(input, opts);
}

export { renderBudgetPdfBuffer };
