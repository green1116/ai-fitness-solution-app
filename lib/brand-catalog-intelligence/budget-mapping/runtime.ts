import { finalizeRuntime, runStage } from "../shared/runtime";
import type { BrandCatalogRuntimeResult, BrandCatalogStageResult } from "../shared/types";
import { BRAND_CATALOG_INTELLIGENCE_VERSION } from "../shared/types";
import { buildBudgetMappingSnapshot } from "./builders";
import type { BudgetMappingRuntimePayload } from "./types";
import { BUDGET_MAPPING_RUNTIME_VERSION } from "./types";

export function validateBudgetMappingRuntime(input?: { deploymentId?: string }): { valid: boolean } {
  const snapshot = buildBudgetMappingSnapshot(input);
  return {
    valid:
      snapshot.budgetMappingReadiness > 0 &&
      snapshot.lowBudgetProfile.equipmentItems.length >= 2 &&
      snapshot.midBudgetProfile.equipmentItems.length >= 2 &&
      snapshot.premiumBudgetProfile.equipmentItems.length >= 2,
  };
}

export function runBudgetMappingRuntime(input?: {
  deploymentId?: string;
}): BrandCatalogRuntimeResult<BudgetMappingRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "budget-mapping-default";
  const stages: BrandCatalogStageResult[] = [];

  const snapshot = runStage("budget-mapping-build", "Budget Mapping", () => buildBudgetMappingSnapshot({ deploymentId }), stages);
  const validation = runStage("budget-mapping-validate", "Budget Validation", () => validateBudgetMappingRuntime({ deploymentId }), stages);
  if (!validation.valid) throw new Error("Budget mapping validation failed");

  const payload: BudgetMappingRuntimePayload = {
    version: BUDGET_MAPPING_RUNTIME_VERSION,
    brandCatalogVersion: BRAND_CATALOG_INTELLIGENCE_VERSION,
    snapshot,
    budgetMappingReadiness: snapshot.budgetMappingReadiness,
    summary: `budget-mapping low=${snapshot.lowBudgetProfile.totalBudgetMin} mid=${snapshot.midBudgetProfile.totalBudgetMin} premium=${snapshot.premiumBudgetProfile.totalBudgetMin} readiness=${snapshot.budgetMappingReadiness}%`,
  };

  return finalizeRuntime({ domain: "budget-mapping", deploymentId, stages, payload, summary: payload.summary });
}
