/**
 * V64 P1 — Budget demo engine (canonical gym-budget, no demo pricing stub)
 */

import { buildBudgetSummary } from "@/lib/gym-budget";
import type { CompanySize, Range } from "@/lib/types/gym-budget";

import type { DemoBudgetOutput, DemoCompanyInput, DemoQuoteOutput } from "./demo.types";
import { fallbackDemoBudget } from "./demo.fallback";
import { mapDemoSizeBandToCompanySize } from "./demo.size-map";

const DEMO_BUDGET_TIER = "mid" as const;

function midpoint(range: Range): number {
  return Math.round((range.min + range.max) / 2);
}

export function generateDemoBudget(
  input: DemoCompanyInput,
  _quote?: DemoQuoteOutput,
): DemoBudgetOutput {
  const name = input.companyName?.trim();
  if (!name) return fallbackDemoBudget();

  const companySize = mapDemoSizeBandToCompanySize(input.companySize) as CompanySize;
  const summary = buildBudgetSummary(DEMO_BUDGET_TIER, companySize);

  const breakdown = summary.lines.map((line) => ({
    category: line.categoryName,
    amount: midpoint(line.subtotal),
  }));

  return {
    // Match visible lines: use estimatedBySubtotals (not independent overallTotal).
    total: midpoint(summary.estimatedBySubtotals),
    currency: "CNY",
    breakdown,
    mode: "demo-stub",
  };
}
