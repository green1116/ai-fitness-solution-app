import type { RequirementGraphValidation } from "../shared/types";
import {
  REQUIREMENT_GRAPH_MIN_BRAND_NODES,
  REQUIREMENT_GRAPH_MIN_EDGE_COUNT,
  REQUIREMENT_GRAPH_MIN_EVIDENCE_NODES,
  REQUIREMENT_GRAPH_MIN_NODE_COUNT,
  REQUIREMENT_GRAPH_MIN_REQUIREMENT_NODES,
  REQUIREMENT_GRAPH_MIN_TENDER_EVIDENCE_PATHS,
  REQUIREMENT_GRAPH_MIN_TENDER_NODES,
} from "../shared/types";
import { buildTenderRequirementEdges } from "./tender-requirement-edge";
import type { RequirementGraphEdge, GraphEdgeBase } from "./graph-edges";
import {
  buildRequirementGraph,
  countTenderRequirementEvidencePaths,
  buildTenderGraphNodeId,
  buildRequirementGraphNodeId,
  buildEvidenceGraphNodeId,
} from "./requirement-graph-context";
import type { RequirementGraphNode, RequirementGraphNodeType } from "./graph-nodes";

export interface RequirementTraversalResult {
  tenderId: string;
  startNodeId: string;
  visitedNodeIds: string[];
  visitedEdgeIds: string[];
  requirementNodeIds: string[];
  pathCount: number;
}

export interface RequirementPathResult {
  sourceNodeId: string;
  targetNodeId: string;
  nodeIds: string[];
  edgeIds: string[];
  pathKind: "direct" | "tender-requirement" | "tender-requirement-evidence";
  traceRefs: string[];
}

export interface RequirementEdgeReverseTraceResult {
  edge: GraphEdgeBase;
  sourceRecordId: string;
  traceRef: string;
  sourceNode?: RequirementGraphNode;
  targetNode?: RequirementGraphNode;
  registryRecordId?: string;
}

export function traverseRequirementFromTender(tenderId: string): RequirementTraversalResult {
  const graph = buildRequirementGraph();
  const startNodeId = buildTenderGraphNodeId(tenderId);
  const edgesBySource = new Map<string, RequirementGraphEdge[]>();

  for (const edge of graph.edges) {
    const bucket = edgesBySource.get(edge.sourceNodeId) ?? [];
    bucket.push(edge);
    edgesBySource.set(edge.sourceNodeId, bucket);
    if (edge.direction === "bidirectional") {
      const reverseBucket = edgesBySource.get(edge.targetNodeId) ?? [];
      reverseBucket.push({
        ...edge,
        sourceNodeId: edge.targetNodeId,
        targetNodeId: edge.sourceNodeId,
      });
      edgesBySource.set(edge.targetNodeId, reverseBucket);
    }
  }

  const visitedNodeIds: string[] = [];
  const visitedEdgeIds: string[] = [];
  const requirementNodeIds: string[] = [];
  const queue = [startNodeId];
  const seen = new Set<string>([startNodeId]);

  while (queue.length > 0) {
    const current = queue.shift()!;
    visitedNodeIds.push(current);

    if (current.startsWith("req-graph-node-requirement-")) {
      requirementNodeIds.push(current);
    }

    for (const edge of edgesBySource.get(current) ?? []) {
      if (!visitedEdgeIds.includes(edge.edgeId)) {
        visitedEdgeIds.push(edge.edgeId);
      }
      if (seen.has(edge.targetNodeId)) continue;
      seen.add(edge.targetNodeId);
      queue.push(edge.targetNodeId);
    }
  }

  return {
    tenderId,
    startNodeId,
    visitedNodeIds,
    visitedEdgeIds,
    requirementNodeIds,
    pathCount: requirementNodeIds.length,
  };
}

export function findRequirementNodesByType(
  nodeType: RequirementGraphNodeType,
): RequirementGraphNode[] {
  return buildRequirementGraph().nodes.filter((node) => node.nodeType === nodeType);
}

export function findRequirementPath(
  sourceNodeId: string,
  targetNodeId: string,
): RequirementPathResult | undefined {
  const graph = buildRequirementGraph();
  const edgesBySource = new Map<string, RequirementGraphEdge[]>();

  for (const edge of graph.edges) {
    const bucket = edgesBySource.get(edge.sourceNodeId) ?? [];
    bucket.push(edge);
    edgesBySource.set(edge.sourceNodeId, bucket);
  }

  const queue: Array<{ nodeId: string; nodeIds: string[]; edgeIds: string[]; traceRefs: string[] }> =
    [{ nodeId: sourceNodeId, nodeIds: [sourceNodeId], edgeIds: [], traceRefs: [] }];
  const seen = new Set<string>([sourceNodeId]);

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current.nodeId === targetNodeId) {
      return {
        sourceNodeId,
        targetNodeId,
        nodeIds: current.nodeIds,
        edgeIds: current.edgeIds,
        pathKind: resolvePathKind(current.nodeIds, graph.edges),
        traceRefs: current.traceRefs,
      };
    }

    for (const edge of edgesBySource.get(current.nodeId) ?? []) {
      if (seen.has(edge.targetNodeId)) continue;
      seen.add(edge.targetNodeId);
      queue.push({
        nodeId: edge.targetNodeId,
        nodeIds: [...current.nodeIds, edge.targetNodeId],
        edgeIds: [...current.edgeIds, edge.edgeId],
        traceRefs: [...current.traceRefs, edge.traceRef],
      });
    }
  }

  return undefined;
}

function resolvePathKind(
  nodeIds: string[],
  edges: RequirementGraphEdge[],
): RequirementPathResult["pathKind"] {
  if (nodeIds.length <= 2) return "direct";

  const pathEdges = nodeIds.slice(0, -1).flatMap((nodeId, index) => {
    const targetNodeId = nodeIds[index + 1]!;
    return edges.filter(
      (edge) => edge.sourceNodeId === nodeId && edge.targetNodeId === targetNodeId,
    );
  });

  if (pathEdges.some((edge) => edge.edgeType === "requirement-evidence")) {
    return "tender-requirement-evidence";
  }
  if (pathEdges.some((edge) => edge.edgeType === "tender-requirement")) {
    return "tender-requirement";
  }
  return "direct";
}

export function reverseTraceRequirementEdge(
  edgeId: string,
  graph = buildRequirementGraph(),
): RequirementEdgeReverseTraceResult | undefined {
  const edge = graph.edges.find((item) => item.edgeId === edgeId);
  if (!edge) return undefined;

  const nodesById = new Map(graph.nodes.map((node) => [node.nodeId, node]));

  return {
    edge,
    sourceRecordId: edge.sourceRecordId,
    traceRef: edge.traceRef,
    sourceNode: nodesById.get(edge.sourceNodeId),
    targetNode: nodesById.get(edge.targetNodeId),
    registryRecordId: edge.sourceRecordId,
  };
}

export function findTenderRequirementEvidencePaths(limit = 5): RequirementPathResult[] {
  const graph = buildRequirementGraph();
  const paths: RequirementPathResult[] = [];

  for (const tenderEdge of buildTenderRequirementEdges()) {
    const reqEvidenceEdge = graph.edges.find(
      (edge) =>
        edge.edgeType === "requirement-evidence" &&
        edge.sourceNodeId === tenderEdge.targetNodeId,
    );
    if (!reqEvidenceEdge) continue;

    paths.push({
      sourceNodeId: tenderEdge.sourceNodeId,
      targetNodeId: reqEvidenceEdge.targetNodeId,
      nodeIds: [tenderEdge.sourceNodeId, tenderEdge.targetNodeId, reqEvidenceEdge.targetNodeId],
      edgeIds: [tenderEdge.edgeId, reqEvidenceEdge.edgeId],
      pathKind: "tender-requirement-evidence",
      traceRefs: [tenderEdge.traceRef, reqEvidenceEdge.traceRef],
    });

    if (paths.length >= limit) break;
  }

  return paths;
}

export function findRequirementPathFromTenderToEvidence(
  tenderId: string,
  evidenceId: string,
): RequirementPathResult | undefined {
  return findRequirementPath(
    buildTenderGraphNodeId(tenderId),
    buildEvidenceGraphNodeId(evidenceId),
  );
}

export function validateRequirementGraphRegistry(): RequirementGraphValidation {
  const graph = buildRequirementGraph();
  const tenderCount = graph.nodes.filter((node) => node.nodeType === "tender").length;
  const requirementCount = graph.nodes.filter((node) => node.nodeType === "requirement").length;
  const evidenceCount = graph.nodes.filter((node) => node.nodeType === "evidence").length;
  const brandCount = graph.nodes.filter((node) => node.nodeType === "brand").length;
  const isolatedNodeCount = graph.nodes.filter((node) => {
    const connected = graph.edges.some(
      (edge) => edge.sourceNodeId === node.nodeId || edge.targetNodeId === node.nodeId,
    );
    return !connected;
  }).length;
  const averageDegree =
    graph.nodeCount === 0
      ? 0
      : Math.round(
          (graph.edges.reduce((sum, edge) => sum + 2, 0) / graph.nodeCount) * 100,
        ) / 100;
  const graphDensity =
    graph.nodeCount <= 1
      ? 0
      : Math.round(
          (graph.edges.length / (graph.nodeCount * (graph.nodeCount - 1))) * 10000,
        ) / 10000;
  const tenderEvidencePathCount = countTenderRequirementEvidencePaths(graph);

  const nodeIds = new Set(graph.nodes.map((node) => node.nodeId));
  const edgeIds = new Set(graph.edges.map((edge) => edge.edgeId));
  const nodeIdUnique = nodeIds.size === graph.nodes.length;
  const edgeIdUnique = edgeIds.size === graph.edges.length;

  const tenderCoverage = new Set(
    buildTenderRequirementEdges().map((edge) => edge.sourceNodeId),
  );
  const allTendersCovered = graph.nodes
    .filter((node) => node.nodeType === "tender")
    .every((node) => tenderCoverage.has(node.nodeId));

  const requirementNodes = graph.nodes.filter((node) => node.nodeType === "requirement");
  const connectedRequirements = new Set<string>();
  for (const edge of graph.edges) {
    if (edge.targetNodeId.startsWith("req-graph-node-requirement-")) {
      connectedRequirements.add(edge.targetNodeId);
    }
    if (edge.sourceNodeId.startsWith("req-graph-node-requirement-")) {
      connectedRequirements.add(edge.sourceNodeId);
    }
  }
  const noIsolatedRequirements = requirementNodes.every((node) =>
    connectedRequirements.has(node.nodeId),
  );

  const reverseTraceSample = graph.edges[0];
  const reverseTraceOk = reverseTraceSample
    ? Boolean(reverseTraceRequirementEdge(reverseTraceSample.edgeId, graph)?.sourceRecordId)
    : false;

  const contextReady =
    graph.graphReady &&
    tenderCount >= REQUIREMENT_GRAPH_MIN_TENDER_NODES &&
    requirementCount >= REQUIREMENT_GRAPH_MIN_REQUIREMENT_NODES &&
    evidenceCount >= REQUIREMENT_GRAPH_MIN_EVIDENCE_NODES &&
    brandCount >= REQUIREMENT_GRAPH_MIN_BRAND_NODES &&
    isolatedNodeCount === 0 &&
    noIsolatedRequirements &&
    tenderEvidencePathCount >= REQUIREMENT_GRAPH_MIN_TENDER_EVIDENCE_PATHS;

  const valid =
    graph.nodeCount >= REQUIREMENT_GRAPH_MIN_NODE_COUNT &&
    graph.edgeCount >= REQUIREMENT_GRAPH_MIN_EDGE_COUNT &&
    tenderCount >= REQUIREMENT_GRAPH_MIN_TENDER_NODES &&
    requirementCount >= REQUIREMENT_GRAPH_MIN_REQUIREMENT_NODES &&
    evidenceCount >= REQUIREMENT_GRAPH_MIN_EVIDENCE_NODES &&
    brandCount >= REQUIREMENT_GRAPH_MIN_BRAND_NODES &&
    nodeIdUnique &&
    edgeIdUnique &&
    allTendersCovered &&
    noIsolatedRequirements &&
    isolatedNodeCount === 0 &&
    tenderEvidencePathCount >= REQUIREMENT_GRAPH_MIN_TENDER_EVIDENCE_PATHS &&
    reverseTraceOk &&
    contextReady;

  return {
    valid,
    count: graph.edgeCount,
    summary: `requirement-graph nodes=${graph.nodeCount} edges=${graph.edgeCount} tenders=${tenderCount} requirements=${requirementCount} evidence=${evidenceCount} brands=${brandCount} isolated=${isolatedNodeCount} paths=${tenderEvidencePathCount} avgDegree=${averageDegree} density=${graphDensity} valid=${valid}`,
  };
}
