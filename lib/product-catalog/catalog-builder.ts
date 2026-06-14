import type { TenderProposal } from "@/lib/tender-proposal";
import type { ProposalType } from "@/lib/tender-proposal";
import { buildProposalRegistryRecords } from "@/lib/tender-proposal";
import { buildCategoryForType } from "./catalog-category";
import {
  buildCatalogCompatibilityMetadata,
  buildCatalogEngineCompatibility,
} from "./catalog-engine-compat";
import { buildCatalogBundle } from "./catalog-bundle";
import { deriveCatalogScoreFromProposal } from "./catalog-scoring";
import type { CatalogStatus, CatalogType, IndustrySector, ProductCatalog } from "./shared/types";
import { CATALOG_TYPES } from "./shared/types";

const CATALOG_TYPE_BY_PROPOSAL: Record<ProposalType, CatalogType> = {
  technical: "service",
  commercial: "equipment",
  construction: "construction",
  equipment: "equipment",
  operation: "service",
};

const STATUS_BY_RANK: CatalogStatus[] = [
  "draft",
  "published",
  "active",
  "matched",
  "quoted",
  "approved",
  "discontinued",
  "archived",
];

function resolveCatalogType(proposal: TenderProposal, rank: number): CatalogType {
  if (rank <= 6) {
    return CATALOG_TYPES[rank - 1]!;
  }
  return CATALOG_TYPE_BY_PROPOSAL[proposal.proposalType];
}

function resolveCatalogStatus(proposal: TenderProposal, rank: number): CatalogStatus {
  if (rank <= 8) {
    return STATUS_BY_RANK[rank - 1]!;
  }
  if (proposal.proposalStatus === "won") return "approved";
  if (proposal.proposalStatus === "submitted") return "quoted";
  if (proposal.proposalStatus === "lost") return "discontinued";
  if (proposal.proposalStatus === "archived") return "archived";
  return "active";
}

export function buildCatalogFromProposal(
  proposal: TenderProposal,
  catalogType?: CatalogType,
  rank = 1,
): ProductCatalog {
  const resolvedType = catalogType ?? resolveCatalogType(proposal, rank);
  const industrySector = proposal.industrySector;
  const catalogId = `pc-catalog-${proposal.proposalId}-${resolvedType}`;
  const category = buildCategoryForType(resolvedType, industrySector);
  const bundle = buildCatalogBundle({
    catalogId,
    proposalId: proposal.proposalId,
    catalogType: resolvedType,
    industrySector,
  });
  const score = deriveCatalogScoreFromProposal(catalogId, proposal.score);

  return {
    catalogId,
    proposalId: proposal.proposalId,
    tenderId: proposal.tenderId,
    buyerOrganizationId: proposal.buyerOrganizationId,
    catalogType: resolvedType,
    industrySector,
    title: `${proposal.title.replace(/ — .*Template$/, "")} — ${category.title}`,
    summary: `${category.summary} Linked to proposal ${proposal.proposalId}.`,
    catalogStatus: resolveCatalogStatus(proposal, rank),
    score,
    categoryId: category.categoryId,
    productIds: bundle.productIds,
    bundleId: bundle.bundleId,
    generatedAt: new Date().toISOString(),
    metadata: {
      ...proposal.metadata,
      ...buildCatalogCompatibilityMetadata(catalogId, proposal.proposalId),
      proposalType: proposal.proposalType,
      proposalStatus: proposal.proposalStatus,
    },
    compatibility: buildCatalogEngineCompatibility(),
    mode: "product-catalog",
  };
}

function resolveProposal(proposalId?: string): TenderProposal {
  const proposals = buildProposalRegistryRecords();
  if (proposalId) {
    const proposal = proposals.find((entry) => entry.proposalId === proposalId);
    if (!proposal) throw new Error(`Proposal not found: ${proposalId}`);
    return proposal;
  }
  const proposal = proposals[0];
  if (!proposal) throw new Error("No proposals available for catalog generation");
  return proposal;
}

export function buildEquipmentCatalog(proposalId?: string): ProductCatalog {
  return buildCatalogFromProposal(resolveProposal(proposalId), "equipment");
}

export function buildFlooringCatalog(proposalId?: string): ProductCatalog {
  return buildCatalogFromProposal(resolveProposal(proposalId), "flooring");
}

export function buildTrackCatalog(proposalId?: string): ProductCatalog {
  return buildCatalogFromProposal(resolveProposal(proposalId), "track");
}

export function buildTurfCatalog(proposalId?: string): ProductCatalog {
  return buildCatalogFromProposal(resolveProposal(proposalId), "turf");
}

export function buildConstructionCatalog(proposalId?: string): ProductCatalog {
  return buildCatalogFromProposal(resolveProposal(proposalId), "construction");
}

export function buildServiceCatalog(proposalId?: string): ProductCatalog {
  return buildCatalogFromProposal(resolveProposal(proposalId), "service");
}

export type { CatalogType, IndustrySector };
