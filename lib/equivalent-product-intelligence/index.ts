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
export * from "./substitution/substitution-types";
export { calculateSubstitutionRisk, resolveSubstitutionRiskLevel } from "./substitution/substitution-risk-scoring";
export {
  buildCompatibilityMatrix,
  resolveCompatibilityLevelFromRatio,
  getSpecificationLabel,
} from "./substitution/compatibility-matrix";
export { buildCompatibilityGaps } from "./substitution/compatibility-gap";
export { buildSubstitutionReasoning } from "./substitution/substitution-reasoning";
export { buildSubstitutionContext, resolveProductWithSpecifications } from "./substitution/substitution-context";
export {
  assessSubstitution,
  buildAllSubstitutionAssessments,
  buildSubstitutionCompatibilityEngine,
  isSubstitutionBlocked,
} from "./substitution/substitution-compatibility-engine";
export {
  validateSubstitutionLayer,
  validateEquivalentProductIntelligencePhase3,
  getEquivalentProductIntelligencePhase3FreezeMeta,
} from "./substitution/substitution-validation";
export * from "./equivalent-decision/equivalent-decision-types";
export {
  matchRequirementToProduct,
  findPrimaryProductForRequirement,
  findEquivalentProductsForRequirement,
} from "./equivalent-decision/equivalent-matcher";
export {
  rankEquivalentCandidates,
  findTopEquivalentCandidate,
  resolveEquivalentDecisionLevel,
} from "./equivalent-decision/equivalent-ranking";
export { simulateEquivalentSubstitution } from "./equivalent-decision/equivalent-simulation";
export { buildEquivalentRecommendation } from "./equivalent-decision/equivalent-recommendation";
export {
  runEquivalentDecisionEngine,
  decideOptimalEquivalentProduct,
} from "./equivalent-decision/equivalent-decision-engine";
export {
  buildEquivalentProductIntelligenceFoundationContext,
  validateEquivalentProductIntelligenceFoundationFreeze,
  getEquivalentProductIntelligenceFoundationFreezeMeta,
} from "./equivalent-decision/foundation-context";
export {
  validateEquivalentDecisionLayer,
  validateEquivalentProductIntelligencePhase4,
  getEquivalentProductIntelligencePhase4FreezeMeta,
} from "./equivalent-decision/equivalent-validation";
