import { buildProposalContext } from "../bridge/context-bridge";
import type { ComposerBidderBrand } from "../shared/types";

const EXECUTIVE_STYLES: Record<ComposerBidderBrand, { style: "premium" | "balanced" | "value"; headline: string; position: string }> = {
  Technogym: {
    style: "premium",
    headline: "Flagship wellness experience powered by Italian design excellence and digital ecosystem integration",
    position: "Premium wellness leader — design-led differentiation for flagship campus fitness",
  },
  "Life Fitness": {
    style: "premium",
    headline: "Enterprise-grade reliability with proven durability and global service network coverage",
    position: "Commercial fitness leader — reliability and service network as core competitive moat",
  },
  Matrix: {
    style: "balanced",
    headline: "Balanced innovation delivering modern UX and competitive price-performance for campus fitness",
    position: "Commercial mid-market — optimal balance of features, footprint, and total cost",
  },
  Shuhua: {
    style: "value",
    headline: "Domestic value leader with compliance-friendly procurement and fastest delivery timeline",
    position: "Value procurement champion — lowest TCO with government procurement alignment",
  },
};

export function buildExecutiveSummaryComposition(input?: {
  deploymentId?: string;
  bidderBrand?: ComposerBidderBrand;
}): import("./types").ExecutiveSummaryComposition {
  const deploymentId = input?.deploymentId ?? "executive-composer-default";
  const bidderBrand = input?.bidderBrand ?? "Technogym";
  const ctx = buildProposalContext({ deploymentId, bidderBrand });
  const styleConfig = EXECUTIVE_STYLES[bidderBrand];

  const executiveSummary = [
    `${ctx.bidderContext.profile.displayName} proposes the ${ctx.equipmentContext.packageLabel} for ${ctx.tenderContext.projectName}.`,
    styleConfig.headline,
    `Equipment package includes ${ctx.equipmentContext.equipmentList.length} model lines with total budget estimate ¥${ctx.budgetContext.totalBudgetMin.toLocaleString()}.`,
    ctx.differentiationContext.valueProposition.differentiationMessage,
  ].join(" ");

  const executiveReadiness = Math.round(
    ctx.differentiationContext.valueProposition.propositionScore * 0.5 +
      ctx.brandContext.intelligenceScore * 0.5,
  );

  return {
    compositionId: `executive-${bidderBrand}-${deploymentId}`,
    proposalLabel: ctx.proposalLabel,
    style: styleConfig.style,
    executiveSummary,
    coreValue: ctx.differentiationContext.valueProposition.coreValue,
    strategicPosition: styleConfig.position,
    executiveReadiness: Math.min(100, executiveReadiness),
  };
}
