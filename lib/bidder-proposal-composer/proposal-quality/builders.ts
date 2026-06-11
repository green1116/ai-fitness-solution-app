import { buildProposalContext } from "../bridge/context-bridge";
import { buildAllProposalVariants } from "../proposal-variant/builders";
import { COMPOSER_BIDDER_BRANDS, type ComposerBidderBrand } from "../shared/types";
import type { ProposalQualityAssessment } from "./types";

export function buildProposalQualityAssessment(input: {
  deploymentId: string;
  bidderBrand: ComposerBidderBrand;
}): ProposalQualityAssessment {
  const { deploymentId, bidderBrand } = input;
  const ctx = buildProposalContext({ deploymentId, bidderBrand });
  const { variants } = buildAllProposalVariants({ deploymentId });
  const variant = variants.find((v) => v.bidderBrand === bidderBrand)!;

  const completenessChecks = [
    variant.executive.executiveSummary.length > 50,
    variant.technical.technicalScope.length > 30,
    variant.equipmentPlan.equipmentPlan.length > 20,
    variant.budgetNarrative.budgetLogic.length > 30,
    variant.competitiveNarrative.competitiveAdvantage.length > 20,
  ];
  const completeness = Math.round((completenessChecks.filter(Boolean).length / completenessChecks.length) * 100);

  const brandMatch = variant.executive.strategicPosition.toLowerCase().includes(
    bidderBrand === "Shuhua" ? "value" : bidderBrand === "Matrix" ? "balance" : bidderBrand === "Technogym" ? "premium" : "reliab",
  ) || variant.executive.strategicPosition.length > 20;
  const equipmentMatch = variant.equipmentPlan.equipmentPlan.includes(ctx.equipmentContext.packageLabel);
  const budgetMatch = variant.budgetNarrative.budgetLogic.includes(String(ctx.budgetContext.totalBudgetMin).slice(0, 4));
  const consistency = Math.round(
    ([brandMatch, equipmentMatch, budgetMatch].filter(Boolean).length / 3) * 100,
  );

  const differentiation = Math.round(
    ctx.differentiationContext.differentiationScore * 0.5 +
      variant.competitiveNarrative.differentiationReadiness * 0.5,
  );

  const bidderAlignment = Math.min(100, Math.round(ctx.bidderContext.profileReadiness * 0.6 + variant.variantReadiness * 0.4));
  const brandAlignment = Math.min(100, Math.round(ctx.brandContext.intelligenceScore * 0.7 + (brandMatch ? 30 : 0)));
  const equipmentAlignment = Math.min(100, Math.round(
    ctx.differentiationContext.equipmentStrategy.equipmentStrategyScore * 0.6 + (equipmentMatch ? 40 : 0),
  ));
  const budgetAlignment = Math.min(100, Math.round(
    ctx.differentiationContext.budgetStrategy.budgetStrategyScore * 0.6 + (budgetMatch ? 40 : 0),
  ));

  const qualityScore = Math.round(
    completeness * 0.2 +
      consistency * 0.15 +
      differentiation * 0.15 +
      bidderAlignment * 0.15 +
      brandAlignment * 0.15 +
      equipmentAlignment * 0.1 +
      budgetAlignment * 0.1,
  );

  return {
    assessmentId: `quality-${bidderBrand}-${deploymentId}`,
    proposalLabel: ctx.proposalLabel,
    bidderBrand,
    completeness,
    consistency,
    differentiation,
    bidderAlignment,
    brandAlignment,
    equipmentAlignment,
    budgetAlignment,
    qualityScore: Math.min(100, qualityScore),
  };
}

export function buildAllProposalQualityAssessments(input?: { deploymentId?: string }): {
  assessments: ProposalQualityAssessment[];
  averageQualityScore: number;
  qualityReadiness: number;
} {
  const deploymentId = input?.deploymentId ?? "proposal-quality-default";
  const assessments = COMPOSER_BIDDER_BRANDS.map((brand) =>
    buildProposalQualityAssessment({ deploymentId, bidderBrand: brand }),
  );
  const averageQualityScore = Math.round(
    assessments.reduce((s, a) => s + a.qualityScore, 0) / assessments.length,
  );
  const qualityReadiness = Math.round(
    assessments.reduce((s, a) => s + a.completeness + a.consistency, 0) / (assessments.length * 2),
  );
  return { assessments, averageQualityScore, qualityReadiness: Math.min(100, qualityReadiness) };
}
