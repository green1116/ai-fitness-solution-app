/**
 * Product M11 — Knowledge Platform public exports
 * Isolated namespace: lib/product/m11
 */

export {
  KNOWLEDGE_ACCESS_LEVELS,
  KNOWLEDGE_DOMAIN_SCOPES,
  KNOWLEDGE_ENTITY_KINDS,
  KNOWLEDGE_ENTITY_STATUSES,
  KNOWLEDGE_GOVERNANCE_POLICY_KINDS,
  KNOWLEDGE_GOVERNANCE_POLICY_STATUSES,
  KNOWLEDGE_READINESS_VERDICTS,
  KNOWLEDGE_RETRIEVAL_MODES,
  PRODUCT_KNOWLEDGE_FOUNDATION_BASE,
  PRODUCT_KNOWLEDGE_FOUNDATION_FREEZE_VERSION,
  PRODUCT_KNOWLEDGE_FOUNDATION_ID,
  PRODUCT_KNOWLEDGE_FOUNDATION_VERSION,
  PRODUCT_KNOWLEDGE_FREEZE_TAG,
} from "./foundation/knowledge.constants";

export type {
  EvaluateKnowledgeRetrievalContractInput,
  KnowledgeAccessLevel,
  KnowledgeDomainScope,
  KnowledgeEntity,
  KnowledgeEntityKind,
  KnowledgeEntityStatus,
  KnowledgeEntityValidationIssue,
  KnowledgeEntityValidationResult,
  KnowledgeFoundationManifest,
  KnowledgeGovernancePolicy,
  KnowledgeGovernancePolicyKind,
  KnowledgeGovernancePolicyStatus,
  KnowledgeMetadata,
  KnowledgeReadinessCheck,
  KnowledgeReadinessResult,
  KnowledgeReadinessVerdict,
  KnowledgeRetrievalContract,
  KnowledgeRetrievalHit,
  KnowledgeRetrievalMode,
  KnowledgeRetrievalQuery,
  RegisterKnowledgeEntityInput,
  RegisterKnowledgeGovernancePolicyInput,
  UpdateKnowledgeEntityStatusInput,
} from "./foundation/knowledge.types";

export {
  getKnowledgeFoundationMetadata,
  isKnowledgeFoundationMetadataIntact,
  PRODUCT_KNOWLEDGE_FOUNDATION_METADATA,
  validateKnowledgeEntity,
  validateKnowledgeEntityInput,
  type KnowledgeFoundationMetadata,
} from "./foundation/knowledge.metadata";

export {
  clearKnowledgeEntities,
  getKnowledgeEntity,
  getKnowledgeEntityByKey,
  listKnowledgeEntities,
  registerKnowledgeEntity,
  updateKnowledgeEntityStatus,
} from "./foundation/knowledge.registry";

export {
  clearKnowledgeGovernancePolicies,
  getKnowledgeGovernancePolicy,
  listKnowledgeGovernancePolicies,
  registerKnowledgeGovernancePolicy,
} from "./foundation/governance.policy";

export {
  clearKnowledgeRetrievalContracts,
  evaluateKnowledgeRetrievalContract,
  getKnowledgeRetrievalContract,
  listKnowledgeRetrievalContracts,
} from "./foundation/retrieval.contract";

export {
  assertKnowledgeFoundationReadinessReady,
  buildKnowledgeFoundationManifest,
  clearKnowledgeFoundationLayer,
  evaluateKnowledgeFoundationReadiness,
} from "./foundation/knowledge.manifest";

export {
  assertProductKnowledgeFoundationReleaseGatePass,
  checkProductKnowledgeFoundationReleaseGate,
  PRODUCT_KNOWLEDGE_FOUNDATION_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/knowledge.foundation.gate";

export {
  KNOWLEDGE_CATALOG_BINDING_STATUSES,
  KNOWLEDGE_CATALOG_ENTRY_STATUSES,
  KNOWLEDGE_CATALOG_KINDS,
  KNOWLEDGE_CATALOG_READINESS_VERDICTS,
  KNOWLEDGE_CATALOG_STATUSES,
  PRODUCT_KNOWLEDGE_CATALOG_BASE,
  PRODUCT_KNOWLEDGE_CATALOG_FREEZE_TAG,
  PRODUCT_KNOWLEDGE_CATALOG_FREEZE_VERSION,
  PRODUCT_KNOWLEDGE_CATALOG_ID,
  PRODUCT_KNOWLEDGE_CATALOG_VERSION,
} from "./catalog/catalog.constants";

export type {
  BindKnowledgeCatalogEntryInput,
  KnowledgeCatalog,
  KnowledgeCatalogBinding,
  KnowledgeCatalogBindingStatus,
  KnowledgeCatalogEntry,
  KnowledgeCatalogEntryStatus,
  KnowledgeCatalogKind,
  KnowledgeCatalogManifest,
  KnowledgeCatalogMetadata,
  KnowledgeCatalogReadinessCheck,
  KnowledgeCatalogReadinessResult,
  KnowledgeCatalogReadinessVerdict,
  KnowledgeCatalogStatus,
  RegisterKnowledgeCatalogEntryInput,
  RegisterKnowledgeCatalogInput,
  UpdateKnowledgeCatalogEntryStatusInput,
  UpdateKnowledgeCatalogStatusInput,
} from "./catalog/catalog.types";

export {
  getKnowledgeCatalogMetadata,
  isKnowledgeCatalogMetadataIntact,
  PRODUCT_KNOWLEDGE_CATALOG_METADATA,
  type KnowledgeCatalogMetadataRecord,
} from "./catalog/catalog.metadata";

export {
  clearKnowledgeCatalogs,
  getKnowledgeCatalog,
  getKnowledgeCatalogByKey,
  listKnowledgeCatalogs,
  registerKnowledgeCatalog,
  updateKnowledgeCatalogStatus,
} from "./catalog/catalog.registry";

export {
  clearKnowledgeCatalogEntries,
  getKnowledgeCatalogEntry,
  listKnowledgeCatalogEntries,
  registerKnowledgeCatalogEntry,
  updateKnowledgeCatalogEntryStatus,
} from "./catalog/entry.registry";

export {
  bindKnowledgeCatalogEntry,
  clearKnowledgeCatalogBindings,
  getKnowledgeCatalogBinding,
  listKnowledgeCatalogBindings,
} from "./catalog/binding.registry";

export {
  assertKnowledgeCatalogReadinessReady,
  buildKnowledgeCatalogManifest,
  clearKnowledgeCatalogLayer,
  evaluateKnowledgeCatalogReadiness,
} from "./catalog/catalog.manifest";

export {
  assertProductKnowledgeCatalogReleaseGatePass,
  checkProductKnowledgeCatalogReleaseGate,
  PRODUCT_KNOWLEDGE_CATALOG_SIGNOFF_VERSION,
} from "./verify/knowledge.catalog.gate";

export {
  KNOWLEDGE_DEPENDENCY_EDGE_STATUSES,
  KNOWLEDGE_DEPENDENCY_GRAPH_KINDS,
  KNOWLEDGE_DEPENDENCY_GRAPH_STATUSES,
  KNOWLEDGE_DEPENDENCY_IMPACTS,
  KNOWLEDGE_DEPENDENCY_NODE_STATUSES,
  KNOWLEDGE_DEPENDENCY_READINESS_VERDICTS,
  PRODUCT_KNOWLEDGE_DEPENDENCY_BASE,
  PRODUCT_KNOWLEDGE_DEPENDENCY_FREEZE_TAG,
  PRODUCT_KNOWLEDGE_DEPENDENCY_FREEZE_VERSION,
  PRODUCT_KNOWLEDGE_DEPENDENCY_ID,
  PRODUCT_KNOWLEDGE_DEPENDENCY_VERSION,
} from "./dependency-runtime/dependency.constants";

export type {
  BindKnowledgeDependencyEdgeInput,
  KnowledgeDependencyEdge,
  KnowledgeDependencyEdgeStatus,
  KnowledgeDependencyGraph,
  KnowledgeDependencyGraphKind,
  KnowledgeDependencyGraphStatus,
  KnowledgeDependencyImpact,
  KnowledgeDependencyManifest,
  KnowledgeDependencyMetadata,
  KnowledgeDependencyNode,
  KnowledgeDependencyNodeStatus,
  KnowledgeDependencyReadinessCheck,
  KnowledgeDependencyReadinessResult,
  KnowledgeDependencyReadinessVerdict,
  RegisterKnowledgeDependencyGraphInput,
  RegisterKnowledgeDependencyNodeInput,
  UpdateKnowledgeDependencyGraphStatusInput,
  UpdateKnowledgeDependencyNodeStatusInput,
} from "./dependency-runtime/dependency.types";

export {
  getKnowledgeDependencyMetadata,
  isKnowledgeDependencyMetadataIntact,
  PRODUCT_KNOWLEDGE_DEPENDENCY_METADATA,
  type KnowledgeDependencyMetadataRecord,
} from "./dependency-runtime/dependency.metadata";

export {
  clearKnowledgeDependencyGraphs,
  getKnowledgeDependencyGraph,
  listKnowledgeDependencyGraphs,
  registerKnowledgeDependencyGraph,
  updateKnowledgeDependencyGraphStatus,
} from "./dependency-runtime/graph.registry";

export {
  clearKnowledgeDependencyNodes,
  getKnowledgeDependencyNode,
  listKnowledgeDependencyNodes,
  registerKnowledgeDependencyNode,
  updateKnowledgeDependencyNodeStatus,
} from "./dependency-runtime/node.registry";

export {
  bindKnowledgeDependencyEdge,
  clearKnowledgeDependencyEdges,
  getKnowledgeDependencyEdge,
  isKnowledgeDependencyGraphAcyclic,
  listKnowledgeDependencyEdges,
} from "./dependency-runtime/edge.registry";

export {
  assertKnowledgeDependencyReadinessReady,
  buildKnowledgeDependencyManifest,
  clearKnowledgeDependencyLayer,
  evaluateKnowledgeDependencyReadiness,
} from "./dependency-runtime/dependency.manifest";

export {
  assertProductKnowledgeDependencyReleaseGatePass,
  checkProductKnowledgeDependencyReleaseGate,
  PRODUCT_KNOWLEDGE_DEPENDENCY_SIGNOFF_VERSION,
} from "./verify/knowledge.dependency.gate";

export {
  KNOWLEDGE_POLICY_BINDING_STATUSES,
  KNOWLEDGE_POLICY_CONSTRAINTS,
  KNOWLEDGE_POLICY_ENFORCEMENTS,
  KNOWLEDGE_POLICY_KINDS,
  KNOWLEDGE_POLICY_READINESS_VERDICTS,
  KNOWLEDGE_POLICY_RULE_STATUSES,
  KNOWLEDGE_POLICY_STATUSES,
  PRODUCT_KNOWLEDGE_POLICY_BASE,
  PRODUCT_KNOWLEDGE_POLICY_FREEZE_TAG,
  PRODUCT_KNOWLEDGE_POLICY_FREEZE_VERSION,
  PRODUCT_KNOWLEDGE_POLICY_ID,
  PRODUCT_KNOWLEDGE_POLICY_VERSION,
} from "./policy-runtime/policy.constants";

export type {
  BindKnowledgePolicyRuleInput,
  KnowledgePolicy,
  KnowledgePolicyBinding,
  KnowledgePolicyBindingStatus,
  KnowledgePolicyConstraint,
  KnowledgePolicyEnforcement,
  KnowledgePolicyKind,
  KnowledgePolicyManifest,
  KnowledgePolicyMetadata,
  KnowledgePolicyReadinessCheck,
  KnowledgePolicyReadinessResult,
  KnowledgePolicyReadinessVerdict,
  KnowledgePolicyRule,
  KnowledgePolicyRuleStatus,
  KnowledgePolicyStatus,
  RegisterKnowledgePolicyInput,
  RegisterKnowledgePolicyRuleInput,
  UpdateKnowledgePolicyRuleStatusInput,
  UpdateKnowledgePolicyStatusInput,
} from "./policy-runtime/policy.types";

export {
  getKnowledgePolicyMetadata,
  isKnowledgePolicyMetadataIntact,
  PRODUCT_KNOWLEDGE_POLICY_METADATA,
  type KnowledgePolicyMetadataRecord,
} from "./policy-runtime/policy.metadata";

export {
  clearKnowledgePolicies,
  getKnowledgePolicy,
  listKnowledgePolicies,
  registerKnowledgePolicy,
  updateKnowledgePolicyStatus,
} from "./policy-runtime/policy.registry";

export {
  clearKnowledgePolicyRules,
  getKnowledgePolicyRule,
  listKnowledgePolicyRules,
  registerKnowledgePolicyRule,
  updateKnowledgePolicyRuleStatus,
} from "./policy-runtime/rule.registry";

export {
  bindKnowledgePolicyRule,
  clearKnowledgePolicyBindings,
  getKnowledgePolicyBinding,
  listKnowledgePolicyBindings,
} from "./policy-runtime/binding.registry";

export {
  assertKnowledgePolicyReadinessReady,
  buildKnowledgePolicyManifest,
  clearKnowledgePolicyLayer,
  evaluateKnowledgePolicyReadiness,
} from "./policy-runtime/policy.manifest";

export {
  assertProductKnowledgePolicyReleaseGatePass,
  checkProductKnowledgePolicyReleaseGate,
  PRODUCT_KNOWLEDGE_POLICY_SIGNOFF_VERSION,
} from "./verify/knowledge.policy.gate";

export {
  KNOWLEDGE_COMPATIBILITY_BINDING_STATUSES,
  KNOWLEDGE_COMPATIBILITY_CONSTRAINTS,
  KNOWLEDGE_COMPATIBILITY_MATRIX_KINDS,
  KNOWLEDGE_COMPATIBILITY_MATRIX_STATUSES,
  KNOWLEDGE_COMPATIBILITY_PAIR_STATUSES,
  KNOWLEDGE_COMPATIBILITY_READINESS_VERDICTS,
  KNOWLEDGE_COMPATIBILITY_RELATIONS,
  PRODUCT_KNOWLEDGE_COMPATIBILITY_BASE,
  PRODUCT_KNOWLEDGE_COMPATIBILITY_FREEZE_TAG,
  PRODUCT_KNOWLEDGE_COMPATIBILITY_FREEZE_VERSION,
  PRODUCT_KNOWLEDGE_COMPATIBILITY_ID,
  PRODUCT_KNOWLEDGE_COMPATIBILITY_VERSION,
} from "./compatibility-runtime/compatibility.constants";

export type {
  BindKnowledgeCompatibilityPairInput,
  KnowledgeCompatibilityBinding,
  KnowledgeCompatibilityBindingStatus,
  KnowledgeCompatibilityConstraint,
  KnowledgeCompatibilityManifest,
  KnowledgeCompatibilityMatrix,
  KnowledgeCompatibilityMatrixKind,
  KnowledgeCompatibilityMatrixStatus,
  KnowledgeCompatibilityMetadata,
  KnowledgeCompatibilityPair,
  KnowledgeCompatibilityPairStatus,
  KnowledgeCompatibilityReadinessCheck,
  KnowledgeCompatibilityReadinessResult,
  KnowledgeCompatibilityReadinessVerdict,
  KnowledgeCompatibilityRelation,
  RegisterKnowledgeCompatibilityMatrixInput,
  RegisterKnowledgeCompatibilityPairInput,
  UpdateKnowledgeCompatibilityMatrixStatusInput,
  UpdateKnowledgeCompatibilityPairStatusInput,
} from "./compatibility-runtime/compatibility.types";

export {
  getKnowledgeCompatibilityMetadata,
  isKnowledgeCompatibilityMetadataIntact,
  PRODUCT_KNOWLEDGE_COMPATIBILITY_METADATA,
  type KnowledgeCompatibilityMetadataRecord,
} from "./compatibility-runtime/compatibility.metadata";

export {
  clearKnowledgeCompatibilityMatrices,
  getKnowledgeCompatibilityMatrix,
  listKnowledgeCompatibilityMatrices,
  registerKnowledgeCompatibilityMatrix,
  updateKnowledgeCompatibilityMatrixStatus,
} from "./compatibility-runtime/matrix.registry";

export {
  clearKnowledgeCompatibilityPairs,
  getKnowledgeCompatibilityPair,
  listKnowledgeCompatibilityPairs,
  registerKnowledgeCompatibilityPair,
  updateKnowledgeCompatibilityPairStatus,
} from "./compatibility-runtime/pair.registry";

export {
  bindKnowledgeCompatibilityPair,
  clearKnowledgeCompatibilityBindings,
  getKnowledgeCompatibilityBinding,
  listKnowledgeCompatibilityBindings,
} from "./compatibility-runtime/binding.registry";

export {
  assertKnowledgeCompatibilityReadinessReady,
  buildKnowledgeCompatibilityManifest,
  clearKnowledgeCompatibilityLayer,
  evaluateKnowledgeCompatibilityReadiness,
} from "./compatibility-runtime/compatibility.manifest";

export {
  assertProductKnowledgeCompatibilityReleaseGatePass,
  checkProductKnowledgeCompatibilityReleaseGate,
  PRODUCT_KNOWLEDGE_COMPATIBILITY_SIGNOFF_VERSION,
} from "./verify/knowledge.compatibility.gate";

export {
  KNOWLEDGE_GOVERNANCE_APPROVALS,
  KNOWLEDGE_GOVERNANCE_BINDING_STATUSES,
  KNOWLEDGE_GOVERNANCE_READINESS_VERDICTS,
  KNOWLEDGE_GOVERNANCE_REVIEW_STATUSES,
  KNOWLEDGE_GOVERNANCE_RISK_LEVELS,
  KNOWLEDGE_GOVERNANCE_STANDARD_KINDS,
  KNOWLEDGE_GOVERNANCE_STANDARD_STATUSES,
  PRODUCT_KNOWLEDGE_GOVERNANCE_BASE,
  PRODUCT_KNOWLEDGE_GOVERNANCE_FREEZE_TAG,
  PRODUCT_KNOWLEDGE_GOVERNANCE_FREEZE_VERSION,
  PRODUCT_KNOWLEDGE_GOVERNANCE_ID,
  PRODUCT_KNOWLEDGE_GOVERNANCE_VERSION,
} from "./governance/governance.constants";

export type {
  BindKnowledgeGovernanceReviewInput,
  KnowledgeGovernanceApproval,
  KnowledgeGovernanceBinding,
  KnowledgeGovernanceBindingStatus,
  KnowledgeGovernanceManifest,
  KnowledgeGovernanceMetadata,
  KnowledgeGovernanceReadinessCheck,
  KnowledgeGovernanceReadinessResult,
  KnowledgeGovernanceReadinessVerdict,
  KnowledgeGovernanceReview,
  KnowledgeGovernanceReviewStatus,
  KnowledgeGovernanceRiskLevel,
  KnowledgeGovernanceStandard,
  KnowledgeGovernanceStandardKind,
  KnowledgeGovernanceStandardStatus,
  RegisterKnowledgeGovernanceReviewInput,
  RegisterKnowledgeGovernanceStandardInput,
  UpdateKnowledgeGovernanceReviewStatusInput,
  UpdateKnowledgeGovernanceStandardStatusInput,
} from "./governance/governance.types";

export {
  getKnowledgeGovernanceMetadata,
  isKnowledgeGovernanceMetadataIntact,
  PRODUCT_KNOWLEDGE_GOVERNANCE_METADATA,
  type KnowledgeGovernanceMetadataRecord,
} from "./governance/governance.metadata";

export {
  clearKnowledgeGovernanceStandards,
  getKnowledgeGovernanceStandard,
  listKnowledgeGovernanceStandards,
  registerKnowledgeGovernanceStandard,
  updateKnowledgeGovernanceStandardStatus,
} from "./governance/standard.registry";

export {
  clearKnowledgeGovernanceReviews,
  getKnowledgeGovernanceReview,
  listKnowledgeGovernanceReviews,
  registerKnowledgeGovernanceReview,
  updateKnowledgeGovernanceReviewStatus,
} from "./governance/review.registry";

export {
  bindKnowledgeGovernanceReview,
  clearKnowledgeGovernanceBindings,
  getKnowledgeGovernanceBinding,
  listKnowledgeGovernanceBindings,
} from "./governance/binding.registry";

export {
  assertKnowledgeGovernanceReadinessReady,
  buildKnowledgeGovernanceManifest,
  clearKnowledgeGovernanceLayer,
  evaluateKnowledgeGovernanceReadiness,
} from "./governance/governance.manifest";

export {
  assertProductKnowledgeGovernanceReleaseGatePass,
  checkProductKnowledgeGovernanceReleaseGate,
  PRODUCT_KNOWLEDGE_GOVERNANCE_SIGNOFF_VERSION,
} from "./verify/knowledge.governance.gate";

export {
  KNOWLEDGE_LIFECYCLE_BINDING_STATUSES,
  KNOWLEDGE_LIFECYCLE_PLAN_KINDS,
  KNOWLEDGE_LIFECYCLE_PLAN_STATUSES,
  KNOWLEDGE_LIFECYCLE_READINESS_VERDICTS,
  KNOWLEDGE_LIFECYCLE_STATES,
  KNOWLEDGE_LIFECYCLE_TRANSITION_STATUSES,
  KNOWLEDGE_LIFECYCLE_TRIGGERS,
  PRODUCT_KNOWLEDGE_LIFECYCLE_BASE,
  PRODUCT_KNOWLEDGE_LIFECYCLE_FREEZE_TAG,
  PRODUCT_KNOWLEDGE_LIFECYCLE_FREEZE_VERSION,
  PRODUCT_KNOWLEDGE_LIFECYCLE_ID,
  PRODUCT_KNOWLEDGE_LIFECYCLE_VERSION,
} from "./lifecycle-runtime/lifecycle.constants";

export type {
  BindKnowledgeLifecycleTransitionInput,
  KnowledgeLifecycleBinding,
  KnowledgeLifecycleBindingStatus,
  KnowledgeLifecycleManifest,
  KnowledgeLifecycleMetadata,
  KnowledgeLifecyclePlan,
  KnowledgeLifecyclePlanKind,
  KnowledgeLifecyclePlanStatus,
  KnowledgeLifecycleReadinessCheck,
  KnowledgeLifecycleReadinessResult,
  KnowledgeLifecycleReadinessVerdict,
  KnowledgeLifecycleState,
  KnowledgeLifecycleTransition,
  KnowledgeLifecycleTransitionStatus,
  KnowledgeLifecycleTrigger,
  RegisterKnowledgeLifecyclePlanInput,
  RegisterKnowledgeLifecycleTransitionInput,
  UpdateKnowledgeLifecyclePlanStatusInput,
  UpdateKnowledgeLifecycleTransitionStatusInput,
} from "./lifecycle-runtime/lifecycle.types";

export {
  getKnowledgeLifecycleMetadata,
  isKnowledgeLifecycleMetadataIntact,
  PRODUCT_KNOWLEDGE_LIFECYCLE_METADATA,
  type KnowledgeLifecycleMetadataRecord,
} from "./lifecycle-runtime/lifecycle.metadata";

export {
  clearKnowledgeLifecyclePlans,
  getKnowledgeLifecyclePlan,
  listKnowledgeLifecyclePlans,
  registerKnowledgeLifecyclePlan,
  updateKnowledgeLifecyclePlanStatus,
} from "./lifecycle-runtime/plan.registry";

export {
  clearKnowledgeLifecycleTransitions,
  getKnowledgeLifecycleTransition,
  listKnowledgeLifecycleTransitions,
  registerKnowledgeLifecycleTransition,
  updateKnowledgeLifecycleTransitionStatus,
} from "./lifecycle-runtime/transition.registry";

export {
  bindKnowledgeLifecycleTransition,
  clearKnowledgeLifecycleBindings,
  getKnowledgeLifecycleBinding,
  listKnowledgeLifecycleBindings,
} from "./lifecycle-runtime/binding.registry";

export {
  assertKnowledgeLifecycleReadinessReady,
  buildKnowledgeLifecycleManifest,
  clearKnowledgeLifecycleLayer,
  evaluateKnowledgeLifecycleReadiness,
} from "./lifecycle-runtime/lifecycle.manifest";

export {
  assertProductKnowledgeLifecycleReleaseGatePass,
  checkProductKnowledgeLifecycleReleaseGate,
  PRODUCT_KNOWLEDGE_LIFECYCLE_SIGNOFF_VERSION,
} from "./verify/knowledge.lifecycle.gate";

export {
  ENTERPRISE_PRODUCT_KNOWLEDGE_BASELINE_ID,
  isProductKnowledgeFreezeLockIntact,
  PRODUCT_KNOWLEDGE_BASELINE_FREEZE_BASE,
  PRODUCT_KNOWLEDGE_BASELINE_FREEZE_VERSION,
  PRODUCT_KNOWLEDGE_BASELINE_ID,
  PRODUCT_KNOWLEDGE_COMPONENT_LOCK,
  PRODUCT_KNOWLEDGE_FREEZE_LOCK,
  PRODUCT_KNOWLEDGE_PHASE_VERSIONS,
  PRODUCT_KNOWLEDGE_SIGNOFF_VERSION,
  type ProductKnowledgeComponentId,
  type ProductKnowledgeComponentLock,
  type ProductKnowledgeFreezeLock,
  type ProductKnowledgePhaseVersions,
} from "./baseline/freeze/freeze.lock";

export {
  isProductKnowledgeImmutableManifestIntact,
  PRODUCT_KNOWLEDGE_IMMUTABLE_MANIFEST,
  type ProductKnowledgeImmutableManifest,
} from "./baseline/freeze/immutable.manifest";

export {
  isProductKnowledgeRollbackSnapshotIntact,
  PRODUCT_KNOWLEDGE_ROLLBACK_SNAPSHOT,
  type ProductKnowledgeRollbackSnapshot,
} from "./baseline/freeze/rollback.snapshot";

export {
  assertProductKnowledgeBaselineReleaseGatePass,
  checkProductKnowledgeBaselineReleaseGate,
  PRODUCT_KNOWLEDGE_BASELINE_SIGNOFF_VERSION,
} from "./verify/knowledge.baseline.gate";
