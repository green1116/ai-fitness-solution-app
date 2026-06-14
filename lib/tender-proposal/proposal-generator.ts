import type { TenderRecord, TenderSourceType } from "@/lib/tender-hub";
import { buildTenderRegistryRecords, getTenderById } from "@/lib/tender-hub";
import {
  buildProposalCompatibilityMetadata,
  buildProposalEngineCompatibility,
} from "./proposal-engine-compat";
import { deriveProposalScoreFromTender } from "./proposal-scoring";
import { buildStandardProposalSections } from "./proposal-section";
import {
  buildCommercialTemplate,
  buildConstructionTemplate,
  buildEquipmentTemplate,
  buildOperationTemplate,
  buildTechnicalTemplate,
} from "./proposal-template";
import type {
  IndustrySector,
  ProposalStatus,
  ProposalType,
  TenderProposal,
} from "./shared/types";
import { INDUSTRY_SECTORS } from "./shared/types";

const PROPOSAL_TYPE_BY_SOURCE: Record<TenderSourceType, ProposalType> = {
  government: "technical",
  enterprise: "commercial",
  school: "technical",
  hospital: "technical",
  factory: "operation",
  "commercial-building": "equipment",
  "sports-center": "construction",
};

const STATUS_BY_RANK: ProposalStatus[] = [
  "draft",
  "generated",
  "reviewed",
  "approved",
  "submitted",
  "won",
  "lost",
  "archived",
];

function resolveProposalStatus(tender: TenderRecord, rank: number): ProposalStatus {
  if (tender.tenderStatus === "awarded") return "won";
  if (tender.tenderStatus === "submitted") return "submitted";
  if (tender.tenderStatus === "closed") return rank % 2 === 0 ? "archived" : "lost";
  if (tender.tenderStatus === "proposed") return rank <= 2 ? "approved" : "reviewed";
  if (tender.tenderStatus === "matched") return "generated";
  return STATUS_BY_RANK[(rank - 1) % STATUS_BY_RANK.length]!;
}

function resolveIndustrySector(rank: number): IndustrySector {
  return INDUSTRY_SECTORS[(rank - 1) % INDUSTRY_SECTORS.length]!;
}

function resolveProposalType(tender: TenderRecord, rank: number): ProposalType {
  const sourceType = PROPOSAL_TYPE_BY_SOURCE[tender.sourceType];
  if (rank % 5 === 0) {
    const rotation: ProposalType[] = [
      "technical",
      "commercial",
      "construction",
      "equipment",
      "operation",
    ];
    return rotation[(rank - 1) % rotation.length]!;
  }
  return sourceType;
}

function buildTemplateForType(proposalType: ProposalType, sector: IndustrySector) {
  switch (proposalType) {
    case "technical":
      return buildTechnicalTemplate(sector);
    case "commercial":
      return buildCommercialTemplate(sector);
    case "construction":
      return buildConstructionTemplate(sector);
    case "equipment":
      return buildEquipmentTemplate(sector);
    case "operation":
      return buildOperationTemplate(sector);
  }
}

export function buildProposalFromTender(
  tender: TenderRecord,
  proposalType?: ProposalType,
  rank = 1,
): TenderProposal {
  const industrySector = resolveIndustrySector(rank);
  const resolvedType = proposalType ?? resolveProposalType(tender, rank);
  const template = buildTemplateForType(resolvedType, industrySector);
  const sections = buildStandardProposalSections(industrySector);
  const proposalId = `tp-proposal-${tender.tenderId}-${resolvedType}`;
  const score = deriveProposalScoreFromTender(proposalId, tender.score);

  return {
    proposalId,
    tenderId: tender.tenderId,
    buyerOrganizationId: tender.buyerOrganizationId,
    proposalType: resolvedType,
    industrySector,
    title: `${tender.title.replace(" — Tender Hub", "")} — ${template.title}`,
    summary: `${template.summary} Generated from tender ${tender.tenderId}.`,
    proposalStatus: resolveProposalStatus(tender, rank),
    score,
    templateId: template.templateId,
    sectionIds: sections.map((section) => section.sectionId),
    generatedAt: new Date().toISOString(),
    metadata: {
      ...tender.metadata,
      ...buildProposalCompatibilityMetadata(proposalId, tender.tenderId),
      tenderStatus: tender.tenderStatus,
      sourceType: tender.sourceType,
    },
    compatibility: buildProposalEngineCompatibility(),
    mode: "tender-proposal",
  };
}

function resolveTender(tenderId?: string): TenderRecord {
  if (tenderId) {
    const tender = getTenderById(tenderId);
    if (!tender) {
      throw new Error(`Tender not found: ${tenderId}`);
    }
    return tender;
  }

  const tender = buildTenderRegistryRecords()[0];
  if (!tender) {
    throw new Error("No tenders available for proposal generation");
  }
  return tender;
}

export function generateTechnicalProposal(tenderId?: string): TenderProposal {
  return buildProposalFromTender(resolveTender(tenderId), "technical");
}

export function generateCommercialProposal(tenderId?: string): TenderProposal {
  return buildProposalFromTender(resolveTender(tenderId), "commercial");
}

export function generateConstructionProposal(tenderId?: string): TenderProposal {
  return buildProposalFromTender(resolveTender(tenderId), "construction");
}

export function generateEquipmentProposal(tenderId?: string): TenderProposal {
  return buildProposalFromTender(resolveTender(tenderId), "equipment");
}

export function generateOperationProposal(tenderId?: string): TenderProposal {
  return buildProposalFromTender(resolveTender(tenderId), "operation");
}
