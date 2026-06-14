/**
 * V31 Industry Relationship Network — Phase 2 Graph Query verification
 */
import {
  buildIndustryGraph,
  buildIndustryGraphContext,
  CANONICAL_GRAPH_NODE_ID,
  CANONICAL_GRAPH_PATH_QUERY,
  CANONICAL_MULTI_HOP_PATH_QUERY,
  findByRelationshipType,
  findInbound,
  findNeighbors,
  findOutbound,
  findPath,
  INDUSTRY_GRAPH_QUERY_TAG,
  INDUSTRY_GRAPH_QUERY_VERSION,
  validateGraphContextRegistry,
  validateGraphTraversalRegistry,
  validateIndustryGraph,
  validateIndustryGraphContext,
  validateIndustryGraphQuery,
} from "../lib/industry-relationship";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function testIndustryGraph() {
  const result = validateIndustryGraph();
  assert(result.valid, "industry graph valid");
  assert(result.count >= 13, "graph edge count");

  const graph = buildIndustryGraph();
  assert(graph.nodeCount >= 10, "graph node count");
  assert(graph.edges.length === graph.edgeCount, "edge count consistency");

  console.log("✓ industry graph");
  console.log(" ", result.summary);
}

function testGraphContext() {
  const result = validateGraphContextRegistry();
  assert(result.valid, "graph context registry valid");

  const context = buildIndustryGraphContext();
  assert(validateIndustryGraphContext(context), "graph context valid");
  assert(context.traversalReady, "traversal ready");

  console.log("✓ graph context");
  console.log(" ", result.summary);
}

function testGraphTraversal() {
  const result = validateGraphTraversalRegistry();
  assert(result.valid, "graph traversal registry valid");

  const neighbors = findNeighbors(CANONICAL_GRAPH_NODE_ID);
  const inbound = findInbound("ind-org-buyer-sh-gym");
  const outbound = findOutbound(CANONICAL_GRAPH_NODE_ID);
  const supplies = findByRelationshipType("SUPPLIES", CANONICAL_GRAPH_NODE_ID);

  assert(neighbors.traversalReady, "findNeighbors ready");
  assert(neighbors.neighborNodeIds.length >= 2, "neighbor count");
  assert(inbound.hitCount >= 4, "findInbound");
  assert(outbound.hitCount >= 5, "findOutbound");
  assert(supplies.hitCount >= 1, "findByRelationshipType");

  const directPath = findPath(
    CANONICAL_GRAPH_PATH_QUERY.sourceId,
    CANONICAL_GRAPH_PATH_QUERY.targetId,
  );
  const multiHopPath = findPath(
    CANONICAL_MULTI_HOP_PATH_QUERY.sourceId,
    CANONICAL_MULTI_HOP_PATH_QUERY.targetId,
  );

  assert(directPath.found, "direct path found");
  assert(directPath.hopCount >= 1, "direct path hops");
  assert(multiHopPath.found, "multi-hop path found");
  assert(multiHopPath.hopCount >= 2, "multi-hop path hops");
  assert(directPath.nodeIds[0] === directPath.sourceId, "path starts at source");
  assert(directPath.nodeIds[directPath.nodeIds.length - 1] === directPath.targetId, "path ends at target");

  console.log("✓ graph traversal");
  console.log(" ", result.summary);
  console.log(
    " ",
    `neighbors=${neighbors.neighborNodeIds.length} directHops=${directPath.hopCount} multiHopHops=${multiHopPath.hopCount}`,
  );
}

function testIndustryGraphQuery() {
  const validation = validateIndustryGraphQuery();
  assert(validation.valid, "industry graph query validation");
  assert(INDUSTRY_GRAPH_QUERY_VERSION === "v31-industry-graph-query-1", "graph query version");
  assert(INDUSTRY_GRAPH_QUERY_TAG === "v31-industry-graph-query-foundation", "graph query tag");

  console.log("✓ industry graph query validation");
  console.log(
    " ",
    `graph=${validation.graph.valid} context=${validation.graphContext.valid} traversal=${validation.graphTraversal.valid}`,
  );
}

testIndustryGraph();
testGraphContext();
testGraphTraversal();
testIndustryGraphQuery();
console.log("Industry Graph Query Foundation PASS");
