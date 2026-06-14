import type { RegistryValidation } from "../shared/types";
import { buildIndustryGraph } from "./graph";
import type { IndustryGraphContext } from "./types";
import {
  CANONICAL_GRAPH_NODE_ID,
  INDUSTRY_GRAPH_QUERY_TAG,
  INDUSTRY_GRAPH_QUERY_VERSION,
} from "./types";

export function buildIndustryGraphContext(): IndustryGraphContext {
  const graph = buildIndustryGraph();

  return {
    contextId: `industry-graph-context-${INDUSTRY_GRAPH_QUERY_VERSION}`,
    graph,
    traversalReady: graph.nodeCount > 0 && graph.edgeCount > 0,
    mode: "industry-graph-query",
  };
}

export function validateIndustryGraphContext(context: IndustryGraphContext): boolean {
  const canonicalNode = context.graph.nodes.find((node) => node.nodeId === CANONICAL_GRAPH_NODE_ID);

  return (
    context.traversalReady &&
    context.graph.nodeCount >= 10 &&
    context.graph.edgeCount >= 13 &&
    canonicalNode !== undefined &&
    context.graph.nodes.length === context.graph.nodeCount &&
    context.graph.edges.length === context.graph.edgeCount &&
    context.mode === "industry-graph-query"
  );
}

export function validateGraphContextRegistry(): RegistryValidation {
  const context = buildIndustryGraphContext();
  const valid =
    validateIndustryGraphContext(context) &&
    INDUSTRY_GRAPH_QUERY_VERSION === "v31-industry-graph-query-1" &&
    INDUSTRY_GRAPH_QUERY_TAG === "v31-industry-graph-query-foundation";

  return {
    valid,
    count: context.graph.nodeCount,
    summary: `graph-context nodes=${context.graph.nodeCount} edges=${context.graph.edgeCount} traversalReady=${context.traversalReady} valid=${valid}`,
  };
}
