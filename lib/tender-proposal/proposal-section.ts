import type { IndustrySector, ProposalSection } from "./shared/types";

function buildSection(
  sectionType: ProposalSection["sectionType"],
  industrySector: IndustrySector,
  order: number,
): ProposalSection {
  const sectorLabel = industrySector.replace(/-/g, " ");

  const titles: Record<ProposalSection["sectionType"], string> = {
    "executive-summary": "Executive Summary",
    technical: "Technical Solution",
    commercial: "Commercial Offer",
    construction: "Construction Methodology",
    compliance: "Compliance & Qualification",
  };

  const contentByType: Record<ProposalSection["sectionType"], string> = {
    "executive-summary": `Executive summary for ${sectorLabel} tender proposal covering scope, value proposition, and delivery commitment.`,
    technical: `Technical approach for ${sectorLabel} including product specifications, installation standards, and quality assurance.`,
    commercial: `Commercial terms for ${sectorLabel} including pricing structure, payment milestones, and warranty coverage.`,
    construction: `Construction plan for ${sectorLabel} covering site preparation, installation sequence, and safety management.`,
    compliance: `Compliance documentation for ${sectorLabel} including certifications, qualifications, and regulatory alignment.`,
  };

  return {
    sectionId: `proposal-section-${sectionType}-${industrySector}`,
    sectionType,
    title: titles[sectionType],
    content: contentByType[sectionType],
    order,
    mode: "tender-proposal",
  };
}

export function buildExecutiveSummarySection(
  industrySector: IndustrySector = "gym-equipment",
): ProposalSection {
  return buildSection("executive-summary", industrySector, 1);
}

export function buildTechnicalSection(industrySector: IndustrySector = "gym-equipment"): ProposalSection {
  return buildSection("technical", industrySector, 2);
}

export function buildCommercialSection(industrySector: IndustrySector = "gym-equipment"): ProposalSection {
  return buildSection("commercial", industrySector, 3);
}

export function buildConstructionSection(
  industrySector: IndustrySector = "sports-flooring",
): ProposalSection {
  return buildSection("construction", industrySector, 4);
}

export function buildComplianceSection(industrySector: IndustrySector = "gym-equipment"): ProposalSection {
  return buildSection("compliance", industrySector, 5);
}

export function buildStandardProposalSections(
  industrySector: IndustrySector,
): ProposalSection[] {
  return [
    buildExecutiveSummarySection(industrySector),
    buildTechnicalSection(industrySector),
    buildCommercialSection(industrySector),
    buildConstructionSection(industrySector),
    buildComplianceSection(industrySector),
  ];
}
