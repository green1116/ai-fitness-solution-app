import { validateMarketplaceContextRegistry } from "./marketplace-context";
import {
  buildIndustryMarketplace,
  getMarketplaceBySubject,
  getMarketplaceByType,
  validateMarketplaceRegistry,
} from "./marketplace-registry";
import type {
  IndustryMarketplace,
  IndustryMarketplaceValidation,
  MarketplaceQuery,
  MarketplaceQueryResult,
  RegistryValidation,
} from "./shared/types";
import {
  CANONICAL_MARKETPLACE_QUERY,
  CANONICAL_MARKETPLACE_SUBJECT_ID,
  TOP_MARKETPLACE_SCORE_THRESHOLD,
} from "./shared/types";

function applyMarketplaceQuery(
  input: MarketplaceQuery,
  source: IndustryMarketplace[],
): IndustryMarketplace[] {
  let marketplaceRecords = [...source];

  if (input.subjectId) {
    marketplaceRecords = marketplaceRecords.filter(
      (record) => record.subjectId === input.subjectId,
    );
  }

  if (input.marketplaceType) {
    marketplaceRecords = marketplaceRecords.filter(
      (record) => record.marketplaceType === input.marketplaceType,
    );
  }

  if (input.marketplaceStatus) {
    marketplaceRecords = marketplaceRecords.filter(
      (record) => record.marketplaceStatus === input.marketplaceStatus,
    );
  }

  if (input.minMarketplaceScore !== undefined) {
    marketplaceRecords = marketplaceRecords.filter(
      (record) => record.score.totalMarketplaceScore >= input.minMarketplaceScore!,
    );
  }

  if (input.limit !== undefined) {
    marketplaceRecords = marketplaceRecords.slice(0, input.limit);
  }

  return marketplaceRecords;
}

function toQueryResult(
  query: MarketplaceQuery,
  marketplaceRecords: IndustryMarketplace[],
): MarketplaceQueryResult {
  const queryParts = [
    query.subjectId ?? "all-subjects",
    query.marketplaceType ?? "all-types",
    query.marketplaceStatus ?? "all-status",
    query.minMarketplaceScore?.toString() ?? "no-min-score",
    query.limit?.toString() ?? "no-limit",
  ];

  return {
    queryId: `marketplace-query-${queryParts.join("-")}`,
    query,
    marketplaceRecords,
    hitCount: marketplaceRecords.length,
    marketplaceReady: marketplaceRecords.length > 0,
  };
}

export function findSupplierMarketplace(limit = 5): MarketplaceQueryResult {
  return toQueryResult(
    { marketplaceType: "supplier", limit },
    applyMarketplaceQuery(
      { marketplaceType: "supplier", limit },
      getMarketplaceByType("supplier"),
    ),
  );
}

export function findBrandMarketplace(limit = 5): MarketplaceQueryResult {
  return toQueryResult(
    { marketplaceType: "brand", limit },
    applyMarketplaceQuery({ marketplaceType: "brand", limit }, getMarketplaceByType("brand")),
  );
}

export function findTenderMarketplace(limit = 5): MarketplaceQueryResult {
  return toQueryResult(
    { marketplaceType: "tender", limit },
    applyMarketplaceQuery({ marketplaceType: "tender", limit }, getMarketplaceByType("tender")),
  );
}

export function findPartnershipMarketplace(limit = 5): MarketplaceQueryResult {
  return toQueryResult(
    { marketplaceType: "partnership", limit },
    applyMarketplaceQuery(
      { marketplaceType: "partnership", limit },
      getMarketplaceByType("partnership"),
    ),
  );
}

export function findTopMarketplace(limit = 5): MarketplaceQueryResult {
  return toQueryResult(
    { minMarketplaceScore: TOP_MARKETPLACE_SCORE_THRESHOLD, limit },
    applyMarketplaceQuery(
      { minMarketplaceScore: TOP_MARKETPLACE_SCORE_THRESHOLD, limit },
      buildIndustryMarketplace(),
    ),
  );
}

export function executeMarketplaceQuery(query: MarketplaceQuery = {}): MarketplaceQueryResult {
  return toQueryResult(query, applyMarketplaceQuery(query, buildIndustryMarketplace()));
}

export function validateMarketplaceQueryRegistry(): RegistryValidation {
  const canonical = executeMarketplaceQuery(CANONICAL_MARKETPLACE_QUERY);
  const suppliers = findSupplierMarketplace(3);
  const brands = findBrandMarketplace(3);
  const tenders = findTenderMarketplace(3);
  const partnerships = findPartnershipMarketplace(3);
  const top = findTopMarketplace(5);
  const subject = getMarketplaceBySubject(CANONICAL_MARKETPLACE_SUBJECT_ID);

  const valid =
    canonical.marketplaceReady &&
    canonical.hitCount >= 1 &&
    suppliers.hitCount >= 1 &&
    brands.hitCount >= 1 &&
    tenders.hitCount >= 2 &&
    partnerships.hitCount >= 1 &&
    top.hitCount >= 3 &&
    subject.length >= 1 &&
    canonical.marketplaceRecords.every(
      (record) =>
        record.score.visibilityScore > 0 &&
        record.score.matchingScore > 0 &&
        record.score.transactionScore > 0 &&
        record.score.retentionScore > 0 &&
        record.score.confidenceScore > 0,
    );

  return {
    valid,
    count: canonical.hitCount,
    summary: `marketplace-query canonical=${canonical.hitCount} suppliers=${suppliers.hitCount} tenders=${tenders.hitCount} top=${top.hitCount} valid=${valid}`,
  };
}

export function validateIndustryMarketplace(): IndustryMarketplaceValidation {
  const marketplaceRegistry = validateMarketplaceRegistry();
  const marketplaceContext = validateMarketplaceContextRegistry();
  const marketplaceQuery = validateMarketplaceQueryRegistry();

  return {
    valid: marketplaceRegistry.valid && marketplaceContext.valid && marketplaceQuery.valid,
    marketplaceRegistry,
    marketplaceContext,
    marketplaceQuery,
  };
}
