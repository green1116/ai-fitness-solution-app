import type { BIDDER_PROPOSAL_COMPOSER_VERSION } from "../shared/types";
import type { BudgetNarrativeComposition } from "../budget-narrative/types";
import type { CompetitiveNarrativeComposition } from "../competitive-narrative/types";
import type { EquipmentPlanComposition } from "../equipment-plan-composer/types";
import type { ExecutiveSummaryComposition } from "../executive-composer/types";
import type { TechnicalProposalComposition } from "../technical-composer/types";

export const PROPOSAL_VARIANT_COMPOSER_RUNTIME_VERSION = "v19.4-proposal-variant-composer-1" as const;

export interface FullProposalVariant {
  variantId: string;
  proposalLabel: string;
  bidderBrand: string;
  packageLabel: string;
  executive: ExecutiveSummaryComposition;
  technical: TechnicalProposalComposition;
  equipmentPlan: EquipmentPlanComposition;
  budgetNarrative: BudgetNarrativeComposition;
  competitiveNarrative: CompetitiveNarrativeComposition;
  variantReadiness: number;
}

export interface ProposalVariantComposerRuntimePayload {
  version: typeof PROPOSAL_VARIANT_COMPOSER_RUNTIME_VERSION;
  composerVersion: typeof BIDDER_PROPOSAL_COMPOSER_VERSION;
  variants: FullProposalVariant[];
  variantCount: number;
  variantSpreadScore: number;
  summary: string;
}
