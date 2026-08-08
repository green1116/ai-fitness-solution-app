/** @scaffold BLP-PDF-002 */
import { v80Persist } from "../runtime/store";
import { renderMinimalPdfPage } from "./_render.util";

export async function renderBudgetPdfScaffold(input: {
  budgetId: string;
  level: "brand" | "government";
}): Promise<Uint8Array> {
  const budget = await v80Persist.getBudget(input.budgetId);
  const lines = budget
    ? [`Budget: ${input.budgetId}`, `Tier: ${budget.tier}`, `Total: ${budget.totalAmount}`, `Level: ${input.level}`]
    : [`Budget: ${input.budgetId}`, `Level: ${input.level}`, "Status: placeholder"];

  return renderMinimalPdfPage({ title: "V80 Budget PDF", lines });
}
