import { EPI_CANONICAL_ID } from "../shared/constants";
import { buildProductSpecContext } from "../product-foundation/product-spec-context";
import { buildAllEquivalentProductEdges } from "./equivalent-mapping-builder";
import { buildEquivalentGraphNodes } from "./graph-nodes";
import { buildRequirementProductEdges } from "./requirement-product-edge";
import type { EquivalentGraph, EquivalentGraphContext } from "./equivalent-graph-types";

let cachedGraph: EquivalentGraph | undefined;
let cachedContext: EquivalentGraphContext | undefined;

export function buildEquivalentGraph(): EquivalentGraph {
  if (cachedGraph) return cachedGraph;

  const productSpecContext = buildProductSpecContext();
  const equivalentEdges = buildAllEquivalentProductEdges();
  const requirementProductEdges = buildRequirementProductEdges();
  const nodes = buildEquivalentGraphNodes({
    products: productSpecContext.products,
    specifications: productSpecContext.specifications,
  });

  const graph: EquivalentGraph = {
    graphId: "epi-equivalent-graph-v42-p2",
    nodes,
    equivalentEdges,
    requirementProductEdges,
    productCount: productSpecContext.products.length,
    equivalentEdgeCount: equivalentEdges.length,
    graphReady:
      productSpecContext.contextReady &&
      equivalentEdges.length > 0 &&
      requirementProductEdges.length > 0,
    mode: EPI_CANONICAL_ID,
  };

  cachedGraph = graph;
  return graph;
}

export function buildEquivalentGraphContext(): EquivalentGraphContext {
  if (cachedContext) return cachedContext;

  const graph = buildEquivalentGraph();
  const productSpecContext = buildProductSpecContext();

  cachedContext = {
    contextId: "epi-equivalent-graph-context-v42-p2",
    products: productSpecContext.products,
    specifications: productSpecContext.specifications,
    equivalentEdges: graph.equivalentEdges,
    requirementProductEdges: graph.requirementProductEdges,
    contextReady: graph.graphReady,
    mode: EPI_CANONICAL_ID,
  };

  return cachedContext;
}
