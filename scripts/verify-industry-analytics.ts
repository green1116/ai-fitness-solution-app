/**
 * V31 Industry Relationship Network — Phase 3 Network Analytics verification
 */
import {
  buildIndustryAnalyticsContext,
  buildNetworkMetrics,
  buildNetworkSnapshot,
  CANONICAL_ANALYTICS_NODE_ID,
  CANONICAL_ANALYTICS_QUERY,
  computeCategoryCoverage,
  computeNodeDegree,
  computeOrganizationCoverage,
  computeRelationshipDensity,
  computeRelationshipTypeBreakdown,
  computeTopConnectedNodes,
  executeAnalyticsQuery,
  INDUSTRY_ANALYTICS_TAG,
  INDUSTRY_ANALYTICS_VERSION,
  queryNodeDegree,
  queryTopConnectedNodes,
  validateAnalyticsContextRegistry,
  validateAnalyticsQueryRegistry,
  validateIndustryAnalyticsContext,
  validateIndustryNetworkAnalytics,
  validateNetworkMetricsRegistry,
  validateNetworkSnapshot,
} from "../lib/industry-relationship";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function testNetworkMetrics() {
  const result = validateNetworkMetricsRegistry();
  assert(result.valid, "network metrics valid");

  const metrics = buildNetworkMetrics();
  const breakdown = computeRelationshipTypeBreakdown();
  const density = computeRelationshipDensity();
  const categoryCoverage = computeCategoryCoverage();
  const organizationCoverage = computeOrganizationCoverage();

  assert(metrics.nodeCount >= 10, "node count");
  assert(metrics.edgeCount >= 13, "edge count");
  assert(density > 0, "relationship density");
  assert(Object.values(breakdown).every((count) => count > 0), "type breakdown");
  assert(categoryCoverage > 0, "category coverage");
  assert(organizationCoverage > 0, "organization coverage");

  console.log("✓ network metrics");
  console.log(" ", result.summary);
}

function testNetworkSnapshot() {
  const result = validateNetworkSnapshot();
  assert(result.valid, "network snapshot valid");

  const snapshot = buildNetworkSnapshot();
  assert(snapshot.topConnectedNodes.length >= 5, "top connected nodes");
  assert(snapshot.nodeDegrees.length >= 10, "node degrees in snapshot");

  console.log("✓ network snapshot");
  console.log(" ", result.summary);
}

function testAnalyticsContext() {
  const result = validateAnalyticsContextRegistry();
  assert(result.valid, "analytics context registry valid");

  const context = buildIndustryAnalyticsContext();
  assert(validateIndustryAnalyticsContext(context), "analytics context valid");
  assert(context.analyticsReady, "analytics ready");

  console.log("✓ analytics context");
  console.log(" ", result.summary);
}

function testAnalyticsQuery() {
  const result = validateAnalyticsQueryRegistry();
  assert(result.valid, "analytics query registry valid");

  const canonical = executeAnalyticsQuery(CANONICAL_ANALYTICS_QUERY);
  const nodeDegree = computeNodeDegree(CANONICAL_ANALYTICS_NODE_ID);
  const topNodes = computeTopConnectedNodes(5);
  const degreeQuery = queryNodeDegree(CANONICAL_ANALYTICS_NODE_ID);
  const topQuery = queryTopConnectedNodes(3);

  assert(canonical.analyticsReady, "canonical query ready");
  assert(nodeDegree.totalDegree >= 5, "node degree");
  assert(topNodes.length >= 5, "top connected nodes");
  assert(topNodes[0]!.rank === 1, "top rank");
  assert(degreeQuery.nodeDegree !== undefined, "degree query");
  assert(topQuery.topConnectedNodes?.length === 3, "top query limit");

  console.log("✓ analytics query");
  console.log(" ", result.summary);
  console.log(
    " ",
    `degree=${nodeDegree.totalDegree} top1=${topNodes[0]!.nodeId} density=${canonical.metrics!.relationshipDensity}`,
  );
}

function testIndustryNetworkAnalytics() {
  const validation = validateIndustryNetworkAnalytics();
  assert(validation.valid, "industry network analytics validation");
  assert(INDUSTRY_ANALYTICS_VERSION === "v31-industry-analytics-1", "analytics version");
  assert(INDUSTRY_ANALYTICS_TAG === "v31-industry-analytics-foundation", "analytics tag");

  console.log("✓ industry network analytics validation");
  console.log(
    " ",
    `metrics=${validation.networkMetrics.valid} snapshot=${validation.networkSnapshot.valid} context=${validation.analyticsContext.valid} query=${validation.analyticsQuery.valid}`,
  );
}

testNetworkMetrics();
testNetworkSnapshot();
testAnalyticsContext();
testAnalyticsQuery();
testIndustryNetworkAnalytics();
console.log("Industry Network Analytics Foundation PASS");
