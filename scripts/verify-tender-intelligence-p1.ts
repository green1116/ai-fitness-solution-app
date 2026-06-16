/**
 * V41 Tender Knowledge Graph — Phase 1 verification
 */
import {
  analyzeTenderRisk,
  buildTenderGraph,
  buildTenderGraphContext,
  calculateWinProbability,
  CANONICAL_TENDER_GRAPH_TENDER_ID,
  findTenderPath,
  TENDER_KNOWLEDGE_GRAPH_P1_TAG,
  TENDER_KNOWLEDGE_GRAPH_VERSION,
  traverseTenderGraph,
  validateTenderIntelligenceNetworkPhase1,
} from "../lib/tender-knowledge-graph";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

const validation = validateTenderIntelligenceNetworkPhase1();
assert(validation.valid, "phase1 validation");
assert(validation.tenderRegistry.valid, "tender registry");
assert(validation.tenderGraph.valid, "tender graph");
assert(validation.winProbability.valid, "win probability");
assert(validation.compatibility.valid, "v38/v39/v40 compatibility");

const graph = buildTenderGraph();
assert(graph.graphReady, "graph ready");
assert(graph.nodeCount >= 80, "node count");
assert(graph.edgeCount >= 100, "edge count");
assert(new Set(graph.nodes.map((n) => n.nodeId)).size === graph.nodes.length, "node id unique");
assert(new Set(graph.edges.map((e) => e.edgeId)).size === graph.edges.length, "edge id unique");

const context = buildTenderGraphContext();
assert(context.contextReady, "graph context ready");
assert(context.tenderCount >= 10, "tender count");
assert(context.requirementCount >= 50, "requirement count");
assert(context.evidenceCount >= 30, "evidence count");
assert(context.brandCount >= 8, "brand count");
assert(context.tenderRequirementCoverage >= 90, "tender requirement coverage");
assert(context.requirementEvidenceCoverage >= 80, "requirement evidence coverage");
assert(context.tenderBrandCoverage >= 70, "tender brand coverage");

const isolated = graph.nodes.filter((node) => {
  const connected = graph.edges.some(
    (edge) => edge.sourceNodeId === node.nodeId || edge.targetNodeId === node.nodeId,
  );
  return !connected;
});
assert(isolated.length === 0, "no isolated nodes");

const traversal = traverseTenderGraph(CANONICAL_TENDER_GRAPH_TENDER_ID);
assert(traversal.pathCount >= 1, "tender graph traversal");
assert(traversal.requirementNodeIds.length >= 1, "requirement nodes visited");

const sampleBrand = graph.nodes.find((node) => node.nodeType === "brand");
assert(Boolean(sampleBrand), "brand node exists");
const path = findTenderPath(traversal.startNodeId, sampleBrand!.nodeId);
assert(Boolean(path), "findTenderPath");

const win = calculateWinProbability(CANONICAL_TENDER_GRAPH_TENDER_ID);
assert(win.winProbability >= 0 && win.winProbability <= 100, "win probability range");
assert(Boolean(win.winLevel), "win level");

const risk = analyzeTenderRisk(CANONICAL_TENDER_GRAPH_TENDER_ID);
assert(Boolean(risk.riskLevel), "risk analysis");

console.log("✓ tender graph");
console.log(" ", validation.tenderGraph.summary);
console.log("✓ win probability");
console.log(" ", validation.winProbability.summary);
console.log("✓ compatibility");
console.log(" ", validation.compatibility.summary);
console.log(
  " ",
  `nodes=${context.nodeCount} edges=${context.edgeCount} avgDegree=${context.avgDegree} winHigh=${context.winDistribution.high}`,
);
console.log(
  " ",
  `version=${TENDER_KNOWLEDGE_GRAPH_VERSION} tag=${TENDER_KNOWLEDGE_GRAPH_P1_TAG}`,
);
console.log("Tender Knowledge Graph Phase 1 PASS");
