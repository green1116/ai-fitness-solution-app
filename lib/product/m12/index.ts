/**
 * Product M12 — AI Agent Platform public exports
 * Isolated namespace: lib/product/m12
 * Additive exports: Foundation (P1) → Catalog (P2) → Dependency (P3) → Policy (P4) → Compatibility (P5) → Governance (P6) → Lifecycle (P7) → Baseline (P8)
 */

export {
  AGENT_CAPABILITY_KINDS,
  AGENT_CAPABILITY_STATUSES,
  AGENT_DOMAIN_SCOPES,
  AGENT_GOVERNANCE_POLICY_KINDS,
  AGENT_GOVERNANCE_POLICY_STATUSES,
  AGENT_INVOCATION_MODES,
  AGENT_READINESS_VERDICTS,
  AGENT_ROLES,
  AGENT_STATUSES,
  PRODUCT_AGENT_FOUNDATION_BASE,
  PRODUCT_AGENT_FOUNDATION_FREEZE_VERSION,
  PRODUCT_AGENT_FOUNDATION_ID,
  PRODUCT_AGENT_FOUNDATION_VERSION,
  PRODUCT_AGENT_FREEZE_TAG,
} from "./foundation/agent.constants";

export type {
  AgentCapability,
  AgentCapabilityKind,
  AgentCapabilityStatus,
  AgentDefinition,
  AgentDefinitionValidationIssue,
  AgentDefinitionValidationResult,
  AgentDomainScope,
  AgentFoundationManifest,
  AgentGovernancePolicy,
  AgentGovernancePolicyKind,
  AgentGovernancePolicyStatus,
  AgentInvocationContract,
  AgentInvocationHit,
  AgentInvocationMode,
  AgentInvocationQuery,
  AgentMetadata,
  AgentReadinessCheck,
  AgentReadinessResult,
  AgentReadinessVerdict,
  AgentRole,
  AgentStatus,
  EvaluateAgentInvocationContractInput,
  RegisterAgentCapabilityInput,
  RegisterAgentDefinitionInput,
  RegisterAgentGovernancePolicyInput,
  UpdateAgentCapabilityStatusInput,
  UpdateAgentDefinitionStatusInput,
} from "./foundation/agent.types";

export {
  getAgentFoundationMetadata,
  isAgentFoundationMetadataIntact,
  PRODUCT_AGENT_FOUNDATION_METADATA,
  validateAgentDefinition,
  validateAgentDefinitionInput,
  type AgentFoundationMetadata,
} from "./foundation/agent.metadata";

export {
  clearAgentDefinitions,
  getAgentDefinition,
  getAgentDefinitionByKey,
  listAgentDefinitions,
  registerAgentDefinition,
  updateAgentDefinitionStatus,
} from "./foundation/agent.registry";

export {
  clearAgentCapabilities,
  getAgentCapability,
  listAgentCapabilities,
  registerAgentCapability,
  updateAgentCapabilityStatus,
} from "./foundation/capability.registry";

export {
  clearAgentGovernancePolicies,
  getAgentGovernancePolicy,
  listAgentGovernancePolicies,
  registerAgentGovernancePolicy,
} from "./foundation/governance.policy";

export {
  clearAgentInvocationContracts,
  evaluateAgentInvocationContract,
  getAgentInvocationContract,
  listAgentInvocationContracts,
} from "./foundation/invocation.contract";

export {
  assertAgentFoundationReadinessReady,
  buildAgentFoundationManifest,
  clearAgentFoundationLayer,
  evaluateAgentFoundationReadiness,
} from "./foundation/agent.manifest";

export {
  assertProductAgentFoundationReleaseGatePass,
  checkProductAgentFoundationReleaseGate,
  PRODUCT_AGENT_FOUNDATION_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/agent.foundation.gate";

export {
  AGENT_CATALOG_BINDING_STATUSES,
  AGENT_CATALOG_ENTRY_STATUSES,
  AGENT_CATALOG_KINDS,
  AGENT_CATALOG_READINESS_VERDICTS,
  AGENT_CATALOG_STATUSES,
  PRODUCT_AGENT_CATALOG_BASE,
  PRODUCT_AGENT_CATALOG_FREEZE_TAG,
  PRODUCT_AGENT_CATALOG_FREEZE_VERSION,
  PRODUCT_AGENT_CATALOG_ID,
  PRODUCT_AGENT_CATALOG_VERSION,
} from "./catalog/catalog.constants";

export type {
  AgentCatalog,
  AgentCatalogBinding,
  AgentCatalogBindingStatus,
  AgentCatalogEntry,
  AgentCatalogEntryStatus,
  AgentCatalogKind,
  AgentCatalogManifest,
  AgentCatalogMetadata,
  AgentCatalogReadinessCheck,
  AgentCatalogReadinessResult,
  AgentCatalogReadinessVerdict,
  AgentCatalogStatus,
  BindAgentCatalogEntryInput,
  RegisterAgentCatalogEntryInput,
  RegisterAgentCatalogInput,
  UpdateAgentCatalogEntryStatusInput,
  UpdateAgentCatalogStatusInput,
} from "./catalog/catalog.types";

export {
  getAgentCatalogMetadata,
  isAgentCatalogMetadataIntact,
  PRODUCT_AGENT_CATALOG_METADATA,
  type AgentCatalogMetadataRecord,
} from "./catalog/catalog.metadata";

export {
  clearAgentCatalogs,
  getAgentCatalog,
  getAgentCatalogByKey,
  listAgentCatalogs,
  registerAgentCatalog,
  updateAgentCatalogStatus,
} from "./catalog/catalog.registry";

export {
  clearAgentCatalogEntries,
  getAgentCatalogEntry,
  listAgentCatalogEntries,
  registerAgentCatalogEntry,
  updateAgentCatalogEntryStatus,
} from "./catalog/entry.registry";

export {
  bindAgentCatalogEntry,
  clearAgentCatalogBindings,
  getAgentCatalogBinding,
  listAgentCatalogBindings,
} from "./catalog/binding.registry";

export {
  assertAgentCatalogReadinessReady,
  buildAgentCatalogManifest,
  clearAgentCatalogLayer,
  evaluateAgentCatalogReadiness,
} from "./catalog/catalog.manifest";

export {
  assertProductAgentCatalogReleaseGatePass,
  checkProductAgentCatalogReleaseGate,
  PRODUCT_AGENT_CATALOG_SIGNOFF_VERSION,
} from "./verify/agent.catalog.gate";

export {
  AGENT_DEPENDENCY_EDGE_STATUSES,
  AGENT_DEPENDENCY_GRAPH_KINDS,
  AGENT_DEPENDENCY_GRAPH_STATUSES,
  AGENT_DEPENDENCY_IMPACTS,
  AGENT_DEPENDENCY_NODE_STATUSES,
  AGENT_DEPENDENCY_READINESS_VERDICTS,
  PRODUCT_AGENT_DEPENDENCY_BASE,
  PRODUCT_AGENT_DEPENDENCY_FREEZE_TAG,
  PRODUCT_AGENT_DEPENDENCY_FREEZE_VERSION,
  PRODUCT_AGENT_DEPENDENCY_ID,
  PRODUCT_AGENT_DEPENDENCY_VERSION,
} from "./dependency-runtime/dependency.constants";

export type {
  AgentDependencyEdge,
  AgentDependencyEdgeStatus,
  AgentDependencyGraph,
  AgentDependencyGraphKind,
  AgentDependencyGraphStatus,
  AgentDependencyImpact,
  AgentDependencyManifest,
  AgentDependencyMetadata,
  AgentDependencyNode,
  AgentDependencyNodeStatus,
  AgentDependencyReadinessCheck,
  AgentDependencyReadinessResult,
  AgentDependencyReadinessVerdict,
  BindAgentDependencyEdgeInput,
  RegisterAgentDependencyGraphInput,
  RegisterAgentDependencyNodeInput,
  UpdateAgentDependencyGraphStatusInput,
  UpdateAgentDependencyNodeStatusInput,
} from "./dependency-runtime/dependency.types";

export {
  getAgentDependencyMetadata,
  isAgentDependencyMetadataIntact,
  PRODUCT_AGENT_DEPENDENCY_METADATA,
  type AgentDependencyMetadataRecord,
} from "./dependency-runtime/dependency.metadata";

export {
  clearAgentDependencyGraphs,
  getAgentDependencyGraph,
  listAgentDependencyGraphs,
  registerAgentDependencyGraph,
  updateAgentDependencyGraphStatus,
} from "./dependency-runtime/graph.registry";

export {
  clearAgentDependencyNodes,
  getAgentDependencyNode,
  listAgentDependencyNodes,
  registerAgentDependencyNode,
  updateAgentDependencyNodeStatus,
} from "./dependency-runtime/node.registry";

export {
  bindAgentDependencyEdge,
  clearAgentDependencyEdges,
  getAgentDependencyEdge,
  isAgentDependencyGraphAcyclic,
  listAgentDependencyEdges,
} from "./dependency-runtime/edge.registry";

export {
  assertAgentDependencyReadinessReady,
  buildAgentDependencyManifest,
  clearAgentDependencyLayer,
  evaluateAgentDependencyReadiness,
} from "./dependency-runtime/dependency.manifest";

export {
  assertProductAgentDependencyReleaseGatePass,
  checkProductAgentDependencyReleaseGate,
  PRODUCT_AGENT_DEPENDENCY_SIGNOFF_VERSION,
} from "./verify/agent.dependency.gate";

export {
  AGENT_POLICY_BINDING_STATUSES,
  AGENT_POLICY_CONSTRAINTS,
  AGENT_POLICY_ENFORCEMENTS,
  AGENT_POLICY_KINDS,
  AGENT_POLICY_READINESS_VERDICTS,
  AGENT_POLICY_RULE_STATUSES,
  AGENT_POLICY_STATUSES,
  PRODUCT_AGENT_POLICY_BASE,
  PRODUCT_AGENT_POLICY_FREEZE_TAG,
  PRODUCT_AGENT_POLICY_FREEZE_VERSION,
  PRODUCT_AGENT_POLICY_ID,
  PRODUCT_AGENT_POLICY_VERSION,
} from "./policy-runtime/policy.constants";

export type {
  AgentPolicy,
  AgentPolicyBinding,
  AgentPolicyBindingStatus,
  AgentPolicyConstraint,
  AgentPolicyEnforcement,
  AgentPolicyKind,
  AgentPolicyManifest,
  AgentPolicyMetadata,
  AgentPolicyReadinessCheck,
  AgentPolicyReadinessResult,
  AgentPolicyReadinessVerdict,
  AgentPolicyRule,
  AgentPolicyRuleStatus,
  AgentPolicyStatus,
  BindAgentPolicyRuleInput,
  RegisterAgentPolicyInput,
  RegisterAgentPolicyRuleInput,
  UpdateAgentPolicyRuleStatusInput,
  UpdateAgentPolicyStatusInput,
} from "./policy-runtime/policy.types";

export {
  getAgentPolicyMetadata,
  isAgentPolicyMetadataIntact,
  PRODUCT_AGENT_POLICY_METADATA,
  type AgentPolicyMetadataRecord,
} from "./policy-runtime/policy.metadata";

export {
  clearAgentPolicies,
  getAgentPolicy,
  listAgentPolicies,
  registerAgentPolicy,
  updateAgentPolicyStatus,
} from "./policy-runtime/policy.registry";

export {
  clearAgentPolicyRules,
  getAgentPolicyRule,
  listAgentPolicyRules,
  registerAgentPolicyRule,
  updateAgentPolicyRuleStatus,
} from "./policy-runtime/rule.registry";

export {
  bindAgentPolicyRule,
  clearAgentPolicyBindings,
  getAgentPolicyBinding,
  listAgentPolicyBindings,
} from "./policy-runtime/binding.registry";

export {
  assertAgentPolicyReadinessReady,
  buildAgentPolicyManifest,
  clearAgentPolicyLayer,
  evaluateAgentPolicyReadiness,
} from "./policy-runtime/policy.manifest";

export {
  assertProductAgentPolicyReleaseGatePass,
  checkProductAgentPolicyReleaseGate,
  PRODUCT_AGENT_POLICY_SIGNOFF_VERSION,
} from "./verify/agent.policy.gate";

export {
  AGENT_COMPATIBILITY_BINDING_STATUSES,
  AGENT_COMPATIBILITY_CONSTRAINTS,
  AGENT_COMPATIBILITY_MATRIX_KINDS,
  AGENT_COMPATIBILITY_MATRIX_STATUSES,
  AGENT_COMPATIBILITY_PAIR_STATUSES,
  AGENT_COMPATIBILITY_READINESS_VERDICTS,
  AGENT_COMPATIBILITY_RELATIONS,
  PRODUCT_AGENT_COMPATIBILITY_BASE,
  PRODUCT_AGENT_COMPATIBILITY_FREEZE_TAG,
  PRODUCT_AGENT_COMPATIBILITY_FREEZE_VERSION,
  PRODUCT_AGENT_COMPATIBILITY_ID,
  PRODUCT_AGENT_COMPATIBILITY_VERSION,
} from "./compatibility-runtime/compatibility.constants";

export type {
  AgentCompatibilityBinding,
  AgentCompatibilityBindingStatus,
  AgentCompatibilityConstraint,
  AgentCompatibilityManifest,
  AgentCompatibilityMatrix,
  AgentCompatibilityMatrixKind,
  AgentCompatibilityMatrixStatus,
  AgentCompatibilityMetadata,
  AgentCompatibilityPair,
  AgentCompatibilityPairStatus,
  AgentCompatibilityReadinessCheck,
  AgentCompatibilityReadinessResult,
  AgentCompatibilityReadinessVerdict,
  AgentCompatibilityRelation,
  BindAgentCompatibilityPairInput,
  RegisterAgentCompatibilityMatrixInput,
  RegisterAgentCompatibilityPairInput,
  UpdateAgentCompatibilityMatrixStatusInput,
  UpdateAgentCompatibilityPairStatusInput,
} from "./compatibility-runtime/compatibility.types";

export {
  getAgentCompatibilityMetadata,
  isAgentCompatibilityMetadataIntact,
  PRODUCT_AGENT_COMPATIBILITY_METADATA,
  type AgentCompatibilityMetadataRecord,
} from "./compatibility-runtime/compatibility.metadata";

export {
  clearAgentCompatibilityMatrices,
  getAgentCompatibilityMatrix,
  listAgentCompatibilityMatrices,
  registerAgentCompatibilityMatrix,
  updateAgentCompatibilityMatrixStatus,
} from "./compatibility-runtime/matrix.registry";

export {
  clearAgentCompatibilityPairs,
  getAgentCompatibilityPair,
  listAgentCompatibilityPairs,
  registerAgentCompatibilityPair,
  updateAgentCompatibilityPairStatus,
} from "./compatibility-runtime/pair.registry";

export {
  bindAgentCompatibilityPair,
  clearAgentCompatibilityBindings,
  getAgentCompatibilityBinding,
  listAgentCompatibilityBindings,
} from "./compatibility-runtime/binding.registry";

export {
  assertAgentCompatibilityReadinessReady,
  buildAgentCompatibilityManifest,
  clearAgentCompatibilityLayer,
  evaluateAgentCompatibilityReadiness,
} from "./compatibility-runtime/compatibility.manifest";

export {
  assertProductAgentCompatibilityReleaseGatePass,
  checkProductAgentCompatibilityReleaseGate,
  PRODUCT_AGENT_COMPATIBILITY_SIGNOFF_VERSION,
} from "./verify/agent.compatibility.gate";

export {
  AGENT_GOVERNANCE_APPROVALS,
  AGENT_GOVERNANCE_BINDING_STATUSES,
  AGENT_GOVERNANCE_READINESS_VERDICTS,
  AGENT_GOVERNANCE_REVIEW_STATUSES,
  AGENT_GOVERNANCE_RISK_LEVELS,
  AGENT_GOVERNANCE_STANDARD_KINDS,
  AGENT_GOVERNANCE_STANDARD_STATUSES,
  PRODUCT_AGENT_GOVERNANCE_BASE,
  PRODUCT_AGENT_GOVERNANCE_FREEZE_TAG,
  PRODUCT_AGENT_GOVERNANCE_FREEZE_VERSION,
  PRODUCT_AGENT_GOVERNANCE_ID,
  PRODUCT_AGENT_GOVERNANCE_VERSION,
} from "./governance/governance.constants";

export type {
  AgentGovernanceApproval,
  AgentGovernanceBinding,
  AgentGovernanceBindingStatus,
  AgentGovernanceManifest,
  AgentGovernanceMetadata,
  AgentGovernanceReadinessCheck,
  AgentGovernanceReadinessResult,
  AgentGovernanceReadinessVerdict,
  AgentGovernanceReview,
  AgentGovernanceReviewStatus,
  AgentGovernanceRiskLevel,
  AgentGovernanceStandard,
  AgentGovernanceStandardKind,
  AgentGovernanceStandardStatus,
  BindAgentGovernanceReviewInput,
  RegisterAgentGovernanceReviewInput,
  RegisterAgentGovernanceStandardInput,
  UpdateAgentGovernanceReviewStatusInput,
  UpdateAgentGovernanceStandardStatusInput,
} from "./governance/governance.types";

export {
  getAgentGovernanceMetadata,
  isAgentGovernanceMetadataIntact,
  PRODUCT_AGENT_GOVERNANCE_METADATA,
  type AgentGovernanceMetadataRecord,
} from "./governance/governance.metadata";

export {
  clearAgentGovernanceStandards,
  getAgentGovernanceStandard,
  listAgentGovernanceStandards,
  registerAgentGovernanceStandard,
  updateAgentGovernanceStandardStatus,
} from "./governance/standard.registry";

export {
  clearAgentGovernanceReviews,
  getAgentGovernanceReview,
  listAgentGovernanceReviews,
  registerAgentGovernanceReview,
  updateAgentGovernanceReviewStatus,
} from "./governance/review.registry";

export {
  bindAgentGovernanceReview,
  clearAgentGovernanceBindings,
  getAgentGovernanceBinding,
  listAgentGovernanceBindings,
} from "./governance/binding.registry";

export {
  assertAgentGovernanceReadinessReady,
  buildAgentGovernanceManifest,
  clearAgentGovernanceLayer,
  evaluateAgentGovernanceReadiness,
} from "./governance/governance.manifest";

export {
  assertProductAgentGovernanceReleaseGatePass,
  checkProductAgentGovernanceReleaseGate,
  PRODUCT_AGENT_GOVERNANCE_SIGNOFF_VERSION,
} from "./verify/agent.governance.gate";

export {
  AGENT_LIFECYCLE_BINDING_STATUSES,
  AGENT_LIFECYCLE_PLAN_KINDS,
  AGENT_LIFECYCLE_PLAN_STATUSES,
  AGENT_LIFECYCLE_READINESS_VERDICTS,
  AGENT_LIFECYCLE_STATES,
  AGENT_LIFECYCLE_TRANSITION_STATUSES,
  AGENT_LIFECYCLE_TRIGGERS,
  PRODUCT_AGENT_LIFECYCLE_BASE,
  PRODUCT_AGENT_LIFECYCLE_FREEZE_TAG,
  PRODUCT_AGENT_LIFECYCLE_FREEZE_VERSION,
  PRODUCT_AGENT_LIFECYCLE_ID,
  PRODUCT_AGENT_LIFECYCLE_VERSION,
} from "./lifecycle-runtime/lifecycle.constants";

export type {
  AgentLifecycleBinding,
  AgentLifecycleBindingStatus,
  AgentLifecycleManifest,
  AgentLifecycleMetadata,
  AgentLifecyclePlan,
  AgentLifecyclePlanKind,
  AgentLifecyclePlanStatus,
  AgentLifecycleReadinessCheck,
  AgentLifecycleReadinessResult,
  AgentLifecycleReadinessVerdict,
  AgentLifecycleState,
  AgentLifecycleTransition,
  AgentLifecycleTransitionStatus,
  AgentLifecycleTrigger,
  BindAgentLifecycleTransitionInput,
  RegisterAgentLifecyclePlanInput,
  RegisterAgentLifecycleTransitionInput,
  UpdateAgentLifecyclePlanStatusInput,
  UpdateAgentLifecycleTransitionStatusInput,
} from "./lifecycle-runtime/lifecycle.types";

export {
  getAgentLifecycleMetadata,
  isAgentLifecycleMetadataIntact,
  PRODUCT_AGENT_LIFECYCLE_METADATA,
  type AgentLifecycleMetadataRecord,
} from "./lifecycle-runtime/lifecycle.metadata";

export {
  clearAgentLifecyclePlans,
  getAgentLifecyclePlan,
  listAgentLifecyclePlans,
  registerAgentLifecyclePlan,
  updateAgentLifecyclePlanStatus,
} from "./lifecycle-runtime/plan.registry";

export {
  clearAgentLifecycleTransitions,
  getAgentLifecycleTransition,
  listAgentLifecycleTransitions,
  registerAgentLifecycleTransition,
  updateAgentLifecycleTransitionStatus,
} from "./lifecycle-runtime/transition.registry";

export {
  bindAgentLifecycleTransition,
  clearAgentLifecycleBindings,
  getAgentLifecycleBinding,
  listAgentLifecycleBindings,
} from "./lifecycle-runtime/binding.registry";

export {
  assertAgentLifecycleReadinessReady,
  buildAgentLifecycleManifest,
  clearAgentLifecycleLayer,
  evaluateAgentLifecycleReadiness,
} from "./lifecycle-runtime/lifecycle.manifest";

export {
  assertProductAgentLifecycleReleaseGatePass,
  checkProductAgentLifecycleReleaseGate,
  PRODUCT_AGENT_LIFECYCLE_SIGNOFF_VERSION,
} from "./verify/agent.lifecycle.gate";

export {
  ENTERPRISE_PRODUCT_AGENT_BASELINE_ID,
  isProductAgentFreezeLockIntact,
  PRODUCT_AGENT_BASELINE_FREEZE_BASE,
  PRODUCT_AGENT_BASELINE_FREEZE_VERSION,
  PRODUCT_AGENT_BASELINE_ID,
  PRODUCT_AGENT_COMPONENT_LOCK,
  PRODUCT_AGENT_FREEZE_LOCK,
  PRODUCT_AGENT_PHASE_VERSIONS,
  PRODUCT_AGENT_SIGNOFF_VERSION,
  type ProductAgentComponentId,
  type ProductAgentComponentLock,
  type ProductAgentFreezeLock,
  type ProductAgentPhaseVersions,
} from "./baseline/freeze/freeze.lock";

export {
  isProductAgentImmutableManifestIntact,
  PRODUCT_AGENT_IMMUTABLE_MANIFEST,
  type ProductAgentImmutableManifest,
} from "./baseline/freeze/immutable.manifest";

export {
  isProductAgentRollbackSnapshotIntact,
  PRODUCT_AGENT_ROLLBACK_SNAPSHOT,
  type ProductAgentRollbackSnapshot,
} from "./baseline/freeze/rollback.snapshot";

export {
  assertProductAgentBaselineReleaseGatePass,
  checkProductAgentBaselineReleaseGate,
  PRODUCT_AGENT_BASELINE_SIGNOFF_VERSION,
} from "./verify/agent.baseline.gate";
