/**
 * V59 Product Engine — Budget (V58 Status Sync + Event)
 */

import type { QuoteOrchestrationStepResult } from "@/lib/quote-lifecycle";

import type { BudgetStructure } from "./types";

export type BudgetEngineInput = {
  quoteId: string;
  workspaceId: string;
  companySize: number;
  budgetTier: "low" | "mid" | "high";
  orchestrationSteps?: QuoteOrchestrationStepResult[];
};

export type BudgetEngineResult = {
  structure: BudgetStructure;
  syncedStatus: string;
};

const TIER_MULTIPLIER: Record<BudgetEngineInput["budgetTier"], number> = {
  low: 800,
  mid: 1200,
  high: 1800,
};

export function runBudgetEngine(input: BudgetEngineInput): BudgetEngineResult {
  const base = TIER_MULTIPLIER[input.budgetTier] * input.companySize;
  const statusStep = input.orchestrationSteps?.find((s) => s.step === "status");
  const syncedStatus = statusStep?.status ?? "synced";

  const structure: BudgetStructure = {
    currency: "CNY",
    totalMin: Math.round(base * 0.85),
    totalMax: Math.round(base * 1.15),
    items: [
      { category: "有氧设备", min: Math.round(base * 0.25), max: Math.round(base * 0.32) },
      { category: "力量设备", min: Math.round(base * 0.3), max: Math.round(base * 0.38) },
      { category: "辅材与施工", min: Math.round(base * 0.2), max: Math.round(base * 0.25) },
      { category: "运维预留", min: Math.round(base * 0.1), max: Math.round(base * 0.15) },
    ],
    assumptions: [
      `基于 quoteId=${input.quoteId} 的方案规模估算`,
      `预算档位：${input.budgetTier}`,
      `Status Sync：${syncedStatus}`,
    ],
  };

  return { structure, syncedStatus };
}
