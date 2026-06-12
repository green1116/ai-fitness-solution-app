import type { BIDDER_PROPOSAL_COMPOSER_VERSION } from "../shared/types";

export const BUDGET_NARRATIVE_COMPOSER_RUNTIME_VERSION = "v19.4-budget-narrative-composer-1" as const;

export interface BudgetNarrativeComposition {
  compositionId: string;
  proposalLabel: string;
  budgetLogic: string;
  costJustification: string;
  valueJustification: string;
  budgetReadiness: number;
}

export interface BudgetNarrativeComposerRuntimePayload {
  version: typeof BUDGET_NARRATIVE_COMPOSER_RUNTIME_VERSION;
  composerVersion: typeof BIDDER_PROPOSAL_COMPOSER_VERSION;
  composition: BudgetNarrativeComposition;
  budgetReadiness: number;
  summary: string;
}
