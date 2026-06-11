import { finalizeRuntime, runStage } from "../shared/runtime";
import type { ComposerRuntimeResult, ComposerStageResult } from "../shared/types";
import { BIDDER_PROPOSAL_COMPOSER_VERSION } from "../shared/types";
import { buildBudgetNarrativeComposition } from "./builders";
import type { BudgetNarrativeComposerRuntimePayload } from "./types";
import { BUDGET_NARRATIVE_COMPOSER_RUNTIME_VERSION } from "./types";

export function validateBudgetNarrativeComposerRuntime(input?: {
  deploymentId?: string;
  bidderBrand?: import("../shared/types").ComposerBidderBrand;
}): { valid: boolean } {
  const c = buildBudgetNarrativeComposition(input);
  return { valid: c.budgetReadiness > 0 && c.budgetLogic.length > 30 };
}

export function runBudgetNarrativeComposerRuntime(input?: {
  deploymentId?: string;
  bidderBrand?: import("../shared/types").ComposerBidderBrand;
}): ComposerRuntimeResult<BudgetNarrativeComposerRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "budget-narrative-composer-default";
  const stages: ComposerStageResult[] = [];

  const composition = runStage("budget-narrative-composer-build", "Budget Narrative Composer", () => buildBudgetNarrativeComposition(input), stages);
  const validation = runStage("budget-narrative-composer-validate", "Budget Narrative Validation", () => validateBudgetNarrativeComposerRuntime(input), stages);
  if (!validation.valid) throw new Error("Budget narrative composer validation failed");

  const payload: BudgetNarrativeComposerRuntimePayload = {
    version: BUDGET_NARRATIVE_COMPOSER_RUNTIME_VERSION,
    composerVersion: BIDDER_PROPOSAL_COMPOSER_VERSION,
    composition,
    budgetReadiness: composition.budgetReadiness,
    summary: `budget-narrative-composer ${composition.proposalLabel} readiness=${composition.budgetReadiness}%`,
  };

  return finalizeRuntime({ domain: "budget-narrative-composer", deploymentId, stages, payload, summary: payload.summary });
}
