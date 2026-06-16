/**
 * V42 Equivalent Product Intelligence — Phase 2 verification
 */
import {
  buildAllEquivalentProductEdges,
  buildEquivalentGraph,
  buildEquivalentGraphContext,
  buildEquivalentMappings,
  CANONICAL_EQUIVALENT_PRODUCT_ID,
  EPI_P2_TAG,
  EPI_P2_VERSION,
  findEquivalentProducts,
  getEquivalentProductIntelligencePhase2FreezeMeta,
  rankEquivalentProducts,
  traverseEquivalentGraph,
  validateEquivalentProductIntelligencePhase1,
  validateEquivalentProductIntelligencePhase2,
} from "../lib/equivalent-product-intelligence";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

const phase1 = validateEquivalentProductIntelligencePhase1();
assert(phase1.valid, "phase1 regression");

const validation = validateEquivalentProductIntelligencePhase2();
assert(validation.valid, "phase2 validation");
assert(validation.phase1Valid, "phase1 valid in phase2");
assert(validation.equivalentMapping.valid, "equivalent mapping valid");
assert(validation.equivalentMapping.edgeCount >= 40, "edge count");
assert(
  validation.equivalentMapping.averageMappingPerProduct >= 2,
  "average mapping per product",
);
assert(
  validation.equivalentMapping.crossBrandCoverage >= 0.3,
  "cross brand coverage",
);
assert(validation.equivalentMapping.graphConnectivity, "graph connectivity");

const graph = buildEquivalentGraph();
assert(graph.graphReady, "graph ready");
assert(graph.equivalentEdgeCount >= 40, "graph equivalent edges");
assert(graph.nodes.length > graph.productCount, "nodes include specs");

console.log("✓ equivalent graph");
console.log(
  `  nodes=${graph.nodes.length} products=${graph.productCount} equivalentEdges=${graph.equivalentEdgeCount}`,
);

const context = buildEquivalentGraphContext();
assert(context.contextReady, "graph context ready");
assert(context.equivalentEdges.length === graph.equivalentEdgeCount, "context edges");
assert(context.requirementProductEdges.length >= 1, "requirement product edges");

console.log("✓ equivalent graph context");
console.log(
  `  reqProductEdges=${context.requirementProductEdges.length} ready=${context.contextReady}`,
);

const mappings = buildEquivalentMappings(CANONICAL_EQUIVALENT_PRODUCT_ID);
assert(mappings.length >= 2, "canonical product mappings");

const ranked = rankEquivalentProducts(CANONICAL_EQUIVALENT_PRODUCT_ID);
assert(ranked.length >= 2, "ranked equivalents");
assert(ranked[0]!.score >= ranked[ranked.length - 1]!.score, "rank order");

const crossBrand = findEquivalentProducts(
  CANONICAL_EQUIVALENT_PRODUCT_ID,
  "cross-brand-equivalent",
);
assert(crossBrand.length >= 1, "cross brand equivalent");

console.log("✓ equivalent mappings");
console.log(
  `  canonical=${CANONICAL_EQUIVALENT_PRODUCT_ID} mappings=${mappings.length} top=${ranked[0]?.kind} score=${ranked[0]?.score}`,
);

const traversal = traverseEquivalentGraph(CANONICAL_EQUIVALENT_PRODUCT_ID);
assert(traversal.hops.length >= 1, "1-hop traversal");
assert(traversal.sourceProductId === CANONICAL_EQUIVALENT_PRODUCT_ID, "traversal source");

const traversal2 = traverseEquivalentGraph(CANONICAL_EQUIVALENT_PRODUCT_ID, {
  maxHops: 2,
  scoreThreshold: 40,
});
assert(traversal2.hops.length >= traversal.hops.length, "2-hop expansion");

console.log("✓ equivalent traversal");
console.log(
  `  hops=${traversal.hops.length} twoHop=${traversal2.hops.length} crossBrand=${traversal.crossBrandCount}`,
);

const allEdges = buildAllEquivalentProductEdges();
const kinds = new Set(allEdges.map((edge) => edge.kind));
assert(kinds.size >= 4, "mapping kind coverage");

const scores = allEdges.map((edge) => edge.score);
const avgScore = Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
const minScore = Math.min(...scores);
const maxScore = Math.max(...scores);

console.log("✓ score distribution");
console.log(`  count=${scores.length} min=${minScore} avg=${avgScore} max=${maxScore}`);

const freeze = getEquivalentProductIntelligencePhase2FreezeMeta();
assert(freeze.valid, "freeze meta valid");
assert(freeze.tag === EPI_P2_TAG, "freeze tag");
assert(freeze.version === EPI_P2_VERSION, "freeze version");

console.log("✓ equivalent product intelligence p2");
console.log(`  tag=${freeze.tag}`);
console.log("V42 P2 FREEZE PASS");
