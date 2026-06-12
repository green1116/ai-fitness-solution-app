import { buildResponsePackContext } from "../bridge/response-bridge";
import type { ResponsePackBidderBrand } from "../shared/types";

export function buildEquipmentAttachmentPackage(input?: {
  deploymentId?: string;
  bidderBrand?: ResponsePackBidderBrand;
}) {
  const deploymentId = input?.deploymentId ?? "equipment-attachment-default";
  const bidderBrand = input?.bidderBrand ?? "Technogym";
  const ctx = buildResponsePackContext({ deploymentId, bidderBrand });
  const equip = ctx.proposalContext.equipmentContext;

  const equipmentSchedule = equip.equipmentList.map((item) => ({
    modelName: item.modelName,
    category: item.category,
    quantity: item.quantity,
    brandName: item.brandName,
  }));

  const modelList = equip.equipmentList.map((item) => `${item.modelName} × ${item.quantity}`);
  const datasheetReferences = equip.equipmentList.map(
    (item) => `DS-${item.brandName.replace(/\s/g, "")}-${item.modelName.replace(/\s/g, "-")}-v1.0`,
  );

  const checks = [
    equipmentSchedule.length >= 2,
    modelList.length >= 2,
    datasheetReferences.length >= 2,
    equipmentSchedule.every((e) => e.quantity > 0),
  ];
  const attachmentReadiness = Math.min(
    100,
    Math.round(
      (checks.filter(Boolean).length / checks.length) * 60 +
        ctx.proposalContext.differentiationContext.equipmentStrategy.equipmentStrategyScore * 0.4,
    ),
  );

  return {
    packageId: `equipment-attachment-${bidderBrand}-${deploymentId}`,
    packLabel: ctx.packLabel,
    bidderBrand,
    equipmentSchedule,
    modelList,
    datasheetReferences,
    attachmentReadiness,
  };
}
