import {
  buildCatalogRegistryRecords,
  getCatalogsByBuyer,
} from "./catalog-registry";
import type {
  CatalogQuery,
  CatalogQueryResult,
  ProductCatalog,
  RegistryValidation,
} from "./shared/types";
import {
  ACTIVE_CATALOG_STATUSES,
  CANONICAL_CATALOG_QUERY,
  CANONICAL_PRODUCT_CATALOG_BUYER_ID,
  MATCHED_CATALOG_STATUSES,
  TOP_CATALOG_SCORE_THRESHOLD,
} from "./shared/types";

function applyCatalogQuery(input: CatalogQuery, source: ProductCatalog[]): ProductCatalog[] {
  let catalogs = [...source];

  if (input.buyerOrganizationId) {
    catalogs = catalogs.filter(
      (catalog) => catalog.buyerOrganizationId === input.buyerOrganizationId,
    );
  }

  if (input.catalogType) {
    catalogs = catalogs.filter((catalog) => catalog.catalogType === input.catalogType);
  }

  if (input.catalogStatus) {
    catalogs = catalogs.filter((catalog) => catalog.catalogStatus === input.catalogStatus);
  }

  if (input.industrySector) {
    catalogs = catalogs.filter((catalog) => catalog.industrySector === input.industrySector);
  }

  if (input.minCatalogScore !== undefined) {
    catalogs = catalogs.filter(
      (catalog) => catalog.score.totalCatalogScore >= input.minCatalogScore!,
    );
  }

  if (input.limit !== undefined) {
    catalogs = catalogs.slice(0, input.limit);
  }

  return catalogs;
}

function toQueryResult(query: CatalogQuery, catalogs: ProductCatalog[]): CatalogQueryResult {
  const queryParts = [
    query.buyerOrganizationId ?? "all-buyers",
    query.catalogType ?? "all-types",
    query.catalogStatus ?? "all-status",
    query.industrySector ?? "all-sectors",
    query.minCatalogScore?.toString() ?? "no-min-score",
    query.limit?.toString() ?? "no-limit",
  ];

  return {
    queryId: `catalog-query-${queryParts.join("-")}`,
    query,
    catalogs,
    hitCount: catalogs.length,
    catalogReady: catalogs.length > 0,
  };
}

export function findCatalogs(limit = 10): CatalogQueryResult {
  return toQueryResult({ limit }, applyCatalogQuery({ limit }, buildCatalogRegistryRecords()));
}

export function findActiveCatalogs(limit = 5): CatalogQueryResult {
  const catalogs = buildCatalogRegistryRecords()
    .filter((catalog) => ACTIVE_CATALOG_STATUSES.includes(catalog.catalogStatus))
    .slice(0, limit);

  return toQueryResult({ catalogStatus: "active", limit }, catalogs);
}

export function findMatchedCatalogs(limit = 5): CatalogQueryResult {
  const catalogs = buildCatalogRegistryRecords()
    .filter((catalog) => MATCHED_CATALOG_STATUSES.includes(catalog.catalogStatus))
    .slice(0, limit);

  return toQueryResult({ catalogStatus: "matched", limit }, catalogs);
}

export function findTopCatalogs(limit = 5): CatalogQueryResult {
  const catalogs = [...buildCatalogRegistryRecords()]
    .filter((catalog) => catalog.score.totalCatalogScore >= TOP_CATALOG_SCORE_THRESHOLD)
    .sort((left, right) => right.score.totalCatalogScore - left.score.totalCatalogScore)
    .slice(0, limit);

  return toQueryResult({ minCatalogScore: TOP_CATALOG_SCORE_THRESHOLD, limit }, catalogs);
}

export function executeCatalogQuery(query: CatalogQuery = {}): CatalogQueryResult {
  return toQueryResult(query, applyCatalogQuery(query, buildCatalogRegistryRecords()));
}

export function validateCatalogQueryRegistry(): RegistryValidation {
  const canonical = executeCatalogQuery(CANONICAL_CATALOG_QUERY);
  const all = findCatalogs(10);
  const active = findActiveCatalogs(5);
  const matched = findMatchedCatalogs(5);
  const top = findTopCatalogs(5);
  const buyer = getCatalogsByBuyer(CANONICAL_PRODUCT_CATALOG_BUYER_ID);

  const valid =
    canonical.catalogReady &&
    canonical.hitCount >= 1 &&
    all.hitCount >= 10 &&
    active.hitCount >= 1 &&
    matched.hitCount >= 1 &&
    top.hitCount >= 3 &&
    buyer.length >= 1 &&
    canonical.catalogs.every(
      (catalog) =>
        catalog.score.coverageScore > 0 &&
        catalog.score.pricingScore > 0 &&
        catalog.score.availabilityScore > 0 &&
        catalog.score.complianceScore > 0 &&
        catalog.score.matchingScore > 0,
    );

  return {
    valid,
    count: canonical.hitCount,
    summary: `catalog-query canonical=${canonical.hitCount} active=${active.hitCount} matched=${matched.hitCount} top=${top.hitCount} valid=${valid}`,
  };
}
