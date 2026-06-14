import { getAssignmentsByTarget } from "@/lib/industry/classification/category-assignment";
import { getAllCategories } from "@/lib/industry/classification/category-registry";
import { getAllOrganizations } from "@/lib/industry/organization-registry";
import { getAllActiveRelationships } from "../relationship-registry";
import type { IndustryRelationshipType } from "../shared/types";
import { buildIndustryGraph } from "../graph/graph";
import type { ConnectedNodeRank, NetworkMetrics, NodeDegreeMetric } from "./types";

function emptyTypeBreakdown(): Record<IndustryRelationshipType, number> {
  return {
    SUPPLIES: 0,
    DISTRIBUTES: 0,
    REPRESENTS: 0,
    CONSULTS: 0,
    OWNS: 0,
    PARTNERS_WITH: 0,
    BID_ON: 0,
    SERVES: 0,
  };
}

export function computeRelationshipTypeBreakdown(): Record<IndustryRelationshipType, number> {
  const breakdown = emptyTypeBreakdown();
  for (const relationship of getAllActiveRelationships()) {
    breakdown[relationship.relationshipType] += 1;
  }
  return breakdown;
}

export function computeNodeDegree(nodeId: string): NodeDegreeMetric {
  const graph = buildIndustryGraph();
  const node = graph.nodes.find((entry) => entry.nodeId === nodeId);
  const relationships = getAllActiveRelationships();

  const inboundDegree = relationships.filter((relationship) => relationship.targetId === nodeId).length;
  const outboundDegree = relationships.filter((relationship) => relationship.sourceId === nodeId).length;

  return {
    nodeId,
    label: node?.label ?? nodeId,
    inboundDegree,
    outboundDegree,
    totalDegree: inboundDegree + outboundDegree,
    mode: "industry-network-analytics",
  };
}

export function computeAllNodeDegrees(): NodeDegreeMetric[] {
  const graph = buildIndustryGraph();
  return graph.nodes
    .map((node) => computeNodeDegree(node.nodeId))
    .sort((a, b) => b.totalDegree - a.totalDegree);
}

export function computeTopConnectedNodes(limit = 5): ConnectedNodeRank[] {
  return computeAllNodeDegrees()
    .slice(0, limit)
    .map((metric, index) => ({
      nodeId: metric.nodeId,
      label: metric.label,
      totalDegree: metric.totalDegree,
      rank: index + 1,
      mode: "industry-network-analytics" as const,
    }));
}

export function computeRelationshipDensity(): number {
  const graph = buildIndustryGraph();
  if (graph.nodeCount <= 1) {
    return 0;
  }

  const maxDirectedEdges = graph.nodeCount * (graph.nodeCount - 1);
  return Number((graph.edgeCount / maxDirectedEdges).toFixed(4));
}

export function computeCategoryCoverage(): number {
  const categories = getAllCategories();
  const graph = buildIndustryGraph();
  const coveredCategoryIds = new Set<string>();

  for (const node of graph.nodes) {
    const assignments =
      node.nodeType === "organization"
        ? getAssignmentsByTarget("organization", node.nodeId)
        : getAssignmentsByTarget("directory-entry", node.nodeId);

    for (const assignment of assignments) {
      coveredCategoryIds.add(assignment.categoryId);
    }
  }

  if (categories.length === 0) {
    return 0;
  }

  return Number((coveredCategoryIds.size / categories.length).toFixed(4));
}

export function computeOrganizationCoverage(): number {
  const organizations = getAllOrganizations();
  const graph = buildIndustryGraph();
  const graphOrgIds = new Set(
    graph.nodes.filter((node) => node.nodeType === "organization").map((node) => node.nodeId),
  );

  const covered = organizations.filter((organization) => graphOrgIds.has(organization.organizationId)).length;

  if (organizations.length === 0) {
    return 0;
  }

  return Number((covered / organizations.length).toFixed(4));
}

export function buildNetworkMetrics(): NetworkMetrics {
  const graph = buildIndustryGraph();
  const nodeDegrees = computeAllNodeDegrees();
  const totalDegreeSum = nodeDegrees.reduce((sum, metric) => sum + metric.totalDegree, 0);
  const averageDegree = graph.nodeCount > 0 ? Number((totalDegreeSum / graph.nodeCount).toFixed(4)) : 0;

  return {
    nodeCount: graph.nodeCount,
    edgeCount: graph.edgeCount,
    relationshipDensity: computeRelationshipDensity(),
    averageDegree,
    relationshipTypeBreakdown: computeRelationshipTypeBreakdown(),
    categoryCoverage: computeCategoryCoverage(),
    organizationCoverage: computeOrganizationCoverage(),
    mode: "industry-network-analytics",
  };
}
