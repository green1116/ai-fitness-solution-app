import { buildProposalRegistryRecords } from "@/lib/tender-proposal";
import { buildCatalogFromProposal } from "./catalog-builder";
import type {
  CatalogRegistry,
  CatalogStatus,
  CatalogType,
  IndustrySector,
  ProductCatalog,
  RegistryValidation,
} from "./shared/types";
import {
  CANONICAL_PRODUCT_CATALOG_BUYER_ID,
  CATALOG_STATUSES,
  CATALOG_TYPES,
  INDUSTRY_SECTORS,
} from "./shared/types";

function countBy<T extends string>(items: T[]): Record<T, number> {
  return items.reduce(
    (acc, item) => {
      acc[item] = (acc[item] ?? 0) + 1;
      return acc;
    },
    {} as Record<T, number>,
  );
}

export function buildCatalogRegistryRecords(): ProductCatalog[] {
  const proposals = buildProposalRegistryRecords();
  return proposals.map((proposal, index) =>
    buildCatalogFromProposal(proposal, undefined, index + 1),
  );
}

export function buildCatalogRegistry(): CatalogRegistry {
  const catalogs = buildCatalogRegistryRecords();
  return {
    registryId: "product-catalog-registry-v36",
    catalogs,
    catalogCount: catalogs.length,
    typeBreakdown: countBy(catalogs.map((catalog) => catalog.catalogType)),
    statusBreakdown: countBy(catalogs.map((catalog) => catalog.catalogStatus)),
    sectorBreakdown: countBy(catalogs.map((catalog) => catalog.industrySector)),
    registryReady: catalogs.length >= 12,
    mode: "product-catalog",
  };
}

export function getCatalogById(catalogId: string): ProductCatalog | undefined {
  return buildCatalogRegistryRecords().find((catalog) => catalog.catalogId === catalogId);
}

export function getCatalogsByProposal(proposalId: string): ProductCatalog[] {
  return buildCatalogRegistryRecords().filter((catalog) => catalog.proposalId === proposalId);
}

export function getCatalogsByBuyer(buyerOrganizationId: string): ProductCatalog[] {
  return buildCatalogRegistryRecords().filter(
    (catalog) => catalog.buyerOrganizationId === buyerOrganizationId,
  );
}

export function validateCatalogRegistry(): RegistryValidation {
  const catalogs = buildCatalogRegistryRecords();
  const typeCoverage = CATALOG_TYPES.every((type) =>
    catalogs.some((catalog) => catalog.catalogType === type),
  );
  const statusCoverage = CATALOG_STATUSES.every((status) =>
    catalogs.some((catalog) => catalog.catalogStatus === status),
  );
  const sectorCoverage = INDUSTRY_SECTORS.every((sector) =>
    catalogs.some((catalog) => catalog.industrySector === sector),
  );

  const scoreValid = catalogs.every(
    (catalog) =>
      catalog.score.coverageScore > 0 &&
      catalog.score.pricingScore > 0 &&
      catalog.score.availabilityScore > 0 &&
      catalog.score.complianceScore > 0 &&
      catalog.score.matchingScore > 0 &&
      catalog.score.totalCatalogScore > 0,
  );

  const bundleValid = catalogs.every(
    (catalog) => catalog.productIds.length >= 1 && catalog.bundleId.length > 0,
  );

  const compatibilityValid = catalogs.every(
    (catalog) =>
      catalog.compatibility.realCatalogFoundation.length > 0 &&
      catalog.compatibility.tenderProposalLayer.length > 0 &&
      catalog.compatibility.marketplaceLayer.length > 0,
  );

  const canonical = getCatalogsByBuyer(CANONICAL_PRODUCT_CATALOG_BUYER_ID);

  const valid =
    catalogs.length >= 12 &&
    typeCoverage &&
    statusCoverage &&
    sectorCoverage &&
    scoreValid &&
    bundleValid &&
    compatibilityValid &&
    canonical.length >= 1;

  return {
    valid,
    count: catalogs.length,
    summary: `catalog-registry count=${catalogs.length} types=${CATALOG_TYPES.filter((t) => catalogs.some((c) => c.catalogType === t)).length}/6 statuses=${CATALOG_STATUSES.filter((s) => catalogs.some((c) => c.catalogStatus === s)).length}/8 sectors=${INDUSTRY_SECTORS.filter((s) => catalogs.some((c) => c.industrySector === s)).length}/6 valid=${valid}`,
  };
}

export type { CatalogType, CatalogStatus, IndustrySector };
