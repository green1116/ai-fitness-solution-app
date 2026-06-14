/**
 * V39 Evidence Intelligence Network — Phase 2 verification
 */
import {
  buildEvidenceGraph,
  buildEvidenceGraphContext,
  EVIDENCE_GRAPH_MIN_EDGE_COUNT,
  EVIDENCE_GRAPH_MIN_NODE_COUNT,
  EVIDENCE_INTELLIGENCE_NETWORK_P2_TAG,
  EVIDENCE_INTELLIGENCE_NETWORK_VERSION,
  findBrandEvidenceRequirementStubPaths,
  findEvidenceNodesByType,
  findEvidencePathFromBrandToEvidence,
  findEvidencePathFromBrandToRequirementStub,
  reverseTraceEdge,
  traverseEvidenceFromBrand,
  validateEvidenceIntelligenceNetworkPhase1,
  validateEvidenceIntelligenceNetworkPhase2,
} from "../lib/evidence-intelligence-network";
import { validateBrandIntelligenceNetworkFoundation } from "../lib/brand-intelligence-network";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

const phase1 = validateEvidenceIntelligenceNetworkPhase1();
assert(phase1.valid, "phase1 regression");

const validation = validateEvidenceIntelligenceNetworkPhase2();
assert(validation.valid, "phase2 validation");
assert(validation.evidenceGraph.valid, "evidence graph registry");

const graph = buildEvidenceGraph();
assert(graph.nodeCount >= EVIDENCE_GRAPH_MIN_NODE_COUNT, "node count");
assert(graph.edgeCount >= EVIDENCE_GRAPH_MIN_EDGE_COUNT, "edge count");
assert(new Set(graph.nodes.map((node) => node.nodeId)).size === graph.nodes.length, "node id unique");
assert(new Set(graph.edges.map((edge) => edge.edgeId)).size === graph.edges.length, "edge id unique");

const context = buildEvidenceGraphContext();
assert(context.contextReady, "graph context ready");
assert(context.brandCount >= 8, "brand nodes");
assert(context.evidenceCount >= 30, "evidence nodes");
assert(context.isolatedNodeCount === 0, "no isolated nodes");

const traversal = traverseEvidenceFromBrand("brand-life-fitness");
assert(traversal.pathCount >= 2, "brand evidence traversal");
assert(traversal.evidenceNodeIds.length >= 2, "brand evidence nodes visited");

const evidenceNodes = findEvidenceNodesByType("evidence");
assert(evidenceNodes.length >= 30, "findEvidenceNodesByType evidence");

const sampleEvidence = evidenceNodes.find((node) => node.nodeType === "evidence")!;
const brandPath = findEvidencePathFromBrandToEvidence(
  sampleEvidence.brandId,
  sampleEvidence.evidenceId,
);
assert(Boolean(brandPath), "findEvidencePath brand to evidence");
assert(brandPath!.pathKind === "brand-evidence" || brandPath!.pathKind === "direct", "brand evidence path kind");

const stubPaths = findBrandEvidenceRequirementStubPaths();
assert(stubPaths.length >= 3, "brand evidence requirement stub paths");
assert(
  stubPaths.every((path) => path.pathKind === "brand-evidence-requirement-stub"),
  "stub path kind",
);

const firstStub = stubPaths[0]!;
const brandId = firstStub.nodeIds[0]!.replace("graph-node-brand-", "");
const evidenceId = firstStub.nodeIds[1]!.replace("graph-node-evidence-", "");
const stubPath = findEvidencePathFromBrandToRequirementStub(brandId, evidenceId);
assert(Boolean(stubPath), "findEvidencePath brand to requirement stub");

const trace = reverseTraceEdge(graph.edges[0]!.edgeId);
assert(Boolean(trace), "reverseTraceEdge");
assert(Boolean(trace!.sourceRecordId), "reverse trace source record");
assert(Boolean(trace!.traceRef), "reverse trace ref");

assert(validateBrandIntelligenceNetworkFoundation().valid, "brand network unchanged");

console.log("✓ evidence graph");
console.log(" ", validation.evidenceGraph.summary);
console.log("✓ graph context");
console.log(
  " ",
  `nodes=${context.nodeCount} edges=${context.edgeCount} avgDegree=${context.averageDegree} density=${context.graphDensity} stubPaths=${context.requirementStubPathCount}`,
);
console.log(
  " ",
  `version=${EVIDENCE_INTELLIGENCE_NETWORK_VERSION} tag=${EVIDENCE_INTELLIGENCE_NETWORK_P2_TAG}`,
);
console.log("Evidence Intelligence Network Phase 2 PASS");
