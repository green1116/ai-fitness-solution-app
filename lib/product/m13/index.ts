/**
 * Product M13 — Enterprise Operating System public exports
 * Isolated namespace: lib/product/m13
 * Additive exports: Foundation (P1) → Catalog (P2) → Dependency (P3) → Policy (P4) → Compatibility (P5) → Governance (P6) → Lifecycle (P7) → Baseline (P8)
 */

export {
  OS_CAPABILITY_KINDS,
  OS_CAPABILITY_STATUSES,
  OS_DOMAIN_SCOPES,
  OS_GOVERNANCE_POLICY_KINDS,
  OS_GOVERNANCE_POLICY_STATUSES,
  OS_OPERATION_MODES,
  OS_READINESS_VERDICTS,
  OS_SURFACE_KINDS,
  OS_SURFACE_STATUSES,
  PRODUCT_OS_FOUNDATION_BASE,
  PRODUCT_OS_FOUNDATION_FREEZE_VERSION,
  PRODUCT_OS_FOUNDATION_ID,
  PRODUCT_OS_FOUNDATION_VERSION,
  PRODUCT_OS_FREEZE_TAG,
} from "./foundation/os.constants";

export type {
  EvaluateOsOperationContractInput,
  OsCapability,
  OsCapabilityKind,
  OsCapabilityStatus,
  OsDomainScope,
  OsFoundationManifest,
  OsGovernancePolicy,
  OsGovernancePolicyKind,
  OsGovernancePolicyStatus,
  OsMetadata,
  OsOperationContract,
  OsOperationHit,
  OsOperationMode,
  OsOperationQuery,
  OsReadinessCheck,
  OsReadinessResult,
  OsReadinessVerdict,
  OsSurface,
  OsSurfaceKind,
  OsSurfaceStatus,
  OsSurfaceValidationIssue,
  OsSurfaceValidationResult,
  RegisterOsCapabilityInput,
  RegisterOsGovernancePolicyInput,
  RegisterOsSurfaceInput,
  UpdateOsCapabilityStatusInput,
  UpdateOsSurfaceStatusInput,
} from "./foundation/os.types";

export {
  getOsFoundationMetadata,
  isOsFoundationMetadataIntact,
  PRODUCT_OS_FOUNDATION_METADATA,
  validateOsSurface,
  validateOsSurfaceInput,
  type OsFoundationMetadata,
} from "./foundation/os.metadata";

export {
  clearOsSurfaces,
  getOsSurface,
  getOsSurfaceByKey,
  listOsSurfaces,
  registerOsSurface,
  updateOsSurfaceStatus,
} from "./foundation/os.registry";

export {
  clearOsCapabilities,
  getOsCapability,
  listOsCapabilities,
  registerOsCapability,
  updateOsCapabilityStatus,
} from "./foundation/capability.registry";

export {
  clearOsGovernancePolicies,
  getOsGovernancePolicy,
  listOsGovernancePolicies,
  registerOsGovernancePolicy,
} from "./foundation/governance.policy";

export {
  clearOsOperationContracts,
  evaluateOsOperationContract,
  getOsOperationContract,
  listOsOperationContracts,
} from "./foundation/operation.contract";

export {
  assertOsFoundationReadinessReady,
  buildOsFoundationManifest,
  clearOsFoundationLayer,
  evaluateOsFoundationReadiness,
} from "./foundation/os.manifest";

export {
  assertProductOsFoundationReleaseGatePass,
  checkProductOsFoundationReleaseGate,
  PRODUCT_OS_FOUNDATION_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/os.foundation.gate";

export {
  OS_CATALOG_BINDING_STATUSES,
  OS_CATALOG_ENTRY_STATUSES,
  OS_CATALOG_KINDS,
  OS_CATALOG_READINESS_VERDICTS,
  OS_CATALOG_STATUSES,
  PRODUCT_OS_CATALOG_BASE,
  PRODUCT_OS_CATALOG_FREEZE_TAG,
  PRODUCT_OS_CATALOG_FREEZE_VERSION,
  PRODUCT_OS_CATALOG_ID,
  PRODUCT_OS_CATALOG_VERSION,
} from "./catalog-runtime/catalog.constants";

export type {
  BindOsCatalogEntryInput,
  OsCatalog,
  OsCatalogBinding,
  OsCatalogBindingStatus,
  OsCatalogEntry,
  OsCatalogEntryStatus,
  OsCatalogKind,
  OsCatalogManifest,
  OsCatalogMetadata,
  OsCatalogReadinessCheck,
  OsCatalogReadinessResult,
  OsCatalogReadinessVerdict,
  OsCatalogStatus,
  RegisterOsCatalogEntryInput,
  RegisterOsCatalogInput,
  UpdateOsCatalogEntryStatusInput,
  UpdateOsCatalogStatusInput,
} from "./catalog-runtime/catalog.types";

export {
  getOsCatalogMetadata,
  isOsCatalogMetadataIntact,
  PRODUCT_OS_CATALOG_METADATA,
  type OsCatalogMetadataRecord,
} from "./catalog-runtime/catalog.metadata";

export {
  clearOsCatalogs,
  getOsCatalog,
  getOsCatalogByKey,
  listOsCatalogs,
  registerOsCatalog,
  updateOsCatalogStatus,
} from "./catalog-runtime/catalog.registry";

export {
  clearOsCatalogEntries,
  getOsCatalogEntry,
  listOsCatalogEntries,
  registerOsCatalogEntry,
  updateOsCatalogEntryStatus,
} from "./catalog-runtime/entry.registry";

export {
  bindOsCatalogEntry,
  clearOsCatalogBindings,
  getOsCatalogBinding,
  listOsCatalogBindings,
} from "./catalog-runtime/binding.registry";

export {
  assertOsCatalogReadinessReady,
  buildOsCatalogManifest,
  clearOsCatalogLayer,
  evaluateOsCatalogReadiness,
} from "./catalog-runtime/catalog.manifest";

export {
  assertProductOsCatalogReleaseGatePass,
  checkProductOsCatalogReleaseGate,
  PRODUCT_OS_CATALOG_SIGNOFF_VERSION,
} from "./verify/os.catalog.gate";

export {
  OS_DEPENDENCY_EDGE_STATUSES,
  OS_DEPENDENCY_GRAPH_KINDS,
  OS_DEPENDENCY_GRAPH_STATUSES,
  OS_DEPENDENCY_IMPACTS,
  OS_DEPENDENCY_NODE_STATUSES,
  OS_DEPENDENCY_READINESS_VERDICTS,
  PRODUCT_OS_DEPENDENCY_BASE,
  PRODUCT_OS_DEPENDENCY_FREEZE_TAG,
  PRODUCT_OS_DEPENDENCY_FREEZE_VERSION,
  PRODUCT_OS_DEPENDENCY_ID,
  PRODUCT_OS_DEPENDENCY_VERSION,
} from "./dependency-runtime/dependency.constants";

export type {
  BindOsDependencyEdgeInput,
  OsDependencyEdge,
  OsDependencyEdgeStatus,
  OsDependencyGraph,
  OsDependencyGraphKind,
  OsDependencyGraphStatus,
  OsDependencyImpact,
  OsDependencyManifest,
  OsDependencyMetadata,
  OsDependencyNode,
  OsDependencyNodeStatus,
  OsDependencyReadinessCheck,
  OsDependencyReadinessResult,
  OsDependencyReadinessVerdict,
  RegisterOsDependencyGraphInput,
  RegisterOsDependencyNodeInput,
  UpdateOsDependencyGraphStatusInput,
  UpdateOsDependencyNodeStatusInput,
} from "./dependency-runtime/dependency.types";

export {
  getOsDependencyMetadata,
  isOsDependencyMetadataIntact,
  PRODUCT_OS_DEPENDENCY_METADATA,
  type OsDependencyMetadataRecord,
} from "./dependency-runtime/dependency.metadata";

export {
  clearOsDependencyGraphs,
  getOsDependencyGraph,
  listOsDependencyGraphs,
  registerOsDependencyGraph,
  updateOsDependencyGraphStatus,
} from "./dependency-runtime/graph.registry";

export {
  clearOsDependencyNodes,
  getOsDependencyNode,
  listOsDependencyNodes,
  registerOsDependencyNode,
  updateOsDependencyNodeStatus,
} from "./dependency-runtime/node.registry";

export {
  bindOsDependencyEdge,
  clearOsDependencyEdges,
  getOsDependencyEdge,
  isOsDependencyGraphAcyclic,
  listOsDependencyEdges,
} from "./dependency-runtime/edge.registry";

export {
  assertOsDependencyReadinessReady,
  buildOsDependencyManifest,
  clearOsDependencyLayer,
  evaluateOsDependencyReadiness,
} from "./dependency-runtime/dependency.manifest";

export {
  assertProductOsDependencyReleaseGatePass,
  checkProductOsDependencyReleaseGate,
  PRODUCT_OS_DEPENDENCY_SIGNOFF_VERSION,
} from "./verify/os.dependency.gate";

export {
  OS_POLICY_BINDING_STATUSES,
  OS_POLICY_CONSTRAINTS,
  OS_POLICY_ENFORCEMENTS,
  OS_POLICY_KINDS,
  OS_POLICY_READINESS_VERDICTS,
  OS_POLICY_RULE_STATUSES,
  OS_POLICY_STATUSES,
  PRODUCT_OS_POLICY_BASE,
  PRODUCT_OS_POLICY_FREEZE_TAG,
  PRODUCT_OS_POLICY_FREEZE_VERSION,
  PRODUCT_OS_POLICY_ID,
  PRODUCT_OS_POLICY_VERSION,
} from "./policy-runtime/policy.constants";

export type {
  BindOsPolicyRuleInput,
  OsPolicy,
  OsPolicyBinding,
  OsPolicyBindingStatus,
  OsPolicyConstraint,
  OsPolicyEnforcement,
  OsPolicyKind,
  OsPolicyManifest,
  OsPolicyMetadata,
  OsPolicyReadinessCheck,
  OsPolicyReadinessResult,
  OsPolicyReadinessVerdict,
  OsPolicyRule,
  OsPolicyRuleStatus,
  OsPolicyStatus,
  RegisterOsPolicyInput,
  RegisterOsPolicyRuleInput,
  UpdateOsPolicyRuleStatusInput,
  UpdateOsPolicyStatusInput,
} from "./policy-runtime/policy.types";

export {
  getOsPolicyMetadata,
  isOsPolicyMetadataIntact,
  PRODUCT_OS_POLICY_METADATA,
  type OsPolicyMetadataRecord,
} from "./policy-runtime/policy.metadata";

export {
  clearOsPolicies,
  getOsPolicy,
  listOsPolicies,
  registerOsPolicy,
  updateOsPolicyStatus,
} from "./policy-runtime/policy.registry";

export {
  clearOsPolicyRules,
  getOsPolicyRule,
  listOsPolicyRules,
  registerOsPolicyRule,
  updateOsPolicyRuleStatus,
} from "./policy-runtime/rule.registry";

export {
  bindOsPolicyRule,
  clearOsPolicyBindings,
  getOsPolicyBinding,
  listOsPolicyBindings,
} from "./policy-runtime/binding.registry";

export {
  assertOsPolicyReadinessReady,
  buildOsPolicyManifest,
  clearOsPolicyLayer,
  evaluateOsPolicyReadiness,
} from "./policy-runtime/policy.manifest";

export {
  assertProductOsPolicyReleaseGatePass,
  checkProductOsPolicyReleaseGate,
  PRODUCT_OS_POLICY_SIGNOFF_VERSION,
} from "./verify/os.policy.gate";

export {
  OS_COMPATIBILITY_BINDING_STATUSES,
  OS_COMPATIBILITY_CONSTRAINTS,
  OS_COMPATIBILITY_MATRIX_KINDS,
  OS_COMPATIBILITY_MATRIX_STATUSES,
  OS_COMPATIBILITY_PAIR_STATUSES,
  OS_COMPATIBILITY_READINESS_VERDICTS,
  OS_COMPATIBILITY_RELATIONS,
  PRODUCT_OS_COMPATIBILITY_BASE,
  PRODUCT_OS_COMPATIBILITY_FREEZE_TAG,
  PRODUCT_OS_COMPATIBILITY_FREEZE_VERSION,
  PRODUCT_OS_COMPATIBILITY_ID,
  PRODUCT_OS_COMPATIBILITY_VERSION,
} from "./compatibility-runtime/compatibility.constants";

export type {
  BindOsCompatibilityPairInput,
  OsCompatibilityBinding,
  OsCompatibilityBindingStatus,
  OsCompatibilityConstraint,
  OsCompatibilityManifest,
  OsCompatibilityMatrix,
  OsCompatibilityMatrixKind,
  OsCompatibilityMatrixStatus,
  OsCompatibilityMetadata,
  OsCompatibilityPair,
  OsCompatibilityPairStatus,
  OsCompatibilityReadinessCheck,
  OsCompatibilityReadinessResult,
  OsCompatibilityReadinessVerdict,
  OsCompatibilityRelation,
  RegisterOsCompatibilityMatrixInput,
  RegisterOsCompatibilityPairInput,
  UpdateOsCompatibilityMatrixStatusInput,
  UpdateOsCompatibilityPairStatusInput,
} from "./compatibility-runtime/compatibility.types";

export {
  getOsCompatibilityMetadata,
  isOsCompatibilityMetadataIntact,
  PRODUCT_OS_COMPATIBILITY_METADATA,
  type OsCompatibilityMetadataRecord,
} from "./compatibility-runtime/compatibility.metadata";

export {
  clearOsCompatibilityMatrices,
  getOsCompatibilityMatrix,
  listOsCompatibilityMatrices,
  registerOsCompatibilityMatrix,
  updateOsCompatibilityMatrixStatus,
} from "./compatibility-runtime/matrix.registry";

export {
  clearOsCompatibilityPairs,
  getOsCompatibilityPair,
  listOsCompatibilityPairs,
  registerOsCompatibilityPair,
  updateOsCompatibilityPairStatus,
} from "./compatibility-runtime/pair.registry";

export {
  bindOsCompatibilityPair,
  clearOsCompatibilityBindings,
  getOsCompatibilityBinding,
  listOsCompatibilityBindings,
} from "./compatibility-runtime/binding.registry";

export {
  assertOsCompatibilityReadinessReady,
  buildOsCompatibilityManifest,
  clearOsCompatibilityLayer,
  evaluateOsCompatibilityReadiness,
} from "./compatibility-runtime/compatibility.manifest";

export {
  assertProductOsCompatibilityReleaseGatePass,
  checkProductOsCompatibilityReleaseGate,
  PRODUCT_OS_COMPATIBILITY_SIGNOFF_VERSION,
} from "./verify/os.compatibility.gate";

export {
  OS_GOVERNANCE_APPROVALS,
  OS_GOVERNANCE_BINDING_STATUSES,
  OS_GOVERNANCE_READINESS_VERDICTS,
  OS_GOVERNANCE_REVIEW_STATUSES,
  OS_GOVERNANCE_RISK_LEVELS,
  OS_GOVERNANCE_STANDARD_KINDS,
  OS_GOVERNANCE_STANDARD_STATUSES,
  PRODUCT_OS_GOVERNANCE_BASE,
  PRODUCT_OS_GOVERNANCE_FREEZE_TAG,
  PRODUCT_OS_GOVERNANCE_FREEZE_VERSION,
  PRODUCT_OS_GOVERNANCE_ID,
  PRODUCT_OS_GOVERNANCE_VERSION,
} from "./governance/governance.constants";

export type {
  BindOsGovernanceReviewInput,
  OsGovernanceApproval,
  OsGovernanceBinding,
  OsGovernanceBindingStatus,
  OsGovernanceManifest,
  OsGovernanceMetadata,
  OsGovernanceReadinessCheck,
  OsGovernanceReadinessResult,
  OsGovernanceReadinessVerdict,
  OsGovernanceReview,
  OsGovernanceReviewStatus,
  OsGovernanceRiskLevel,
  OsGovernanceStandard,
  OsGovernanceStandardKind,
  OsGovernanceStandardStatus,
  RegisterOsGovernanceReviewInput,
  RegisterOsGovernanceStandardInput,
  UpdateOsGovernanceReviewStatusInput,
  UpdateOsGovernanceStandardStatusInput,
} from "./governance/governance.types";

export {
  getOsGovernanceMetadata,
  isOsGovernanceMetadataIntact,
  PRODUCT_OS_GOVERNANCE_METADATA,
  type OsGovernanceMetadataRecord,
} from "./governance/governance.metadata";

export {
  clearOsGovernanceStandards,
  getOsGovernanceStandard,
  listOsGovernanceStandards,
  registerOsGovernanceStandard,
  updateOsGovernanceStandardStatus,
} from "./governance/standard.registry";

export {
  clearOsGovernanceReviews,
  getOsGovernanceReview,
  listOsGovernanceReviews,
  registerOsGovernanceReview,
  updateOsGovernanceReviewStatus,
} from "./governance/review.registry";

export {
  bindOsGovernanceReview,
  clearOsGovernanceBindings,
  getOsGovernanceBinding,
  listOsGovernanceBindings,
} from "./governance/binding.registry";

export {
  assertOsGovernanceReadinessReady,
  buildOsGovernanceManifest,
  clearOsGovernanceLayer,
  evaluateOsGovernanceReadiness,
} from "./governance/governance.manifest";

export {
  assertProductOsGovernanceReleaseGatePass,
  checkProductOsGovernanceReleaseGate,
  PRODUCT_OS_GOVERNANCE_SIGNOFF_VERSION,
} from "./verify/os.governance.gate";

export {
  OS_LIFECYCLE_BINDING_STATUSES,
  OS_LIFECYCLE_PLAN_KINDS,
  OS_LIFECYCLE_PLAN_STATUSES,
  OS_LIFECYCLE_READINESS_VERDICTS,
  OS_LIFECYCLE_STATES,
  OS_LIFECYCLE_TRANSITION_STATUSES,
  OS_LIFECYCLE_TRIGGERS,
  PRODUCT_OS_LIFECYCLE_BASE,
  PRODUCT_OS_LIFECYCLE_FREEZE_TAG,
  PRODUCT_OS_LIFECYCLE_FREEZE_VERSION,
  PRODUCT_OS_LIFECYCLE_ID,
  PRODUCT_OS_LIFECYCLE_VERSION,
} from "./lifecycle-runtime/lifecycle.constants";

export type {
  BindOsLifecycleTransitionInput,
  OsLifecycleBinding,
  OsLifecycleBindingStatus,
  OsLifecycleManifest,
  OsLifecycleMetadata,
  OsLifecyclePlan,
  OsLifecyclePlanKind,
  OsLifecyclePlanStatus,
  OsLifecycleReadinessCheck,
  OsLifecycleReadinessResult,
  OsLifecycleReadinessVerdict,
  OsLifecycleState,
  OsLifecycleTransition,
  OsLifecycleTransitionStatus,
  OsLifecycleTrigger,
  RegisterOsLifecyclePlanInput,
  RegisterOsLifecycleTransitionInput,
  UpdateOsLifecyclePlanStatusInput,
  UpdateOsLifecycleTransitionStatusInput,
} from "./lifecycle-runtime/lifecycle.types";

export {
  getOsLifecycleMetadata,
  isOsLifecycleMetadataIntact,
  PRODUCT_OS_LIFECYCLE_METADATA,
  type OsLifecycleMetadataRecord,
} from "./lifecycle-runtime/lifecycle.metadata";

export {
  clearOsLifecyclePlans,
  getOsLifecyclePlan,
  listOsLifecyclePlans,
  registerOsLifecyclePlan,
  updateOsLifecyclePlanStatus,
} from "./lifecycle-runtime/plan.registry";

export {
  clearOsLifecycleTransitions,
  getOsLifecycleTransition,
  listOsLifecycleTransitions,
  registerOsLifecycleTransition,
  updateOsLifecycleTransitionStatus,
} from "./lifecycle-runtime/transition.registry";

export {
  bindOsLifecycleTransition,
  clearOsLifecycleBindings,
  getOsLifecycleBinding,
  listOsLifecycleBindings,
} from "./lifecycle-runtime/binding.registry";

export {
  assertOsLifecycleReadinessReady,
  buildOsLifecycleManifest,
  clearOsLifecycleLayer,
  evaluateOsLifecycleReadiness,
} from "./lifecycle-runtime/lifecycle.manifest";

export {
  assertProductOsLifecycleReleaseGatePass,
  checkProductOsLifecycleReleaseGate,
  PRODUCT_OS_LIFECYCLE_SIGNOFF_VERSION,
} from "./verify/os.lifecycle.gate";

export {
  ENTERPRISE_PRODUCT_OS_BASELINE_ID,
  isProductOsFreezeLockIntact,
  PRODUCT_OS_BASELINE_FREEZE_BASE,
  PRODUCT_OS_BASELINE_FREEZE_VERSION,
  PRODUCT_OS_BASELINE_ID,
  PRODUCT_OS_COMPONENT_LOCK,
  PRODUCT_OS_FREEZE_LOCK,
  PRODUCT_OS_PHASE_VERSIONS,
  PRODUCT_OS_SIGNOFF_VERSION,
  type ProductOsComponentId,
  type ProductOsComponentLock,
  type ProductOsFreezeLock,
  type ProductOsPhaseVersions,
} from "./baseline/freeze/freeze.lock";

export {
  isProductOsImmutableManifestIntact,
  PRODUCT_OS_IMMUTABLE_MANIFEST,
  type ProductOsImmutableManifest,
} from "./baseline/freeze/immutable.manifest";

export {
  isProductOsRollbackSnapshotIntact,
  PRODUCT_OS_ROLLBACK_SNAPSHOT,
  type ProductOsRollbackSnapshot,
} from "./baseline/freeze/rollback.snapshot";

export {
  assertProductOsBaselineReleaseGatePass,
  checkProductOsBaselineReleaseGate,
  PRODUCT_OS_BASELINE_SIGNOFF_VERSION,
} from "./verify/os.baseline.gate";
