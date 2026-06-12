import { buildProposalContext } from "../bridge/context-bridge";
import type { ComposerBidderBrand } from "../shared/types";

export function buildCompetitiveNarrativeComposition(input?: {
  deploymentId?: string;
  bidderBrand?: ComposerBidderBrand;
}) {
  const deploymentId = input?.deploymentId ?? "competitive-narrative-composer-default";
  const bidderBrand = input?.bidderBrand ?? "Technogym";
  const ctx = buildProposalContext({ deploymentId, bidderBrand });
  const matrix = ctx.differentiationContext.competitiveAdvantage.matrix;

  const competitiveAdvantage = [
    `Differentiation score: ${ctx.differentiationContext.differentiationScore}%`,
    ctx.differentiationContext.valueProposition.competitivePosition,
    ctx.differentiationContext.brandStrategy.selectedStrategy.positioning,
  ].join("; ");

  const differentiationReadiness = Math.round(
    ctx.differentiationContext.differentiationScore * 0.6 +
      ctx.differentiationContext.competitiveAdvantage.advantageScore * 0.4,
  );

  return {
    compositionId: `competitive-narrative-${bidderBrand}-${deploymentId}`,
    proposalLabel: ctx.proposalLabel,
    competitiveAdvantage,
    brandAdvantage: matrix.brandAdvantage.join("; "),
    serviceAdvantage: matrix.serviceAdvantage.join("; "),
    deliveryAdvantage: matrix.deliveryAdvantage.join("; "),
    differentiationReadiness: Math.min(100, differentiationReadiness),
  };
}
