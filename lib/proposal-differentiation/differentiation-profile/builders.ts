import { buildBrandStrategySnapshot } from "../brand-strategy/builders";
import { buildBudgetStrategySnapshot } from "../budget-strategy/builders";
import { buildDifferentiationTenderContext } from "../bridge/tender-context";
import { buildCompetitiveAdvantageSnapshot } from "../competitive-advantage/builders";
import { buildEquipmentStrategySnapshot } from "../equipment-strategy/builders";
import { DIFFERENTIATION_BIDDER_BRANDS, type DifferentiationBidderBrand } from "../shared/types";
import { buildValuePropositionSnapshot } from "../value-proposition/builders";
import type { ProposalDifferentiationProfile } from "./types";

const PROPOSAL_LABELS: Record<DifferentiationBidderBrand, string> = {
  Technogym: "Proposal A",
  "Life Fitness": "Proposal B",
  Matrix: "Proposal C",
  Shuhua: "Proposal D",
};

function computeDifferentiationScore(input: {
  brandScore: number;
  propositionScore: number;
  advantageScore: number;
  equipmentScore: number;
  budgetScore: number;
}): number {
  return Math.round(
    input.brandScore * 0.2 +
      input.propositionScore * 0.25 +
      input.advantageScore * 0.2 +
      input.equipmentScore * 0.2 +
      input.budgetScore * 0.15,
  );
}

export function buildProposalDifferentiationProfile(input: {
  deploymentId: string;
  bidderBrand: DifferentiationBidderBrand;
}): ProposalDifferentiationProfile {
  const { deploymentId, bidderBrand } = input;
  const tender = buildDifferentiationTenderContext({ deploymentId, bidderBrand });

  const brandStrategy = buildBrandStrategySnapshot({ deploymentId, bidderBrand });
  const valueProposition = buildValuePropositionSnapshot({ deploymentId, bidderBrand });
  const competitiveAdvantage = buildCompetitiveAdvantageSnapshot({ deploymentId, bidderBrand });
  const equipmentStrategy = buildEquipmentStrategySnapshot({ deploymentId, bidderBrand });
  const budgetStrategy = buildBudgetStrategySnapshot({ deploymentId, bidderBrand });

  const differentiationScore = computeDifferentiationScore({
    brandScore: brandStrategy.strategyScore,
    propositionScore: valueProposition.propositionScore,
    advantageScore: competitiveAdvantage.advantageScore,
    equipmentScore: equipmentStrategy.equipmentStrategyScore,
    budgetScore: budgetStrategy.budgetStrategyScore,
  });

  return {
    profileId: `diff-profile-${bidderBrand}-${deploymentId}`,
    proposalLabel: PROPOSAL_LABELS[bidderBrand],
    bidderBrand,
    tenderId: tender.tenderId,
    brandStrategy,
    valueProposition,
    competitiveAdvantage,
    equipmentStrategy,
    budgetStrategy,
    differentiationScore,
    summary: `${PROPOSAL_LABELS[bidderBrand]} (${bidderBrand}) score=${differentiationScore}% — ${valueProposition.competitivePosition}`,
  };
}

export function buildAllProposalVariants(input?: {
  deploymentId?: string;
  bidderBrand?: DifferentiationBidderBrand;
}): {
  primary: ProposalDifferentiationProfile;
  allVariants: ProposalDifferentiationProfile[];
} {
  const deploymentId = input?.deploymentId ?? "proposal-differentiation-default";
  const allVariants = DIFFERENTIATION_BIDDER_BRANDS.map((brand) =>
    buildProposalDifferentiationProfile({ deploymentId, bidderBrand: brand }),
  );
  const primaryBrand = input?.bidderBrand ?? "Technogym";
  const primary = allVariants.find((v) => v.bidderBrand === primaryBrand) ?? allVariants[0];

  return { primary, allVariants };
}
