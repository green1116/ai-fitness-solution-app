import { buildProposalContext } from "../bridge/context-bridge";
import type { ComposerBidderBrand } from "../shared/types";

export function buildTechnicalProposalComposition(input?: {
  deploymentId?: string;
  bidderBrand?: ComposerBidderBrand;
}) {
  const deploymentId = input?.deploymentId ?? "technical-composer-default";
  const bidderBrand = input?.bidderBrand ?? "Technogym";
  const ctx = buildProposalContext({ deploymentId, bidderBrand });
  const categories = Object.keys(ctx.equipmentContext.categoryDistribution);

  const technicalScope = `Complete fitness center solution for ${ctx.tenderContext.projectName} covering ${categories.join(", ")} zones with ${ctx.equipmentContext.equipmentList.reduce((s, i) => s + i.quantity, 0)} equipment units from ${ctx.bidderBrand}.`;

  const equipmentArchitecture = ctx.equipmentContext.equipmentList
    .map((item) => `${item.category}: ${item.modelName} × ${item.quantity} (${item.brandName})`)
    .join("; ");

  const deploymentLogic = `Phased deployment: Phase 1 cardio/functional (${ctx.bidderContext.deliveryCapabilities[0]?.region ?? "East China"}), Phase 2 strength/recovery. Lead time aligned with ${ctx.budgetContext.label}. On-time rate target: ${Math.round((ctx.bidderContext.deliveryCapabilities[0]?.onTimeRate ?? 0.9) * 100)}%.`;

  const technicalReadiness = Math.round(
    (categories.length / 4) * 50 +
      (ctx.equipmentContext.equipmentList.length / 3) * 50,
  );

  return {
    compositionId: `technical-${bidderBrand}-${deploymentId}`,
    proposalLabel: ctx.proposalLabel,
    technicalScope,
    equipmentArchitecture,
    deploymentLogic,
    technicalReadiness: Math.min(100, technicalReadiness),
  };
}
