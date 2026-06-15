/**
 * V40 Requirement Intelligence — Phase 2 verification
 */
import {
  buildRequirementGraph,
  buildRequirementGraphContext,
  findRequirementNodesByType,
  findRequirementPathFromTenderToEvidence,
  findTenderRequirementEvidencePaths,
  REQUIREMENT_GRAPH_MIN_EDGE_COUNT,
  REQUIREMENT_GRAPH_MIN_NODE_COUNT,
  REQUIREMENT_INTELLIGENCE_P2_TAG,
  REQUIREMENT_INTELLIGENCE_VERSION,
  reverseTraceRequirementEdge,
  traverseRequirementFromTender,
  validateRequirementIntelligenceNetworkPhase2,
} from "../lib/requirement-intelligence";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

const validation = validateRequirementIntelligenceNetworkPhase2();
assert(validation.valid, "phase2 validation");
assert(validation.phase1.valid, "phase1 regression");
assert(validation.requirementGraph.valid, "requirement graph registry");

const graph = buildRequirementGraph();
assert(graph.nodeCount >= REQUIREMENT_GRAPH_MIN_NODE_COUNT, "node count");
assert(graph.edgeCount >= REQUIREMENT_GRAPH_MIN_EDGE_COUNT, "edge count");
assert(new Set(graph.nodes.map((node) => node.nodeId)).size === graph.nodes.length, "node id unique");
assert(new Set(graph.edges.map((edge) => edge.edgeId)).size === graph.edges.length, "edge id unique");

const context = buildRequirementGraphContext();
assert(context.contextReady, "graph context ready");
assert(context.tenderCount >= 15, "tender nodes");
assert(context.requirementCount >= 50, "requirement nodes");
assert(context.evidenceCount >= 30, "evidence nodes");
assert(context.brandCount >= 8, "brand nodes");
assert(context.isolatedNodeCount === 0, "no isolated nodes");

const traversal = traverseRequirementFromTender("tender-sh-commercial-gym-2025-001");
assert(traversal.pathCount >= 1, "tender requirement traversal");
assert(traversal.requirementNodeIds.length >= 1, "requirement nodes visited");

const requirementNodes = findRequirementNodesByType("requirement");
assert(requirementNodes.length >= 50, "findRequirementNodesByType requirement");

const paths = findTenderRequirementEvidencePaths();
assert(paths.length >= 3, "tender requirement evidence paths");
assert(
  paths.every((path) => path.pathKind === "tender-requirement-evidence"),
  "path kind",
);

const samplePath = paths[0]!;
const evidenceId = samplePath.nodeIds[2]!.replace("req-graph-node-evidence-", "");
const tenderId = samplePath.nodeIds[0]!.replace("req-graph-node-tender-", "");
const fullPath = findRequirementPathFromTenderToEvidence(tenderId, evidenceId);
assert(Boolean(fullPath), "findRequirementPath tender to evidence");

const trace = reverseTraceRequirementEdge(graph.edges[0]!.edgeId, graph);
assert(Boolean(trace), "reverseTraceRequirementEdge");
assert(Boolean(trace!.sourceRecordId), "reverse trace source record");
assert(Boolean(trace!.traceRef), "reverse trace ref");

console.log("✓ phase1 regression");
console.log("✓ requirement graph");
console.log(" ", validation.requirementGraph.summary);
console.log("✓ graph context");
console.log(
  " ",
  `nodes=${context.nodeCount} edges=${context.edgeCount} avgDegree=${context.averageDegree} density=${context.graphDensity} paths=${context.tenderEvidencePathCount}`,
);
console.log(
  " ",
  `version=${REQUIREMENT_INTELLIGENCE_VERSION} tag=${REQUIREMENT_INTELLIGENCE_P2_TAG}`,
);
console.log("Requirement Intelligence Phase 2 PASS");
