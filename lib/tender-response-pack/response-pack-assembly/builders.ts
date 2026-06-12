import { buildResponsePackContext } from "../bridge/response-bridge";
import { buildCommercialPackage } from "../commercial-attachment/builders";
import { buildCompliancePackage } from "../compliance-attachment/builders";
import { buildEquipmentAttachmentPackage } from "../equipment-attachment/builders";
import type { ResponsePackBidderBrand } from "../shared/types";
import type { TenderResponsePack } from "./types";

export function buildTenderResponsePack(input: {
  deploymentId: string;
  bidderBrand: ResponsePackBidderBrand;
}): TenderResponsePack {
  const { deploymentId, bidderBrand } = input;
  const ctx = buildResponsePackContext({ deploymentId, bidderBrand });
  const delivery = ctx.deliveryPackage;
  const commercialPackage = buildCommercialPackage({ deploymentId, bidderBrand });
  const compliancePackage = buildCompliancePackage({ deploymentId, bidderBrand });
  const equipmentPackage = buildEquipmentAttachmentPackage({ deploymentId, bidderBrand });

  const sectionChecks = [
    delivery.executiveSummary.length > 50,
    delivery.technicalProposal.length > 30,
    delivery.equipmentPlan.length > 20,
    commercialPackage.budgetPackage.totalMin > 0,
    commercialPackage.roiNarrative.length > 80,
    compliancePackage.complianceMatrix.length > 20,
    equipmentPackage.equipmentSchedule.length >= 2,
  ];
  const assemblyReadiness = Math.round((sectionChecks.filter(Boolean).length / sectionChecks.length) * 100);

  return {
    packId: `response-pack-${bidderBrand}-${deploymentId}`,
    packLabel: ctx.packLabel,
    bidderBrand,
    tenderId: ctx.tenderId,
    executiveSummary: delivery.executiveSummary,
    technicalProposal: delivery.technicalProposal,
    equipmentPlan: delivery.equipmentPlan,
    budgetPackage: commercialPackage.budgetPackage,
    commercialPackage,
    compliancePackage,
    equipmentPackage,
    assemblyReadiness,
  };
}
