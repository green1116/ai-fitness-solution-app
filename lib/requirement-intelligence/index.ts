/**
 * V40 Requirement Intelligence — Phase 1.
 * Read-only extension over V39 Evidence Intelligence Network.
 * No V28–V39 frozen module modifications.
 */
export * from "./shared/types";
export * from "./requirement-engine-compat";
export {
  buildRequirementRegistryRecords,
  buildRequirementRegistry,
  registerRequirement,
  updateRequirement,
  resolveRequirementRef,
  resolveRequirementId,
  findRequirementById,
  findRequirementByTender,
  findRequirementByBrand,
  findRequirementByKind,
  findRequirementByPriority,
  executeRequirementQuery,
  findTopRequirementRecords,
  validateRequirementRegistry,
} from "./requirement-registry";
export * from "./requirement-context";
export {
  findRequirements,
  findRequirementsByTender,
  findRequirementsByBrand,
  findRequirementsByKind,
  findRequirementsByPriority,
  findTopRequirements,
  validateRequirementQueryRegistry,
} from "./requirement-query";
export * from "./requirement-validation";
export * from "./requirement-graph/graph-nodes";
export * from "./requirement-graph/graph-edges";
export * from "./requirement-graph/tender-requirement-edge";
export * from "./requirement-graph/requirement-evidence-edge";
export * from "./requirement-graph/requirement-brand-edge";
export * from "./requirement-graph/requirement-graph-context";
export * from "./requirement-graph/requirement-graph-traversal";
export * from "./requirement-compliance/compliance-builder";
export * from "./requirement-compliance/compliance-gap";
export * from "./requirement-compliance/compliance-registry";
export * from "./requirement-compliance/compliance-context";
export * from "./requirement-compliance/compliance-matrix";
export * from "./requirement-readiness/readiness-scoring";
export {
  buildRequirementReadinessContext,
  validateRequirementReadinessFromContext,
} from "./requirement-readiness/readiness-context";
export {
  findRequirement,
  findRequirementByKindQuery,
  findRequirementByPriorityQuery,
  findSatisfiedRequirementRecords,
  findBlockedRequirements,
  findCriticalRequirements,
  buildRequirementQuerySnapshot,
  validateRequirementQuery,
  validateRequirementQueryFromSnapshot,
  validateRequirementQueryRegistryFromSnapshot,
} from "./requirement-query";
export {
  buildRequirementMatcherContext,
  validateRequirementMatcher,
  validateRequirementMatcherFromContext,
} from "./requirement-matcher";
export {
  matchRequirementToBrand,
  matchRequirementToEvidence,
  matchRequirementToProposal,
  matchRequirementToTender,
} from "./requirement-matcher";
