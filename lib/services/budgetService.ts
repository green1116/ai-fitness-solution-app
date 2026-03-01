import { buildBudgetSummary } from "@/lib/gym-budget";
import type { BudgetSummary } from "@/lib/pdf/contracts/budgetSummary";

type Params = {
  planId: string;
  companyName?: string;
  companySize: number;
  budgetTier: "low" | "mid" | "high";
};

export async function getBudgetSummary(params: Params): Promise<BudgetSummary> {
  const raw: any = buildBudgetSummary(
    params.budgetTier as any,
    params.companySize as any
  );

  return {
    planId: params.planId,
    companyName: params.companyName,
    companySize: params.companySize,
    tier: params.budgetTier,

    overallTotal: raw.overallTotal,
    estimatedBySubtotals: raw.estimatedBySubtotals,

    lines: raw.lines || [],
    items: raw.items || [],

    assumptions: raw.notes || [],

    meta: {
      generatedAtISO: new Date().toISOString(),
    },
  };
}
