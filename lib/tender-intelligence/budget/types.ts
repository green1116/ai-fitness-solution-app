import type { TENDER_INTELLIGENCE_VERSION } from "../shared/types";

export const BUDGET_INTELLIGENCE_RUNTIME_VERSION = "v12.0-budget-intelligence-runtime-1" as const;

export type BudgetTier = "economy" | "standard" | "premium" | "enterprise";

export type BudgetPressure = "low" | "moderate" | "high" | "critical";

export type CostSensitivity = "price-driven" | "balanced" | "value-driven" | "quality-driven";

export interface BudgetIntelligence {
  intelligenceId: string;
  budgetTier: BudgetTier;
  budgetPressure: BudgetPressure;
  costSensitivity: CostSensitivity;
  estimatedBudgetCny: number;
  summary: string;
}

export interface BudgetIntelligenceRuntimePayload {
  version: typeof BUDGET_INTELLIGENCE_RUNTIME_VERSION;
  intelligenceVersion: typeof TENDER_INTELLIGENCE_VERSION;
  budget: BudgetIntelligence;
  summary: string;
}
