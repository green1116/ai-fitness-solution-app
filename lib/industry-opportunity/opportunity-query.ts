import { validateOpportunityContextRegistry } from "./opportunity-context";
import {
  buildIndustryOpportunities,
  getOpportunitiesBySubject,
  getOpportunitiesByType,
  validateOpportunityRegistry,
} from "./opportunity-registry";
import type {
  IndustryOpportunity,
  IndustryOpportunityType,
  IndustryOpportunityValidation,
  OpportunityQuery,
  OpportunityQueryResult,
  RegistryValidation,
} from "./shared/types";
import {
  CANONICAL_OPPORTUNITY_QUERY,
  CANONICAL_OPPORTUNITY_SUBJECT_ID,
  HIGH_PRIORITY_SCORE_THRESHOLD,
} from "./shared/types";

function applyOpportunityQuery(
  input: OpportunityQuery,
  source: IndustryOpportunity[],
): IndustryOpportunity[] {
  let opportunities = [...source];

  if (input.subjectId) {
    opportunities = opportunities.filter(
      (opportunity) => opportunity.subjectId === input.subjectId,
    );
  }

  if (input.opportunityType) {
    opportunities = opportunities.filter(
      (opportunity) => opportunity.opportunityType === input.opportunityType,
    );
  }

  if (input.minTotalScore !== undefined) {
    opportunities = opportunities.filter(
      (opportunity) => opportunity.score.totalScore >= input.minTotalScore!,
    );
  }

  if (input.limit !== undefined) {
    opportunities = opportunities.slice(0, input.limit);
  }

  return opportunities;
}

function toQueryResult(
  query: OpportunityQuery,
  opportunities: IndustryOpportunity[],
): OpportunityQueryResult {
  const queryParts = [
    query.subjectId ?? "all-subjects",
    query.opportunityType ?? "all-types",
    query.minTotalScore?.toString() ?? "no-min-score",
    query.limit?.toString() ?? "no-limit",
  ];

  return {
    queryId: `opportunity-query-${queryParts.join("-")}`,
    query,
    opportunities,
    hitCount: opportunities.length,
    opportunityReady: opportunities.length > 0,
  };
}

export function findSupplierOpportunities(limit = 5): OpportunityQueryResult {
  return toQueryResult(
    { opportunityType: "supplier", limit },
    applyOpportunityQuery({ opportunityType: "supplier", limit }, getOpportunitiesByType("supplier")),
  );
}

export function findBrandOpportunities(limit = 5): OpportunityQueryResult {
  return toQueryResult(
    { opportunityType: "brand", limit },
    applyOpportunityQuery({ opportunityType: "brand", limit }, getOpportunitiesByType("brand")),
  );
}

export function findTenderOpportunities(limit = 5): OpportunityQueryResult {
  return toQueryResult(
    { opportunityType: "tender", limit },
    applyOpportunityQuery({ opportunityType: "tender", limit }, getOpportunitiesByType("tender")),
  );
}

export function findPartnershipOpportunities(limit = 5): OpportunityQueryResult {
  return toQueryResult(
    { opportunityType: "partnership", limit },
    applyOpportunityQuery(
      { opportunityType: "partnership", limit },
      getOpportunitiesByType("partnership"),
    ),
  );
}

export function findHighPriorityOpportunities(limit = 5): OpportunityQueryResult {
  return toQueryResult(
    { minTotalScore: HIGH_PRIORITY_SCORE_THRESHOLD, limit },
    applyOpportunityQuery(
      { minTotalScore: HIGH_PRIORITY_SCORE_THRESHOLD, limit },
      buildIndustryOpportunities(),
    ),
  );
}

export function executeOpportunityQuery(query: OpportunityQuery = {}): OpportunityQueryResult {
  return toQueryResult(query, applyOpportunityQuery(query, buildIndustryOpportunities()));
}

export function validateOpportunityQueryRegistry(): RegistryValidation {
  const canonical = executeOpportunityQuery(CANONICAL_OPPORTUNITY_QUERY);
  const suppliers = findSupplierOpportunities(3);
  const brands = findBrandOpportunities(3);
  const tenders = findTenderOpportunities(3);
  const partnerships = findPartnershipOpportunities(3);
  const highPriority = findHighPriorityOpportunities(5);
  const subject = getOpportunitiesBySubject(CANONICAL_OPPORTUNITY_SUBJECT_ID);

  const valid =
    canonical.opportunityReady &&
    canonical.hitCount >= 1 &&
    suppliers.hitCount >= 1 &&
    brands.hitCount >= 1 &&
    tenders.hitCount >= 2 &&
    partnerships.hitCount >= 1 &&
    highPriority.hitCount >= 3 &&
    subject.length >= 1 &&
    canonical.opportunities.every(
      (opportunity) =>
        opportunity.score.impact > 0 &&
        opportunity.score.confidence > 0 &&
        opportunity.score.urgency > 0 &&
        opportunity.score.networkEffect > 0,
    );

  return {
    valid,
    count: canonical.hitCount,
    summary: `opportunity-query canonical=${canonical.hitCount} suppliers=${suppliers.hitCount} tenders=${tenders.hitCount} highPriority=${highPriority.hitCount} valid=${valid}`,
  };
}

export function validateIndustryOpportunity(): IndustryOpportunityValidation {
  const opportunityRegistry = validateOpportunityRegistry();
  const opportunityContext = validateOpportunityContextRegistry();
  const opportunityQuery = validateOpportunityQueryRegistry();

  return {
    valid:
      opportunityRegistry.valid && opportunityContext.valid && opportunityQuery.valid,
    opportunityRegistry,
    opportunityContext,
    opportunityQuery,
  };
}
