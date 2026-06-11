import { finalizeRuntime, runStage } from "../shared/runtime";
import type { SelectionRuntimeResult, SelectionStageResult } from "../shared/types";
import { EQUIPMENT_SELECTION_VERSION } from "../shared/types";
import { buildBudgetPackageSnapshot } from "./builders";
import type { BudgetPackageRuntimePayload } from "./types";
import { BUDGET_PACKAGE_RUNTIME_VERSION } from "./types";

export function validateBudgetPackageRuntime(input?: { deploymentId?: string }): { valid: boolean } {
  const snapshot = buildBudgetPackageSnapshot(input);
  return {
    valid:
      snapshot.budgetPackageReadiness > 0 &&
      snapshot.premiumBudgetPackage.totalBudgetMin > snapshot.valueBudgetPackage.totalBudgetMin,
  };
}

export function runBudgetPackageRuntime(input?: {
  deploymentId?: string;
}): SelectionRuntimeResult<BudgetPackageRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "budget-package-default";
  const stages: SelectionStageResult[] = [];

  const snapshot = runStage("budget-package-build", "Budget Package", () => buildBudgetPackageSnapshot({ deploymentId }), stages);
  const validation = runStage("budget-package-validate", "Budget Validation", () => validateBudgetPackageRuntime({ deploymentId }), stages);
  if (!validation.valid) throw new Error("Budget package validation failed");

  const payload: BudgetPackageRuntimePayload = {
    version: BUDGET_PACKAGE_RUNTIME_VERSION,
    selectionVersion: EQUIPMENT_SELECTION_VERSION,
    snapshot,
    budgetPackageReadiness: snapshot.budgetPackageReadiness,
    summary: `budget-package premium=${snapshot.premiumBudgetPackage.totalBudgetMin} balanced=${snapshot.balancedBudgetPackage.totalBudgetMin} value=${snapshot.valueBudgetPackage.totalBudgetMin} readiness=${snapshot.budgetPackageReadiness}%`,
  };

  return finalizeRuntime({ domain: "budget-package", deploymentId, stages, payload, summary: payload.summary });
}
