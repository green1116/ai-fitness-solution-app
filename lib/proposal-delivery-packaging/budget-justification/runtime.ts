import { finalizeRuntime, runStage } from "../shared/runtime";
import type { PackagingRuntimeResult, PackagingStageResult } from "../shared/types";
import { PROPOSAL_DELIVERY_PACKAGING_VERSION } from "../shared/types";
import { buildBudgetJustificationProfile } from "./builders";
import type { BudgetJustificationRuntimePayload } from "./types";
import { BUDGET_JUSTIFICATION_RUNTIME_VERSION } from "./types";

export function validateBudgetJustificationRuntime(input?: {
  deploymentId?: string;
  bidderBrand?: import("../shared/types").PackagingBidderBrand;
}): { valid: boolean } {
  const p = buildBudgetJustificationProfile(input);
  return { valid: p.budgetAlignmentScore >= 70 && p.costJustification.length > 80 };
}

export function runBudgetJustificationRuntime(input?: {
  deploymentId?: string;
  bidderBrand?: import("../shared/types").PackagingBidderBrand;
}): PackagingRuntimeResult<BudgetJustificationRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "budget-justification-default";
  const stages: PackagingStageResult[] = [];

  const profile = runStage("budget-justification-build", "Budget Justification", () => buildBudgetJustificationProfile(input), stages);
  const validation = runStage("budget-justification-validate", "Budget Justification Validation", () => validateBudgetJustificationRuntime(input), stages);
  if (!validation.valid) throw new Error("Budget justification validation failed");

  const payload: BudgetJustificationRuntimePayload = {
    version: BUDGET_JUSTIFICATION_RUNTIME_VERSION,
    packagingVersion: PROPOSAL_DELIVERY_PACKAGING_VERSION,
    profile,
    budgetReadiness: profile.budgetAlignmentScore,
    summary: `budget-justification ${profile.proposalLabel} alignment=${profile.budgetAlignmentScore}%`,
  };

  return finalizeRuntime({ domain: "budget-justification", deploymentId, stages, payload, summary: payload.summary });
}
