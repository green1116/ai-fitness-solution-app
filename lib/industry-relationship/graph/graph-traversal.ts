import { getAllActiveRelationships } from "../relationship-registry";
import type { IndustryRelationship, IndustryRelationshipType, RegistryValidation } from "../shared/types";
import { buildIndustryGraph } from "./graph";
import { validateGraphContextRegistry } from "./graph-context";
import { validateIndustryGraph } from "./graph";
import type {
  GraphPath,
  GraphTraversalResult,
  IndustryGraphQueryValidation,
} from "./types";
import {
  CANONICAL_GRAPH_NODE_ID,
  CANONICAL_GRAPH_PATH_QUERY,
  CANONICAL_MULTI_HOP_PATH_QUERY,
} from "./types";

function activeRelationships(): IndustryRelationship[] {
  return getAllActiveRelationships();
}

function toTraversalResult(
  anchorNodeId: string,
  relationships: IndustryRelationship[],
): GraphTraversalResult {
  const neighborNodeIds = new Set<string>();

  for (const relationship of relationships) {
    if (relationship.sourceId === anchorNodeId) {
      neighborNodeIds.add(relationship.targetId);
    }
    if (relationship.targetId === anchorNodeId) {
      neighborNodeIds.add(relationship.sourceId);
    }
  }

  return {
    traversalId: `graph-traversal-${anchorNodeId}`,
    anchorNodeId,
    relationships,
    neighborNodeIds: [...neighborNodeIds],
    hitCount: relationships.length,
    traversalReady: relationships.length > 0,
  };
}

export function findNeighbors(nodeId: string): GraphTraversalResult {
  const relationships = activeRelationships().filter(
    (relationship) => relationship.sourceId === nodeId || relationship.targetId === nodeId,
  );
  return toTraversalResult(nodeId, relationships);
}

export function findInbound(nodeId: string): GraphTraversalResult {
  const relationships = activeRelationships().filter(
    (relationship) => relationship.targetId === nodeId,
  );
  return toTraversalResult(nodeId, relationships);
}

export function findOutbound(nodeId: string): GraphTraversalResult {
  const relationships = activeRelationships().filter(
    (relationship) => relationship.sourceId === nodeId,
  );
  return toTraversalResult(nodeId, relationships);
}

export function findByRelationshipType(
  relationshipType: IndustryRelationshipType,
  nodeId?: string,
): GraphTraversalResult {
  let relationships = activeRelationships().filter(
    (relationship) => relationship.relationshipType === relationshipType,
  );

  if (nodeId) {
    relationships = relationships.filter(
      (relationship) => relationship.sourceId === nodeId || relationship.targetId === nodeId,
    );
  }

  return toTraversalResult(nodeId ?? `type-${relationshipType}`, relationships);
}

export function findPath(sourceId: string, targetId: string): GraphPath {
  if (sourceId === targetId) {
    return {
      pathId: `graph-path-${sourceId}-${targetId}`,
      sourceId,
      targetId,
      nodeIds: [sourceId],
      edgeIds: [],
      hopCount: 0,
      found: true,
      mode: "industry-graph-query",
    };
  }

  const adjacency = new Map<string, { targetId: string; edgeId: string }[]>();
  for (const relationship of activeRelationships()) {
    const edges = adjacency.get(relationship.sourceId) ?? [];
    edges.push({ targetId: relationship.targetId, edgeId: relationship.relationshipId });
    adjacency.set(relationship.sourceId, edges);
  }

  const queue: string[] = [sourceId];
  const visited = new Set<string>([sourceId]);
  const previousNode = new Map<string, string>();
  const previousEdge = new Map<string, string>();

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current === targetId) {
      break;
    }

    for (const edge of adjacency.get(current) ?? []) {
      if (visited.has(edge.targetId)) {
        continue;
      }
      visited.add(edge.targetId);
      previousNode.set(edge.targetId, current);
      previousEdge.set(edge.targetId, edge.edgeId);
      queue.push(edge.targetId);
    }
  }

  if (!previousNode.has(targetId) && sourceId !== targetId) {
    return {
      pathId: `graph-path-${sourceId}-${targetId}`,
      sourceId,
      targetId,
      nodeIds: [],
      edgeIds: [],
      hopCount: -1,
      found: false,
      mode: "industry-graph-query",
    };
  }

  const nodeIds: string[] = [];
  const edgeIds: string[] = [];
  let cursor: string | undefined = targetId;

  while (cursor !== undefined && cursor !== sourceId) {
    nodeIds.unshift(cursor);
    const edgeId = previousEdge.get(cursor);
    if (edgeId) {
      edgeIds.unshift(edgeId);
    }
    cursor = previousNode.get(cursor);
  }
  nodeIds.unshift(sourceId);

  return {
    pathId: `graph-path-${sourceId}-${targetId}`,
    sourceId,
    targetId,
    nodeIds,
    edgeIds,
    hopCount: edgeIds.length,
    found: true,
    mode: "industry-graph-query",
  };
}

export function validateGraphTraversalRegistry(): RegistryValidation {
  const neighbors = findNeighbors(CANONICAL_GRAPH_NODE_ID);
  const inbound = findInbound("ind-org-buyer-sh-gym");
  const outbound = findOutbound(CANONICAL_GRAPH_NODE_ID);
  const supplies = findByRelationshipType("SUPPLIES", CANONICAL_GRAPH_NODE_ID);
  const directPath = findPath(
    CANONICAL_GRAPH_PATH_QUERY.sourceId,
    CANONICAL_GRAPH_PATH_QUERY.targetId,
  );
  const multiHopPath = findPath(
    CANONICAL_MULTI_HOP_PATH_QUERY.sourceId,
    CANONICAL_MULTI_HOP_PATH_QUERY.targetId,
  );

  const graph = buildIndustryGraph();

  const valid =
    neighbors.traversalReady &&
    neighbors.neighborNodeIds.length >= 2 &&
    inbound.hitCount >= 4 &&
    outbound.hitCount >= 5 &&
    supplies.hitCount >= 1 &&
    directPath.found &&
    directPath.hopCount >= 1 &&
    multiHopPath.found &&
    multiHopPath.hopCount >= 2 &&
    graph.nodeCount >= 10;

  return {
    valid,
    count: neighbors.hitCount,
    summary: `graph-traversal neighbors=${neighbors.neighborNodeIds.length} directPath=${directPath.hopCount} multiHop=${multiHopPath.hopCount} valid=${valid}`,
  };
}

export function validateIndustryGraphQuery(): IndustryGraphQueryValidation {
  const graph = validateIndustryGraph();
  const graphContext = validateGraphContextRegistry();
  const graphTraversal = validateGraphTraversalRegistry();

  return {
    valid: graph.valid && graphContext.valid && graphTraversal.valid,
    graph,
    graphContext,
    graphTraversal,
  };
}
