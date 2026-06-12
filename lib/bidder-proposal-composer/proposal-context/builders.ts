import { buildProposalContext } from "../bridge/context-bridge";
import type { ComposerBidderBrand } from "../shared/types";

export function computeContextReadiness(context: ReturnType<typeof buildProposalContext>): number {
  const checks = [
    context.tenderContext.tenderId.length > 0,
    context.bidderContext.profileReadiness > 0,
    context.brandContext.intelligenceScore > 0,
    context.equipmentContext.equipmentList.length >= 2,
    context.budgetContext.totalBudgetMin > 0,
    context.differentiationContext.differentiationScore > 0,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

export function buildProposalContextBundle(input?: {
  deploymentId?: string;
  bidderBrand?: ComposerBidderBrand;
}) {
  const deploymentId = input?.deploymentId ?? "proposal-context-default";
  const bidderBrand = input?.bidderBrand ?? "Technogym";
  const context = buildProposalContext({ deploymentId, bidderBrand });
  return { context, contextReadiness: computeContextReadiness(context) };
}
