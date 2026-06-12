import type { PROPOSAL_DELIVERY_PACKAGING_VERSION } from "../shared/types";

export const BUDGET_JUSTIFICATION_RUNTIME_VERSION = "v19.5-budget-justification-1" as const;

export interface BudgetJustificationProfile {
  profileId: string;
  proposalLabel: string;
  bidderBrand: string;
  costJustification: string;
  procurementJustification: string;
  brandPremiumJustification: string;
  budgetTotal: number;
  budgetAlignmentScore: number;
}

export interface BudgetJustificationRuntimePayload {
  version: typeof BUDGET_JUSTIFICATION_RUNTIME_VERSION;
  packagingVersion: typeof PROPOSAL_DELIVERY_PACKAGING_VERSION;
  profile: BudgetJustificationProfile;
  budgetReadiness: number;
  summary: string;
}
