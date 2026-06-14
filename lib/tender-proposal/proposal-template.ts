import type { IndustrySector, ProposalSection, ProposalTemplate, ProposalType } from "./shared/types";
import { INDUSTRY_SECTORS } from "./shared/types";

const TEMPLATE_TITLES: Record<ProposalType, string> = {
  technical: "Technical Proposal Template",
  commercial: "Commercial Proposal Template",
  construction: "Construction Proposal Template",
  equipment: "Equipment Proposal Template",
  operation: "Operation Proposal Template",
};

const TEMPLATE_SECTIONS: Record<ProposalType, ProposalSection["sectionType"][]> = {
  technical: ["executive-summary", "technical", "compliance"],
  commercial: ["executive-summary", "commercial", "compliance"],
  construction: ["executive-summary", "construction", "compliance"],
  equipment: ["executive-summary", "technical", "commercial", "compliance"],
  operation: ["executive-summary", "technical", "commercial", "compliance"],
};

function resolveSector(sector?: IndustrySector): IndustrySector {
  return sector ?? "gym-equipment";
}

function buildTemplate(
  proposalType: ProposalType,
  industrySector?: IndustrySector,
): ProposalTemplate {
  const sector = resolveSector(industrySector);
  const sectionTypes = TEMPLATE_SECTIONS[proposalType];

  return {
    templateId: `proposal-template-${proposalType}-${sector}`,
    proposalType,
    industrySector: sector,
    title: TEMPLATE_TITLES[proposalType],
    summary: `${TEMPLATE_TITLES[proposalType]} for ${sector.replace(/-/g, " ")} sports engineering tenders.`,
    sectionTypes,
    templateReady: sectionTypes.length >= 3,
    mode: "tender-proposal",
  };
}

export function buildTechnicalTemplate(industrySector?: IndustrySector): ProposalTemplate {
  return buildTemplate("technical", industrySector ?? "sports-hall");
}

export function buildCommercialTemplate(industrySector?: IndustrySector): ProposalTemplate {
  return buildTemplate("commercial", industrySector ?? "fitness-center");
}

export function buildConstructionTemplate(industrySector?: IndustrySector): ProposalTemplate {
  return buildTemplate("construction", industrySector ?? "sports-flooring");
}

export function buildEquipmentTemplate(industrySector?: IndustrySector): ProposalTemplate {
  return buildTemplate("equipment", industrySector ?? "gym-equipment");
}

export function buildOperationTemplate(industrySector?: IndustrySector): ProposalTemplate {
  return buildTemplate("operation", industrySector ?? "fitness-center");
}

export function getAllProposalTemplates(): ProposalTemplate[] {
  return INDUSTRY_SECTORS.flatMap((sector) => [
    buildTechnicalTemplate(sector),
    buildCommercialTemplate(sector),
    buildConstructionTemplate(sector),
    buildEquipmentTemplate(sector),
    buildOperationTemplate(sector),
  ]);
}
