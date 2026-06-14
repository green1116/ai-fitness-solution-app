import { buildTenderRegistryRecords, getTendersByBuyer } from "./tender-registry";
import type {
  RegistryValidation,
  TenderQuery,
  TenderQueryResult,
  TenderRecord,
} from "./shared/types";
import {
  CANONICAL_TENDER_HUB_BUYER_ID,
  CANONICAL_TENDER_QUERY,
  OPEN_TENDER_STATUSES,
  TOP_TENDER_SCORE_THRESHOLD,
} from "./shared/types";

function applyTenderQuery(input: TenderQuery, source: TenderRecord[]): TenderRecord[] {
  let tenders = [...source];

  if (input.buyerOrganizationId) {
    tenders = tenders.filter(
      (tender) => tender.buyerOrganizationId === input.buyerOrganizationId,
    );
  }

  if (input.sourceType) {
    tenders = tenders.filter((tender) => tender.sourceType === input.sourceType);
  }

  if (input.tenderStatus) {
    tenders = tenders.filter((tender) => tender.tenderStatus === input.tenderStatus);
  }

  if (input.minTenderScore !== undefined) {
    tenders = tenders.filter(
      (tender) => tender.score.totalTenderScore >= input.minTenderScore!,
    );
  }

  if (input.limit !== undefined) {
    tenders = tenders.slice(0, input.limit);
  }

  return tenders;
}

function toQueryResult(query: TenderQuery, tenders: TenderRecord[]): TenderQueryResult {
  const queryParts = [
    query.buyerOrganizationId ?? "all-buyers",
    query.sourceType ?? "all-sources",
    query.tenderStatus ?? "all-status",
    query.minTenderScore?.toString() ?? "no-min-score",
    query.limit?.toString() ?? "no-limit",
  ];

  return {
    queryId: `tender-query-${queryParts.join("-")}`,
    query,
    tenders,
    hitCount: tenders.length,
    hubReady: tenders.length > 0,
  };
}

export function findTenders(limit = 10): TenderQueryResult {
  return toQueryResult({ limit }, applyTenderQuery({ limit }, buildTenderRegistryRecords()));
}

export function findOpenTenders(limit = 10): TenderQueryResult {
  const tenders = buildTenderRegistryRecords()
    .filter((tender) => OPEN_TENDER_STATUSES.includes(tender.tenderStatus))
    .slice(0, limit);

  return toQueryResult({ limit }, tenders);
}

export function findTrackedTenders(limit = 5): TenderQueryResult {
  return toQueryResult(
    { tenderStatus: "tracked", limit },
    applyTenderQuery({ tenderStatus: "tracked", limit }, buildTenderRegistryRecords()),
  );
}

export function findGovernmentTenders(limit = 5): TenderQueryResult {
  return toQueryResult(
    { sourceType: "government", limit },
    applyTenderQuery({ sourceType: "government", limit }, buildTenderRegistryRecords()),
  );
}

export function findEnterpriseTenders(limit = 5): TenderQueryResult {
  return toQueryResult(
    { sourceType: "enterprise", limit },
    applyTenderQuery({ sourceType: "enterprise", limit }, buildTenderRegistryRecords()),
  );
}

export function findMatchedTenders(limit = 5): TenderQueryResult {
  return toQueryResult(
    { tenderStatus: "matched", limit },
    applyTenderQuery({ tenderStatus: "matched", limit }, buildTenderRegistryRecords()),
  );
}

export function findTopTenders(limit = 5): TenderQueryResult {
  const tenders = [...buildTenderRegistryRecords()]
    .filter((tender) => tender.score.totalTenderScore >= TOP_TENDER_SCORE_THRESHOLD)
    .sort((left, right) => right.score.totalTenderScore - left.score.totalTenderScore)
    .slice(0, limit);

  return toQueryResult({ minTenderScore: TOP_TENDER_SCORE_THRESHOLD, limit }, tenders);
}

export function executeTenderQuery(query: TenderQuery = {}): TenderQueryResult {
  return toQueryResult(query, applyTenderQuery(query, buildTenderRegistryRecords()));
}

export function validateTenderQueryRegistry(): RegistryValidation {
  const canonical = executeTenderQuery(CANONICAL_TENDER_QUERY);
  const all = findTenders(10);
  const open = findOpenTenders(10);
  const tracked = findTrackedTenders(3);
  const government = findGovernmentTenders(3);
  const enterprise = findEnterpriseTenders(3);
  const matched = findMatchedTenders(3);
  const top = findTopTenders(5);
  const buyer = getTendersByBuyer(CANONICAL_TENDER_HUB_BUYER_ID);

  const valid =
    canonical.hubReady &&
    canonical.hitCount >= 1 &&
    all.hitCount >= 10 &&
    open.hitCount >= 5 &&
    tracked.hitCount >= 1 &&
    government.hitCount >= 1 &&
    enterprise.hitCount >= 1 &&
    matched.hitCount >= 1 &&
    top.hitCount >= 3 &&
    buyer.length >= 2 &&
    canonical.tenders.every(
      (tender) =>
        tender.score.opportunityScore > 0 &&
        tender.score.budgetScore > 0 &&
        tender.score.competitionScore > 0 &&
        tender.score.matchingScore > 0 &&
        tender.score.winProbability > 0,
    );

  return {
    valid,
    count: canonical.hitCount,
    summary: `tender-query canonical=${canonical.hitCount} open=${open.hitCount} government=${government.hitCount} top=${top.hitCount} valid=${valid}`,
  };
}
