import { validateInsightContextRegistry } from "./insight-context";
import {
  buildIndustryInsights,
  getInsightsBySubject,
  getInsightsByType,
  validateInsightRegistry,
} from "./insight-registry";
import type {
  IndustryInsight,
  IndustryInsightType,
  IndustryInsightValidation,
  InsightQuery,
  InsightQueryResult,
  RegistryValidation,
} from "./shared/types";
import { CANONICAL_INSIGHT_QUERY, CANONICAL_INSIGHT_SUBJECT_ID } from "./shared/types";

function applyInsightQuery(input: InsightQuery, source: IndustryInsight[]): IndustryInsight[] {
  let insights = [...source];

  if (input.subjectId) {
    insights = insights.filter((insight) => insight.subjectId === input.subjectId);
  }

  if (input.insightType) {
    insights = insights.filter((insight) => insight.insightType === input.insightType);
  }

  if (input.priority) {
    insights = insights.filter((insight) => insight.priority === input.priority);
  }

  if (input.keyword) {
    const normalized = input.keyword.toLowerCase();
    insights = insights.filter(
      (insight) =>
        insight.title.toLowerCase().includes(normalized) ||
        insight.summary.toLowerCase().includes(normalized) ||
        insight.explanation.toLowerCase().includes(normalized) ||
        Object.values(insight.metadata).some((value) => value.toLowerCase().includes(normalized)),
    );
  }

  if (input.limit !== undefined) {
    insights = insights.slice(0, input.limit);
  }

  return insights;
}

function toQueryResult(query: InsightQuery, insights: IndustryInsight[]): InsightQueryResult {
  const queryParts = [
    query.subjectId ?? "all-subjects",
    query.insightType ?? "all-types",
    query.priority ?? "all-priorities",
    query.keyword ?? "no-keyword",
    query.limit?.toString() ?? "no-limit",
  ];

  return {
    queryId: `insight-query-${queryParts.join("-")}`,
    query,
    insights,
    hitCount: insights.length,
    insightReady: insights.length > 0,
  };
}

export function findTrends(limit = 5): InsightQueryResult {
  return toQueryResult(
    { insightType: "trend", limit },
    applyInsightQuery({ insightType: "trend", limit }, getInsightsByType("trend")),
  );
}

export function findOpportunities(limit = 5): InsightQueryResult {
  return toQueryResult(
    { insightType: "opportunity", limit },
    applyInsightQuery({ insightType: "opportunity", limit }, getInsightsByType("opportunity")),
  );
}

export function findRisks(limit = 5): InsightQueryResult {
  return toQueryResult(
    { insightType: "risk", limit },
    applyInsightQuery({ insightType: "risk", limit }, getInsightsByType("risk")),
  );
}

export function findGrowthSignals(limit = 5): InsightQueryResult {
  return toQueryResult(
    { insightType: "growth", limit },
    applyInsightQuery({ insightType: "growth", limit }, getInsightsByType("growth")),
  );
}

export function findNetworkChanges(limit = 5): InsightQueryResult {
  return toQueryResult(
    { insightType: "network-change", limit },
    applyInsightQuery({ insightType: "network-change", limit }, getInsightsByType("network-change")),
  );
}

export function executeInsightQuery(query: InsightQuery = {}): InsightQueryResult {
  const insights = applyInsightQuery(query, buildIndustryInsights());
  return toQueryResult(query, insights);
}

export function validateInsightQueryRegistry(): RegistryValidation {
  const canonical = executeInsightQuery(CANONICAL_INSIGHT_QUERY);
  const trends = findTrends(3);
  const opportunities = findOpportunities(3);
  const risks = findRisks(3);
  const growth = findGrowthSignals(3);
  const networkChanges = findNetworkChanges(3);
  const subjectInsights = getInsightsBySubject(CANONICAL_INSIGHT_SUBJECT_ID);

  const valid =
    canonical.insightReady &&
    canonical.hitCount >= 1 &&
    trends.hitCount >= 2 &&
    opportunities.hitCount >= 2 &&
    risks.hitCount >= 1 &&
    growth.hitCount >= 1 &&
    networkChanges.hitCount >= 2 &&
    subjectInsights.length >= 3 &&
    canonical.insights.every(
      (insight) =>
        insight.signalIds.length + insight.eventIds.length + insight.observationIds.length > 0,
    );

  return {
    valid,
    count: canonical.hitCount,
    summary: `insight-query canonical=${canonical.hitCount} trends=${trends.hitCount} opportunities=${opportunities.hitCount} growth=${growth.hitCount} valid=${valid}`,
  };
}

export function validateIndustryInsight(): IndustryInsightValidation {
  const insightRegistry = validateInsightRegistry();
  const insightContext = validateInsightContextRegistry();
  const insightQuery = validateInsightQueryRegistry();

  return {
    valid: insightRegistry.valid && insightContext.valid && insightQuery.valid,
    insightRegistry,
    insightContext,
    insightQuery,
  };
}
