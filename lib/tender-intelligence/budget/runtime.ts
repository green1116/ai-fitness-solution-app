import { finalizeRuntime, runStage } from "../shared/runtime";
import type {
  TenderIntelligenceRuntimeResult,
  TenderIntelligenceStageResult,
} from "../shared/types";
import { TENDER_INTELLIGENCE_VERSION } from "../shared/types";
import { buildBudgetIntelligence } from "./builders";
import type { BudgetIntelligenceRuntimePayload } from "./types";
import { BUDGET_INTELLIGENCE_RUNTIME_VERSION } from "./types";

export function validateBudgetIntelligenceRuntime(input?: { deploymentId?: string }): { valid: boolean } {
  const deploymentId = input?.deploymentId ?? "budget-default";
  const budget = buildBudgetIntelligence({ deploymentId });
  return { valid: budget.estimatedBudgetCny > 0 && budget.summary.length > 0 };
}

export function runBudgetIntelligenceRuntime(input?: {
  deploymentId?: string;
}): TenderIntelligenceRuntimeResult<BudgetIntelligenceRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "budget-default";
  const stages: TenderIntelligenceStageResult[] = [];

  const budget = runStage("budget-intelligence", "Budget Intelligence", () => buildBudgetIntelligence({ deploymentId }), stages);
  const validation = runStage("budget-validate", "Budget Validation", () => validateBudgetIntelligenceRuntime({ deploymentId }), stages);
  if (!validation.valid) throw new Error("Budget intelligence validation failed");

  const payload: BudgetIntelligenceRuntimePayload = {
    version: BUDGET_INTELLIGENCE_RUNTIME_VERSION,
    intelligenceVersion: TENDER_INTELLIGENCE_VERSION,
    budget,
    summary: `budget-intelligence tier=${budget.budgetTier} pressure=${budget.budgetPressure} sensitivity=${budget.costSensitivity}`,
  };

  return finalizeRuntime({ domain: "budget-intelligence", deploymentId, stages, payload, summary: payload.summary });
}
