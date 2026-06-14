import { getDirectoryEntryById } from "@/lib/industry/directory/organization-directory";
import { getOrganizationById } from "@/lib/industry/organization-registry";
import { getAllActiveRelationships } from "../relationship-registry";
import type { IndustryRelationshipEndpointType, RegistryValidation } from "../shared/types";
import type { GraphEdge, GraphNode, IndustryGraph } from "./types";
import { INDUSTRY_GRAPH_QUERY_VERSION } from "./types";

function resolveNodeLabel(nodeId: string, nodeType: IndustryRelationshipEndpointType): string {
  if (nodeType === "organization") {
    return getOrganizationById(nodeId)?.organizationName ?? nodeId;
  }
  return getDirectoryEntryById(nodeId)?.displayName ?? nodeId;
}

function collectEndpointTypes(
  nodeId: string,
  relationships: ReturnType<typeof getAllActiveRelationships>,
): IndustryRelationshipEndpointType {
  const asSource = relationships.find((relationship) => relationship.sourceId === nodeId);
  if (asSource) {
    return asSource.sourceType;
  }
  const asTarget = relationships.find((relationship) => relationship.targetId === nodeId);
  return asTarget?.targetType ?? "organization";
}

export function buildIndustryGraph(): IndustryGraph {
  const relationships = getAllActiveRelationships();
  const nodeIds = new Set<string>();

  for (const relationship of relationships) {
    nodeIds.add(relationship.sourceId);
    nodeIds.add(relationship.targetId);
  }

  const nodes: GraphNode[] = [...nodeIds].map((nodeId) => {
    const nodeType = collectEndpointTypes(nodeId, relationships);
    return {
      nodeId,
      nodeType,
      label: resolveNodeLabel(nodeId, nodeType),
      mode: "industry-graph-query",
    };
  });

  const edges: GraphEdge[] = relationships.map((relationship) => ({
    edgeId: relationship.relationshipId,
    sourceId: relationship.sourceId,
    targetId: relationship.targetId,
    relationshipType: relationship.relationshipType,
    mode: "industry-graph-query",
  }));

  return {
    graphId: `industry-graph-${INDUSTRY_GRAPH_QUERY_VERSION}`,
    nodes,
    edges,
    nodeCount: nodes.length,
    edgeCount: edges.length,
    mode: "industry-graph-query",
  };
}

export function getGraphNodeById(nodeId: string): GraphNode | undefined {
  return buildIndustryGraph().nodes.find((node) => node.nodeId === nodeId);
}

export function validateIndustryGraph(): RegistryValidation {
  const graph = buildIndustryGraph();
  const relationships = getAllActiveRelationships();

  const edgeValid = graph.edges.every(
    (edge) =>
      graph.nodes.some((node) => node.nodeId === edge.sourceId) &&
      graph.nodes.some((node) => node.nodeId === edge.targetId) &&
      relationships.some((relationship) => relationship.relationshipId === edge.edgeId),
  );

  const nodeValid = graph.nodes.every(
    (node) => node.nodeId.length > 0 && node.label.length > 0 && node.mode === "industry-graph-query",
  );

  const valid =
    graph.nodeCount >= 10 &&
    graph.edgeCount === relationships.length &&
    graph.edgeCount >= 13 &&
    edgeValid &&
    nodeValid;

  return {
    valid,
    count: graph.edgeCount,
    summary: `industry-graph nodes=${graph.nodeCount} edges=${graph.edgeCount} valid=${valid}`,
  };
}
