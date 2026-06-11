import { buildEquipmentDifferentiationSnapshot } from "@/lib/equipment-selection/equipment-differentiation/builders";
import { buildProposalContextBundle } from "../proposal-context/builders";
import { buildExecutiveSummaryComposition } from "../executive-composer/builders";
import { buildTechnicalProposalComposition } from "../technical-composer/builders";
import { buildBudgetNarrativeComposition } from "../budget-narrative/builders";
import { buildCompetitiveNarrativeComposition } from "../competitive-narrative/builders";
import { buildAllProposalQualityAssessments } from "../proposal-quality/builders";
import { buildAllProposalVariants } from "../proposal-variant/builders";
import { COMPOSER_BIDDER_BRANDS } from "../shared/types";
import type { BidderProposalDashboardMetrics } from "./types";

export function buildBidderProposalDashboardMetrics(input?: {
  deploymentId?: string;
}): BidderProposalDashboardMetrics {
  const deploymentId = input?.deploymentId ?? "bidder-proposal-dashboard-default";

  const contextScores = COMPOSER_BIDDER_BRANDS.map(
    (brand) => buildProposalContextBundle({ deploymentId, bidderBrand: brand }).contextReadiness,
  );
  const executiveScores = COMPOSER_BIDDER_BRANDS.map(
    (brand) => buildExecutiveSummaryComposition({ deploymentId, bidderBrand: brand }).executiveReadiness,
  );
  const technicalScores = COMPOSER_BIDDER_BRANDS.map(
    (brand) => buildTechnicalProposalComposition({ deploymentId, bidderBrand: brand }).technicalReadiness,
  );
  const budgetScores = COMPOSER_BIDDER_BRANDS.map(
    (brand) => buildBudgetNarrativeComposition({ deploymentId, bidderBrand: brand }).budgetReadiness,
  );
  const diffScores = COMPOSER_BIDDER_BRANDS.map(
    (brand) => buildCompetitiveNarrativeComposition({ deploymentId, bidderBrand: brand }).differentiationReadiness,
  );

  const quality = buildAllProposalQualityAssessments({ deploymentId });
  const { variantSpreadScore } = buildAllProposalVariants({ deploymentId });
  const equipDiff = buildEquipmentDifferentiationSnapshot({ deploymentId });

  const avg = (scores: number[]) => Math.round(scores.reduce((s, v) => s + v, 0) / scores.length);

  const contextReadiness = avg(contextScores);
  const executiveReadiness = avg(executiveScores);
  const technicalReadiness = avg(technicalScores);
  const budgetReadiness = avg(budgetScores);
  const differentiationReadiness = avg(diffScores);
  const qualityReadiness = quality.qualityReadiness;

  const proposalDifferentiationScore = Math.min(
    100,
    Math.round(
      equipDiff.equipmentDifferentiationScore * 0.5 +
        variantSpreadScore * 0.25 +
        differentiationReadiness * 0.25,
    ),
  );

  const brandAlignmentScore = Math.round(
    quality.assessments.reduce((s, a) => s + a.brandAlignment, 0) / quality.assessments.length,
  );
  const equipmentAlignmentScore = Math.round(
    quality.assessments.reduce((s, a) => s + a.equipmentAlignment, 0) / quality.assessments.length,
  );
  const budgetAlignmentScore = Math.round(
    quality.assessments.reduce((s, a) => s + a.budgetAlignment, 0) / quality.assessments.length,
  );

  return {
    contextReadiness,
    executiveReadiness,
    technicalReadiness,
    budgetReadiness,
    differentiationReadiness,
    qualityReadiness,
    proposalDifferentiationScore,
    brandAlignmentScore,
    equipmentAlignmentScore,
    budgetAlignmentScore,
    summary: [
      "bidder-proposal-dashboard",
      `proposalDifferentiationScore=${proposalDifferentiationScore}%`,
      `context=${contextReadiness}%`,
      `executive=${executiveReadiness}%`,
      `technical=${technicalReadiness}%`,
      `budget=${budgetReadiness}%`,
      `differentiation=${differentiationReadiness}%`,
      `quality=${qualityReadiness}%`,
    ].join(" "),
  };
}
