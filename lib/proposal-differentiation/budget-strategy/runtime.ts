import { finalizeRuntime, runStage } from "../shared/runtime";
import type { DifferentiationRuntimeResult, DifferentiationStageResult } from "../shared/types";
import { PROPOSAL_DIFFERENTIATION_VERSION } from "../shared/types";
import { buildBudgetStrategySnapshot } from "./builders";
import type { BudgetStrategyRuntimePayload } from "./types";
import { BUDGET_STRATEGY_RUNTIME_VERSION } from "./types";

export function validateBudgetStrategyRuntime(input?: {
  deploymentId?: string;
  bidderBrand?: import("../shared/types").DifferentiationBidderBrand;
}): { valid: boolean } {
  const snapshot = buildBudgetStrategySnapshot(input);
  return { valid: snapshot.budgetStrategyScore > 0 && snapshot.selectedStrategy.equipmentCount >= 2 };
}

export function runBudgetStrategyRuntime(input?: {
  deploymentId?: string;
  bidderBrand?: import("../shared/types").DifferentiationBidderBrand;
}): DifferentiationRuntimeResult<BudgetStrategyRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "budget-strategy-default";
  const stages: DifferentiationStageResult[] = [];

  const snapshot = runStage("budget-strategy-build", "Budget Strategy", () => buildBudgetStrategySnapshot(input), stages);
  const validation = runStage("budget-strategy-validate", "Budget Validation", () => validateBudgetStrategyRuntime(input), stages);
  if (!validation.valid) throw new Error("Budget strategy validation failed");

  const payload: BudgetStrategyRuntimePayload = {
    version: BUDGET_STRATEGY_RUNTIME_VERSION,
    differentiationVersion: PROPOSAL_DIFFERENTIATION_VERSION,
    snapshot,
    budgetStrategyScore: snapshot.budgetStrategyScore,
    summary: `budget-strategy bidder=${snapshot.bidderBrand} tier=${snapshot.selectedStrategy.tier} budget=${snapshot.selectedStrategy.totalBudgetMin} score=${snapshot.budgetStrategyScore}`,
  };

  return finalizeRuntime({ domain: "budget-strategy", deploymentId, stages, payload, summary: payload.summary });
}
