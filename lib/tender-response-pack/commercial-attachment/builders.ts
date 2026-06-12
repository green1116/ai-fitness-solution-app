import { buildLifecycleCostProfile } from "@/lib/proposal-delivery-packaging/lifecycle-cost/builders";
import { buildResponsePackContext } from "../bridge/response-bridge";
import type { ResponsePackBidderBrand } from "../shared/types";

export function buildCommercialPackage(input?: {
  deploymentId?: string;
  bidderBrand?: ResponsePackBidderBrand;
}) {
  const deploymentId = input?.deploymentId ?? "commercial-attachment-default";
  const bidderBrand = input?.bidderBrand ?? "Technogym";
  const ctx = buildResponsePackContext({ deploymentId, bidderBrand });
  const delivery = ctx.deliveryPackage;
  const lifecycle = buildLifecycleCostProfile({ deploymentId, bidderBrand });

  const budgetPackage = {
    totalMin: ctx.proposalContext.budgetContext.totalBudgetMin,
    totalMax: ctx.proposalContext.budgetContext.totalBudgetMax,
    perUnit: ctx.proposalContext.budgetContext.budgetPerUnit,
    equipmentCount: ctx.proposalContext.budgetContext.equipmentCount,
  };

  const roiNarrative = delivery.roiNarrative.investmentLogic;
  const tcoNarrative = [
    `Total TCO: ¥${delivery.tcoNarrative.totalTCO.toLocaleString()}`,
    `Acquisition: ¥${delivery.tcoNarrative.acquisition.toLocaleString()}`,
    `Operation: ¥${delivery.tcoNarrative.operation.toLocaleString()}`,
    `Maintenance: ¥${delivery.tcoNarrative.maintenance.toLocaleString()}`,
    `Replacement: ¥${delivery.tcoNarrative.replacement.toLocaleString()}`,
  ].join("; ");

  const lifecycleCostProfile = {
    acquisition: lifecycle.acquisitionCost,
    maintenance: lifecycle.maintenanceCost,
    replacement: lifecycle.replacementCost,
    total: lifecycle.totalLifecycleCost,
  };

  const checks = [
    budgetPackage.totalMin > 0,
    roiNarrative.length > 80,
    tcoNarrative.length > 40,
    lifecycleCostProfile.total > lifecycleCostProfile.acquisition,
    delivery.budgetJustification.budgetAlignmentScore >= 80,
  ];
  const commercialReadiness = Math.min(
    100,
    Math.round(
      (checks.filter(Boolean).length / checks.length) * 60 +
        delivery.budgetJustification.budgetAlignmentScore * 0.4,
    ),
  );

  return {
    packageId: `commercial-package-${bidderBrand}-${deploymentId}`,
    packLabel: ctx.packLabel,
    bidderBrand,
    budgetPackage,
    roiNarrative,
    tcoNarrative,
    lifecycleCostProfile,
    commercialReadiness,
  };
}
