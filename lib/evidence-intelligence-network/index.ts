/**
 * V39 Evidence Intelligence Network — Phase 1.
 * Read-only extension over V38 Brand Intelligence Network.
 * No V3.4 Runtime or V38 modifications.
 */
export * from "./shared/types";
export * from "./evidence-engine-compat";
export * from "./evidence-scoring";
export * from "./evidence-ref-resolver";
export {
  buildEvidenceRegistryRecords,
  buildEvidenceRegistry,
  registerEvidence,
  updateEvidence,
  resolveEvidenceRef,
  resolveEvidenceId,
  findEvidenceById,
  findEvidenceByBrand,
  findEvidenceByKind,
  executeEvidenceQuery,
  findTopEvidenceRecords,
  validateEvidenceRegistry,
} from "./evidence-registry";
export * from "./evidence-context";
export * from "./evidence-validation";
export * from "./evidence-graph/graph-nodes";
export * from "./evidence-graph/graph-edges";
export * from "./evidence-graph/brand-evidence-edge";
export * from "./evidence-graph/sku-evidence-edge";
export * from "./evidence-graph/manufacturer-evidence-edge";
export * from "./evidence-graph/evidence-graph-context";
export * from "./evidence-graph/evidence-graph-traversal";
export * from "./evidence-coverage/coverage-builder";
export {
  buildBrandEvidenceCoverage,
  buildTenderEvidenceCoverage,
  buildRequirementEvidenceCoverage,
  buildProposalEvidenceCoverage,
  buildEvidenceCoverageRecords,
  findEvidenceCoverageGaps,
  findEvidencePath as findBrandRequirementEvidencePath,
  findBrandRequirementEvidencePaths,
  validateEvidenceCoverageRegistry,
  validateRequirementStubRegistry,
} from "./evidence-coverage/coverage-registry";
export * from "./evidence-coverage/coverage-context";
export {
  buildRequirementStub,
  buildRequirementStubRecords,
  buildRequirementStubGraphNodeId,
  findRequirementStubById,
  findRequirementStubsByTenderId,
  findRequirementStubsByBrandId,
  findReadyRequirementStubs,
} from "./requirement-stub/requirement-stub";
export {
  buildRequirementEvidenceEdge,
  buildRequirementEvidenceEdges,
  findRequirementEvidenceEdgesByRequirementId,
  findRequirementEvidenceEdgesByEvidenceId,
  buildEnrichedRequirementStubRecords,
  findEnrichedRequirementStubById,
} from "./requirement-stub/requirement-evidence-edge";
export * from "./evidence-readiness/readiness-scoring";
export * from "./evidence-readiness/readiness-context";
export {
  findEvidence,
  findEvidenceByBrand as findEvidenceQueryByBrand,
  findEvidenceByKind as findEvidenceQueryByKind,
  findVerifiedEvidence,
  findTopEvidence,
  findEvidenceByCoverageLevel,
  findEvidenceByReadiness,
  validateEvidenceQueryRegistry,
} from "./evidence-query";
export {
  matchEvidenceToBrand,
  matchEvidenceToRequirement,
  matchEvidenceToTender,
  matchEvidenceToSku,
  validateEvidenceMatcherRegistry,
} from "./evidence-matcher";
