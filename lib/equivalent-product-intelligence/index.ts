/**
 * V42 Equivalent Product Intelligence — Phase 1.
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
