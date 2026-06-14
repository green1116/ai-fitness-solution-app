import { buildEvidenceRegistryRecords } from "../evidence-registry";
import type { EvidenceGraphValidation } from "../shared/types";
import {
  EVIDENCE_GRAPH_MIN_BRAND_NODES,
  EVIDENCE_GRAPH_MIN_EDGE_COUNT,
  EVIDENCE_GRAPH_MIN_EVIDENCE_NODES,
  EVIDENCE_GRAPH_MIN_NODE_COUNT,
  EVIDENCE_GRAPH_MIN_REQUIREMENT_STUB_PATHS,
} from "../shared/types";
import {
  buildBrandEvidenceEdges,
  buildBrandEvidenceEdgeId,
} from "./brand-evidence-edge";
import {
  buildBrandGraphNodeId,
  buildEvidenceGraphNodeId,
  buildRequirementStubNodeId,
  type EvidenceGraphNode,
  type GraphNodeType,
} from "./graph-nodes";
import type { EvidenceGraphEdge, GraphEdgeBase } from "./graph-edges";
import {
  buildEvidenceGraph,
  buildEvidenceGraphContext,
  countBrandEvidenceRequirementStubPaths,
} from "./evidence-graph-context";

export interface EvidenceTraversalResult {
  brandId: string;
  startNodeId: string;
  visitedNodeIds: string[];
  visitedEdgeIds: string[];
  evidenceNodeIds: string[];
  pathCount: number;
}

export interface EvidencePathResult {
  sourceNodeId: string;
  targetNodeId: string;
  nodeIds: string[];
  edgeIds: string[];
  pathKind: "direct" | "brand-evidence" | "brand-evidence-requirement-stub";
  traceRefs: string[];
}

export interface EdgeReverseTraceResult {
  edge: GraphEdgeBase;
  sourceRecordId: string;
  traceRef: string;
  sourceNode?: EvidenceGraphNode;
  targetNode?: EvidenceGraphNode;
  registryRecordId?: string;
}

export function traverseEvidenceFromBrand(brandId: string): EvidenceTraversalResult {
  const graph = buildEvidenceGraph();
  const startNodeId = buildBrandGraphNodeId(brandId);
  const edgesBySource = new Map<string, EvidenceGraphEdge[]>();

  for (const edge of graph.edges) {
    if (edge.edgeType === "evidence-requirement-stub") continue;
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
  const evidenceNodeIds: string[] = [];
  const queue = [startNodeId];
  const seen = new Set<string>([startNodeId]);

  while (queue.length > 0) {
    const current = queue.shift()!;
    visitedNodeIds.push(current);

    if (current.startsWith("graph-node-evidence-")) {
      evidenceNodeIds.push(current);
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
    brandId,
    startNodeId,
    visitedNodeIds,
    visitedEdgeIds,
    evidenceNodeIds,
    pathCount: evidenceNodeIds.length,
  };
}

export function findEvidenceNodesByType(nodeType: GraphNodeType): EvidenceGraphNode[] {
  return buildEvidenceGraph().nodes.filter((node) => node.nodeType === nodeType);
}

export function findEvidencePath(
  sourceNodeId: string,
  targetNodeId: string,
): EvidencePathResult | undefined {
  const graph = buildEvidenceGraph();
  const edgesBySource = new Map<string, EvidenceGraphEdge[]>();

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
      const pathKind = resolvePathKind(current.nodeIds, graph.edges);
      return {
        sourceNodeId,
        targetNodeId,
        nodeIds: current.nodeIds,
        edgeIds: current.edgeIds,
        pathKind,
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
  edges: EvidenceGraphEdge[],
): EvidencePathResult["pathKind"] {
  if (nodeIds.length <= 2) return "direct";

  const pathEdges = nodeIds.slice(0, -1).flatMap((nodeId, index) => {
    const targetNodeId = nodeIds[index + 1]!;
    return edges.filter(
      (edge) => edge.sourceNodeId === nodeId && edge.targetNodeId === targetNodeId,
    );
  });

  if (pathEdges.some((edge) => edge.edgeType === "evidence-requirement-stub")) {
    return "brand-evidence-requirement-stub";
  }
  if (pathEdges.some((edge) => edge.edgeType === "brand-evidence")) {
    return "brand-evidence";
  }
  return "direct";
}

export function reverseTraceEdge(edgeId: string): EdgeReverseTraceResult | undefined {
  const graph = buildEvidenceGraph();
  const edge = graph.edges.find((item) => item.edgeId === edgeId);
  if (!edge) return undefined;

  const nodesById = new Map(graph.nodes.map((node) => [node.nodeId, node]));
  const registryRecordId =
    edge.edgeType === "brand-evidence"
      ? buildEvidenceRegistryRecords().find(
          (record) =>
            buildBrandEvidenceEdgeId(record.brandId, record.evidenceId) === edge.edgeId,
        )?.evidenceId
      : edge.sourceRecordId;

  return {
    edge,
    sourceRecordId: edge.sourceRecordId,
    traceRef: edge.traceRef,
    sourceNode: nodesById.get(edge.sourceNodeId),
    targetNode: nodesById.get(edge.targetNodeId),
    registryRecordId,
  };
}

export function findBrandEvidenceRequirementStubPaths(limit = 5): EvidencePathResult[] {
  const graph = buildEvidenceGraph();
  const brandEdges = buildBrandEvidenceEdges();
  const paths: EvidencePathResult[] = [];

  for (const brandEdge of brandEdges) {
    const stubEdge = graph.edges.find(
      (edge) =>
        edge.edgeType === "evidence-requirement-stub" &&
        edge.sourceNodeId === brandEdge.targetNodeId,
    );
    if (!stubEdge) continue;

    paths.push({
      sourceNodeId: brandEdge.sourceNodeId,
      targetNodeId: stubEdge.targetNodeId,
      nodeIds: [brandEdge.sourceNodeId, brandEdge.targetNodeId, stubEdge.targetNodeId],
      edgeIds: [brandEdge.edgeId, stubEdge.edgeId],
      pathKind: "brand-evidence-requirement-stub",
      traceRefs: [brandEdge.traceRef, stubEdge.traceRef],
    });

    if (paths.length >= limit) break;
  }

  return paths;
}

export function validateEvidenceGraphRegistry(): EvidenceGraphValidation {
  const graph = buildEvidenceGraph();
  const context = buildEvidenceGraphContext();

  const nodeIds = new Set(graph.nodes.map((node) => node.nodeId));
  const edgeIds = new Set(graph.edges.map((edge) => edge.edgeId));
  const nodeIdUnique = nodeIds.size === graph.nodes.length;
  const edgeIdUnique = edgeIds.size === graph.edges.length;

  const brandEvidenceCoverage = buildBrandEvidenceEdges().reduce(
    (acc, edge) => {
      acc.add(edge.sourceNodeId);
      return acc;
    },
    new Set<string>(),
  );
  const allBrandsCovered = graph.nodes
    .filter((node) => node.nodeType === "brand")
    .every((node) => brandEvidenceCoverage.has(node.nodeId));

  const evidenceNodes = graph.nodes.filter((node) => node.nodeType === "evidence");
  const connectedEvidence = new Set<string>();
  for (const edge of graph.edges) {
    if (edge.edgeType === "evidence-requirement-stub") continue;
    if (edge.targetNodeId.startsWith("graph-node-evidence-")) {
      connectedEvidence.add(edge.targetNodeId);
    }
    if (edge.sourceNodeId.startsWith("graph-node-evidence-")) {
      connectedEvidence.add(edge.sourceNodeId);
    }
  }
  const noIsolatedEvidence = evidenceNodes.every((node) => connectedEvidence.has(node.nodeId));

  const stubPathCount = countBrandEvidenceRequirementStubPaths(graph);
  const reverseTraceSample = graph.edges[0];
  const reverseTraceOk = reverseTraceSample
    ? Boolean(reverseTraceEdge(reverseTraceSample.edgeId)?.sourceRecordId)
    : false;

  const valid =
    graph.nodeCount >= EVIDENCE_GRAPH_MIN_NODE_COUNT &&
    graph.edgeCount >= EVIDENCE_GRAPH_MIN_EDGE_COUNT &&
    context.brandCount >= EVIDENCE_GRAPH_MIN_BRAND_NODES &&
    context.evidenceCount >= EVIDENCE_GRAPH_MIN_EVIDENCE_NODES &&
    nodeIdUnique &&
    edgeIdUnique &&
    allBrandsCovered &&
    noIsolatedEvidence &&
    context.isolatedNodeCount === 0 &&
    stubPathCount >= EVIDENCE_GRAPH_MIN_REQUIREMENT_STUB_PATHS &&
    reverseTraceOk &&
    context.contextReady;

  return {
    valid,
    count: graph.edgeCount,
    summary: `evidence-graph nodes=${graph.nodeCount} edges=${graph.edgeCount} brands=${context.brandCount} evidence=${context.evidenceCount} isolated=${context.isolatedNodeCount} stubPaths=${stubPathCount} avgDegree=${context.averageDegree} density=${context.graphDensity} valid=${valid}`,
  };
}

export function findEvidencePathFromBrandToEvidence(
  brandId: string,
  evidenceId: string,
): EvidencePathResult | undefined {
  return findEvidencePath(
    buildBrandGraphNodeId(brandId),
    buildEvidenceGraphNodeId(evidenceId),
  );
}

export function findEvidencePathFromBrandToRequirementStub(
  brandId: string,
  evidenceId: string,
): EvidencePathResult | undefined {
  return findEvidencePath(
    buildBrandGraphNodeId(brandId),
    buildRequirementStubNodeId(evidenceId),
  );
}
