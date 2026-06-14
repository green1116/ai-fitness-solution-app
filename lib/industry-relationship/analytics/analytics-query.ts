import type { RegistryValidation } from "../shared/types";
import { validateAnalyticsContextRegistry } from "./analytics-context";
import {
  buildNetworkMetrics,
  computeNodeDegree,
  computeRelationshipTypeBreakdown,
  computeTopConnectedNodes,
} from "./network-metrics";
import { validateNetworkSnapshot } from "./network-snapshot";
import type {
  AnalyticsQuery,
  AnalyticsQueryResult,
  IndustryNetworkAnalyticsValidation,
} from "./types";
import { CANONICAL_ANALYTICS_NODE_ID, CANONICAL_ANALYTICS_QUERY } from "./types";

export function executeAnalyticsQuery(input: AnalyticsQuery = {}): AnalyticsQueryResult {
  const metrics = buildNetworkMetrics();
  const topLimit = input.topLimit ?? 5;

  const result: AnalyticsQueryResult = {
    queryId: `analytics-query-${input.nodeId ?? "all"}-${topLimit}-${input.relationshipType ?? "all-types"}`,
    query: input,
    metrics,
    relationshipTypeBreakdown: computeRelationshipTypeBreakdown(),
    analyticsReady: metrics.nodeCount > 0,
  };

  if (input.nodeId) {
    result.nodeDegree = computeNodeDegree(input.nodeId);
  }

  result.topConnectedNodes = computeTopConnectedNodes(topLimit);

  if (input.relationshipType) {
    const count = metrics.relationshipTypeBreakdown[input.relationshipType] ?? 0;
    result.analyticsReady = result.analyticsReady && count > 0;
  }

  return result;
}

export function queryNodeDegree(nodeId: string): AnalyticsQueryResult {
  return executeAnalyticsQuery({ nodeId });
}

export function queryTopConnectedNodes(topLimit = 5): AnalyticsQueryResult {
  return executeAnalyticsQuery({ topLimit });
}

export function validateNetworkMetricsRegistry(): RegistryValidation {
  const metrics = buildNetworkMetrics();
  const breakdownValues = Object.values(metrics.relationshipTypeBreakdown);

  const valid =
    metrics.nodeCount >= 10 &&
    metrics.edgeCount >= 13 &&
    metrics.relationshipDensity > 0 &&
    metrics.averageDegree > 0 &&
    breakdownValues.length === 8 &&
    breakdownValues.every((count) => count > 0) &&
    metrics.categoryCoverage > 0 &&
    metrics.organizationCoverage > 0;

  return {
    valid,
    count: metrics.edgeCount,
    summary: `network-metrics nodes=${metrics.nodeCount} density=${metrics.relationshipDensity} category=${metrics.categoryCoverage} org=${metrics.organizationCoverage} valid=${valid}`,
  };
}

export function validateAnalyticsQueryRegistry(): RegistryValidation {
  const canonical = executeAnalyticsQuery(CANONICAL_ANALYTICS_QUERY);
  const degreeOnly = queryNodeDegree(CANONICAL_ANALYTICS_NODE_ID);
  const topNodes = queryTopConnectedNodes(3);
  const suppliesQuery = executeAnalyticsQuery({ relationshipType: "SUPPLIES" });

  const valid =
    canonical.analyticsReady &&
    canonical.nodeDegree !== undefined &&
    canonical.nodeDegree.totalDegree >= 5 &&
    canonical.topConnectedNodes !== undefined &&
    canonical.topConnectedNodes.length >= 3 &&
    degreeOnly.nodeDegree !== undefined &&
    topNodes.topConnectedNodes !== undefined &&
    topNodes.topConnectedNodes.length === 3 &&
    suppliesQuery.relationshipTypeBreakdown!.SUPPLIES >= 2;

  return {
    valid,
    count: canonical.topConnectedNodes?.length ?? 0,
    summary: `analytics-query canonicalDegree=${canonical.nodeDegree?.totalDegree ?? 0} top=${canonical.topConnectedNodes?.length ?? 0} supplies=${suppliesQuery.relationshipTypeBreakdown!.SUPPLIES} valid=${valid}`,
  };
}

export function validateIndustryNetworkAnalytics(): IndustryNetworkAnalyticsValidation {
  const networkMetrics = validateNetworkMetricsRegistry();
  const networkSnapshot = validateNetworkSnapshot();
  const analyticsContext = validateAnalyticsContextRegistry();
  const analyticsQuery = validateAnalyticsQueryRegistry();

  return {
    valid:
      networkMetrics.valid &&
      networkSnapshot.valid &&
      analyticsContext.valid &&
      analyticsQuery.valid,
    networkMetrics,
    networkSnapshot,
    analyticsContext,
    analyticsQuery,
  };
}
