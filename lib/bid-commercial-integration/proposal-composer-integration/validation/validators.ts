import { buildCommercialProposalPack } from "../bridge/proposal-composer-bridge";
import type { CommercialProposalPack, CommercialProposalPackValidation } from "../shared/types";
import type { ProjectType } from "@/lib/procurement-intelligence/shared/types";

function sectionFieldValid(section: { content: string; readinessScore: number } | undefined): boolean {
  return section !== undefined && section.content.length > 0 && section.readinessScore > 0;
}

export function validateCommercialProposalPack(
  pack: CommercialProposalPack,
): CommercialProposalPackValidation {
  const equipmentSectionExists = sectionFieldValid(pack.equipmentSection);
  const supplyChainSectionExists = sectionFieldValid(pack.supplyChainSection);
  const procurementSectionExists = sectionFieldValid(pack.procurementSection);
  const deliverySectionExists = sectionFieldValid(pack.deliverySection);

  const valid =
    equipmentSectionExists &&
    supplyChainSectionExists &&
    procurementSectionExists &&
    deliverySectionExists &&
    pack.integrationReadiness > 0;

  return {
    valid,
    equipmentSectionExists,
    supplyChainSectionExists,
    procurementSectionExists,
    deliverySectionExists,
  };
}

export function validateCommercialProposalPackFromInput(input: {
  sku: string;
  city: string;
  quantity: number;
  projectType: ProjectType;
}): CommercialProposalPackValidation {
  const pack = buildCommercialProposalPack(input);
  return validateCommercialProposalPack(pack);
}
