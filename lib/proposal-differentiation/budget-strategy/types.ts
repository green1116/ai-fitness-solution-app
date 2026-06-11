import type { DIFFERENTIATION_BIDDER_BRANDS, PROPOSAL_DIFFERENTIATION_VERSION } from "../shared/types";

export const BUDGET_STRATEGY_RUNTIME_VERSION = "v19.2-budget-strategy-1" as const;

export interface BudgetStrategyOption {
  strategyId: string;
  tier: "premium" | "mid" | "value";
  label: string;
  totalBudgetMin: number;
  totalBudgetMax: number;
  currency: string;
  equipmentCount: number;
  rationale: string;
}

export interface BudgetStrategySnapshot {
  snapshotId: string;
  bidderBrand: (typeof DIFFERENTIATION_BIDDER_BRANDS)[number];
  selectedStrategy: BudgetStrategyOption;
  premiumBudgetStrategy: BudgetStrategyOption;
  midBudgetStrategy: BudgetStrategyOption;
  valueBudgetStrategy: BudgetStrategyOption;
  budgetStrategyScore: number;
}

export interface BudgetStrategyRuntimePayload {
  version: typeof BUDGET_STRATEGY_RUNTIME_VERSION;
  differentiationVersion: typeof PROPOSAL_DIFFERENTIATION_VERSION;
  snapshot: BudgetStrategySnapshot;
  budgetStrategyScore: number;
  summary: string;
}
