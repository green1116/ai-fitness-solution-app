import { buildProposalContext } from "../bridge/context-bridge";
import type { ComposerBidderBrand } from "../shared/types";

export function buildEquipmentPlanComposition(input?: {
  deploymentId?: string;
  bidderBrand?: ComposerBidderBrand;
}) {
  const deploymentId = input?.deploymentId ?? "equipment-plan-composer-default";
  const bidderBrand = input?.bidderBrand ?? "Technogym";
  const ctx = buildProposalContext({ deploymentId, bidderBrand });
  const equip = ctx.differentiationContext.equipmentStrategy;

  const equipmentPlan = `${ctx.equipmentContext.packageLabel}: ${ctx.equipmentContext.equipmentList.map((i) => `${i.modelName}×${i.quantity}`).join(", ")}. Total units: ${ctx.equipmentContext.equipmentList.reduce((s, i) => s + i.quantity, 0)}.`;

  const modelJustification = ctx.equipmentContext.equipmentList.map(
    (item) => `${item.modelName}: selected for ${item.category} zone — ${ctx.brandContext.competitiveAdvantages[0] ?? "brand fit"}`,
  );

  const equipmentPlanReadiness = Math.round(
    equip.equipmentStrategyScore * 0.6 +
      (modelJustification.length / ctx.equipmentContext.equipmentList.length) * 40,
  );

  return {
    compositionId: `equipment-plan-${bidderBrand}-${deploymentId}`,
    proposalLabel: ctx.proposalLabel,
    equipmentPlan,
    modelJustification,
    upgradePath: equip.upgradePath,
    equipmentPlanReadiness: Math.min(100, equipmentPlanReadiness),
  };
}
