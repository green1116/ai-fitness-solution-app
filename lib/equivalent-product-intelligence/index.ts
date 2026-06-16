/**
 * V42 Equivalent Product Intelligence — Phase 1 + Phase 2.
 * Read-only extension over V38 Brand / V39 Evidence / V40 Requirement / V41 Tender KG.
 */
export * from "./shared/constants";
export * from "./shared/types";
export * from "./product-foundation/product-spec-types";
export {
  buildProductRegistry,
  findProductById,
  findProductBySku,
} from "./product-foundation/product-registry";
export {
  buildSpecificationRegistry,
  findSpecificationById,
} from "./product-foundation/specification-registry";
export {
  buildRequirementSpecificationEdges,
  findRequirementSpecificationEdgesByRequirementId,
} from "./product-foundation/requirement-spec-edge";
export {
  buildProductSpecContext,
  findProductsBySpecification,
  findSpecificationsByRequirement,
} from "./product-foundation/product-spec-context";
export {
  validateProductSpecRegistry,
  validateEquivalentProductIntelligencePhase1,
  getEquivalentProductIntelligencePhase1FreezeMeta,
} from "./product-foundation/product-spec-validation";
export * from "./equivalent-graph/equivalent-graph-types";
export * from "./equivalent-graph/graph-nodes";
export * from "./equivalent-graph/graph-edges";
export * from "./equivalent-graph/product-equivalent-edge";
export * from "./equivalent-graph/requirement-product-edge";
export * from "./equivalent-graph/equivalent-mapping-scoring";
export {
  buildAllEquivalentProductEdges,
  buildEquivalentMappings,
  findEquivalentProducts,
  rankEquivalentProducts,
} from "./equivalent-graph/equivalent-mapping-builder";
export {
  buildEquivalentGraph,
  buildEquivalentGraphContext,
} from "./equivalent-graph/equivalent-graph-context";
export { traverseEquivalentGraph } from "./equivalent-graph/equivalent-graph-traversal";
export {
  validateEquivalentMappingPhase2,
  validateEquivalentProductIntelligencePhase2,
  getEquivalentProductIntelligencePhase2FreezeMeta,
} from "./equivalent-graph/equivalent-graph-validation";
