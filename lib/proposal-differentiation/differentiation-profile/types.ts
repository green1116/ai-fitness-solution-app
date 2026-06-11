import type { DIFFERENTIATION_BIDDER_BRANDS, PROPOSAL_DIFFERENTIATION_VERSION } from "../shared/types";
import type { BrandStrategySnapshot } from "../brand-strategy/types";
import type { BudgetStrategySnapshot } from "../budget-strategy/types";
import type { CompetitiveAdvantageSnapshot } from "../competitive-advantage/types";
import type { EquipmentStrategySnapshot } from "../equipment-strategy/types";
import type { ValuePropositionSnapshot } from "../value-proposition/types";

export const PROPOSAL_DIFFERENTIATION_RUNTIME_VERSION = "v19.2-proposal-differentiation-1" as const;

export interface ProposalDifferentiationProfile {
  profileId: string;
  proposalLabel: string;
  bidderBrand: (typeof DIFFERENTIATION_BIDDER_BRANDS)[number];
  tenderId: string;
  brandStrategy: BrandStrategySnapshot;
  valueProposition: ValuePropositionSnapshot;
  competitiveAdvantage: CompetitiveAdvantageSnapshot;
  equipmentStrategy: EquipmentStrategySnapshot;
  budgetStrategy: BudgetStrategySnapshot;
  differentiationScore: number;
  summary: string;
}

export interface ProposalDifferentiationRuntimePayload {
  version: typeof PROPOSAL_DIFFERENTIATION_RUNTIME_VERSION;
  differentiationVersion: typeof PROPOSAL_DIFFERENTIATION_VERSION;
  profile: ProposalDifferentiationProfile;
  allVariants: ProposalDifferentiationProfile[];
  differentiationScore: number;
  summary: string;
}
