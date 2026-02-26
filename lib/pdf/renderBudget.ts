// lib/pdf/renderBudget.ts
import type { BudgetPdfInput, RenderBudgetPdfOpts } from "@/lib/pdf/budgetRender";
import { renderBudgetPdfBuffer } from "@/lib/pdf/budgetRender";

export default async function renderBudget(
  input: BudgetPdfInput,
  opts: RenderBudgetPdfOpts
): Promise<Uint8Array> {
  return renderBudgetPdfBuffer(input, opts);
}

export { renderBudgetPdfBuffer };
export type { BudgetPdfInput, RenderBudgetPdfOpts };