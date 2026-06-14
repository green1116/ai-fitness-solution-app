import { buildIndustryGraph } from "../graph/graph";
import type { RegistryValidation } from "../shared/types";
import {
  buildNetworkMetrics,
  computeAllNodeDegrees,
  computeTopConnectedNodes,
} from "./network-metrics";
import type { NetworkSnapshot } from "./types";
import { CANONICAL_ANALYTICS_NODE_ID, INDUSTRY_ANALYTICS_VERSION } from "./types";

export function buildNetworkSnapshot(): NetworkSnapshot {
  const graph = buildIndustryGraph();
  const metrics = buildNetworkMetrics();
  const nodeDegrees = computeAllNodeDegrees();
  const topConnectedNodes = computeTopConnectedNodes(5);

  return {
    snapshotId: `network-snapshot-${INDUSTRY_ANALYTICS_VERSION}`,
    capturedAt: "2026-06-13T00:00:00.000Z",
    graphId: graph.graphId,
    metrics,
    nodeDegrees,
    topConnectedNodes,
    mode: "industry-network-analytics",
  };
}

export function validateNetworkSnapshot(): RegistryValidation {
  const snapshot = buildNetworkSnapshot();
  const canonicalDegree = snapshot.nodeDegrees.find(
    (metric) => metric.nodeId === CANONICAL_ANALYTICS_NODE_ID,
  );

  const valid =
    snapshot.nodeDegrees.length >= 10 &&
    snapshot.topConnectedNodes.length >= 5 &&
    snapshot.metrics.nodeCount >= 10 &&
    snapshot.metrics.edgeCount >= 13 &&
    snapshot.metrics.relationshipDensity > 0 &&
    snapshot.metrics.categoryCoverage > 0 &&
    snapshot.metrics.organizationCoverage > 0 &&
    canonicalDegree !== undefined &&
    canonicalDegree.totalDegree >= 5 &&
    snapshot.topConnectedNodes[0]!.rank === 1;

  return {
    valid,
    count: snapshot.nodeDegrees.length,
    summary: `network-snapshot nodes=${snapshot.nodeDegrees.length} top=${snapshot.topConnectedNodes.length} density=${snapshot.metrics.relationshipDensity} valid=${valid}`,
  };
}
