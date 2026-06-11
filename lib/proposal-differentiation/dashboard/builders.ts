import { buildAllProposalVariants } from "../differentiation-profile/builders";
import { DIFFERENTIATION_BIDDER_BRANDS } from "../shared/types";

export function buildDifferentiationDashboardMetrics(input?: {
  deploymentId?: string;
}): {
  brandDifferentiation: number;
  budgetDifferentiation: number;
  equipmentDifferentiation: number;
  proposalDifferentiation: number;
  differentiationScore: number;
  variantScores: Array<{ bidderBrand: string; proposalLabel: string; score: number }>;
  summary: string;
} {
  const deploymentId = input?.deploymentId ?? "differentiation-dashboard-default";
  const { allVariants } = buildAllProposalVariants({ deploymentId });

  const brandScores = allVariants.map((v) => v.brandStrategy.strategyScore);
  const budgetScores = allVariants.map((v) => v.budgetStrategy.budgetStrategyScore);
  const equipmentScores = allVariants.map((v) => v.equipmentStrategy.equipmentStrategyScore);
  const proposalScores = allVariants.map((v) => v.differentiationScore);

  const spread = (scores: number[]) => Math.max(...scores) - Math.min(...scores);
  const avg = (scores: number[]) => Math.round(scores.reduce((s, v) => s + v, 0) / scores.length);

  const brandDifferentiation = Math.min(100, Math.round(spread(brandScores) * 2 + avg(brandScores) * 0.3));
  const budgetDifferentiation = Math.min(100, Math.round(spread(budgetScores) * 3 + avg(budgetScores) * 0.2));
  const equipmentDifferentiation = Math.min(100, Math.round(spread(equipmentScores) * 2.5 + avg(equipmentScores) * 0.3));
  const proposalDifferentiation = Math.min(100, Math.round(spread(proposalScores) * 2 + avg(proposalScores) * 0.4));

  const differentiationScore = Math.round(
    (brandDifferentiation + budgetDifferentiation + equipmentDifferentiation + proposalDifferentiation) / 4,
  );

  const variantScores = DIFFERENTIATION_BIDDER_BRANDS.map((brand) => {
    const variant = allVariants.find((v) => v.bidderBrand === brand)!;
    return {
      bidderBrand: brand,
      proposalLabel: variant.proposalLabel,
      score: variant.differentiationScore,
    };
  });

  return {
    brandDifferentiation,
    budgetDifferentiation,
    equipmentDifferentiation,
    proposalDifferentiation,
    differentiationScore,
    variantScores,
    summary: `differentiation-dashboard score=${differentiationScore}% brand=${brandDifferentiation}% budget=${budgetDifferentiation}% equipment=${equipmentDifferentiation}% proposal=${proposalDifferentiation}%`,
  };
}
