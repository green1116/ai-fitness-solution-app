/**
 * Product M09 — AI Enhancement public exports
 * Isolated namespace: lib/product/m09
 */

export {
  AI_CAPABILITY_KINDS,
  AI_CAPABILITY_STATUSES,
  AI_DOMAIN_SCOPES,
  AI_READINESS_VERDICTS,
  PRODUCT_AI_FOUNDATION_BASE,
  PRODUCT_AI_FOUNDATION_FREEZE_VERSION,
  PRODUCT_AI_FOUNDATION_ID,
  PRODUCT_AI_FOUNDATION_VERSION,
  PRODUCT_AI_FREEZE_TAG,
} from "./foundation/ai.constants";

export type {
  AiCapability,
  AiCapabilityKind,
  AiCapabilityStatus,
  AiDomainScope,
  AiFoundationManifest,
  AiMetadata,
  AiReadinessCheck,
  AiReadinessResult,
  AiReadinessVerdict,
  RegisterAiCapabilityInput,
  UpdateAiCapabilityStatusInput,
} from "./foundation/ai.types";

export {
  getAiFoundationMetadata,
  isAiFoundationMetadataIntact,
  PRODUCT_AI_FOUNDATION_METADATA,
  type AiFoundationMetadata,
} from "./foundation/ai.metadata";

export {
  clearAiCapabilities,
  getAiCapability,
  listAiCapabilities,
  registerAiCapability,
  updateAiCapabilityStatus,
} from "./foundation/ai.registry";

export {
  assertAiFoundationReadinessReady,
  buildAiFoundationManifest,
  evaluateAiFoundationReadiness,
} from "./foundation/ai.manifest";

export {
  assertProductAiFoundationReleaseGatePass,
  checkProductAiFoundationReleaseGate,
  PRODUCT_AI_FOUNDATION_SIGNOFF_VERSION,
} from "./verify/ai.foundation.gate";

export {
  AI_MODEL_BINDING_STATUSES,
  AI_MODEL_FAMILIES,
  AI_MODEL_READINESS_VERDICTS,
  AI_MODEL_STATUSES,
  AI_MODEL_VERSION_STATUSES,
  PRODUCT_AI_MODEL_FREEZE_TAG,
  PRODUCT_AI_MODEL_REGISTRY_BASE,
  PRODUCT_AI_MODEL_REGISTRY_FREEZE_VERSION,
  PRODUCT_AI_MODEL_REGISTRY_ID,
  PRODUCT_AI_MODEL_REGISTRY_VERSION,
} from "./model/model.constants";

export type {
  AiModelBindingStatus,
  AiModelCapabilityBinding,
  AiModelFamily,
  AiModelMetadata,
  AiModelReadinessCheck,
  AiModelReadinessResult,
  AiModelReadinessVerdict,
  AiModelRegistryManifest,
  AiModelStatus,
  AiModelVersion,
  AiModelVersionStatus,
  BindAiModelCapabilityInput,
  ProductAiModel,
  RegisterAiModelInput,
  RegisterAiModelVersionInput,
  UpdateAiModelStatusInput,
  UpdateAiModelVersionStatusInput,
} from "./model/model.types";

export {
  getAiModelRegistryMetadata,
  isAiModelRegistryMetadataIntact,
  PRODUCT_AI_MODEL_REGISTRY_METADATA,
  type AiModelRegistryMetadata,
} from "./model/model.metadata";

export {
  clearAiModels,
  getAiModel,
  listAiModels,
  registerAiModel,
  updateAiModelStatus,
} from "./model/model.registry";

export {
  clearAiModelVersions,
  getAiModelVersion,
  listAiModelVersions,
  registerAiModelVersion,
  updateAiModelVersionStatus,
} from "./model/version.registry";

export {
  bindAiModelCapability,
  clearAiModelCapabilityBindings,
  getAiModelCapabilityBinding,
  listAiModelCapabilityBindings,
} from "./model/binding.registry";

export {
  assertAiModelRegistryReadinessReady,
  buildAiModelRegistryManifest,
  clearAiModelRegistryLayer,
  evaluateAiModelRegistryReadiness,
} from "./model/model.manifest";

export {
  assertProductAiModelRegistryReleaseGatePass,
  checkProductAiModelRegistryReleaseGate,
  PRODUCT_AI_MODEL_SIGNOFF_VERSION,
} from "./verify/ai.model.gate";

export {
  AI_PROMPT_BINDING_STATUSES,
  AI_PROMPT_KINDS,
  AI_PROMPT_READINESS_VERDICTS,
  AI_PROMPT_STATUSES,
  AI_PROMPT_VERSION_STATUSES,
  PRODUCT_AI_PROMPT_ENGINE_BASE,
  PRODUCT_AI_PROMPT_ENGINE_FREEZE_VERSION,
  PRODUCT_AI_PROMPT_ENGINE_ID,
  PRODUCT_AI_PROMPT_ENGINE_VERSION,
  PRODUCT_AI_PROMPT_FREEZE_TAG,
} from "./prompt-engine/prompt.constants";

export type {
  AiPromptBindingStatus,
  AiPromptEngineManifest,
  AiPromptKind,
  AiPromptMetadata,
  AiPromptModelBinding,
  AiPromptReadinessCheck,
  AiPromptReadinessResult,
  AiPromptReadinessVerdict,
  AiPromptStatus,
  AiPromptVersion,
  AiPromptVersionStatus,
  BindAiPromptModelInput,
  ProductAiPrompt,
  RegisterAiPromptInput,
  RegisterAiPromptVersionInput,
  UpdateAiPromptStatusInput,
  UpdateAiPromptVersionStatusInput,
} from "./prompt-engine/prompt.types";

export {
  getAiPromptEngineMetadata,
  isAiPromptEngineMetadataIntact,
  PRODUCT_AI_PROMPT_ENGINE_METADATA,
  type AiPromptEngineMetadata,
} from "./prompt-engine/prompt.metadata";

export {
  clearAiPrompts,
  getAiPrompt,
  listAiPrompts,
  registerAiPrompt,
  updateAiPromptStatus,
} from "./prompt-engine/prompt.registry";

export {
  clearAiPromptVersions,
  getAiPromptVersion,
  listAiPromptVersions,
  registerAiPromptVersion,
  updateAiPromptVersionStatus,
} from "./prompt-engine/version.registry";

export {
  bindAiPromptModel,
  clearAiPromptModelBindings,
  getAiPromptModelBinding,
  listAiPromptModelBindings,
} from "./prompt-engine/binding.registry";

export {
  assertAiPromptEngineReadinessReady,
  buildAiPromptEngineManifest,
  clearAiPromptEngineLayer,
  evaluateAiPromptEngineReadiness,
} from "./prompt-engine/prompt.manifest";

export {
  assertProductAiPromptEngineReleaseGatePass,
  checkProductAiPromptEngineReleaseGate,
  PRODUCT_AI_PROMPT_SIGNOFF_VERSION,
} from "./verify/ai.prompt.gate";

export {
  AI_WORKFLOW_KINDS,
  AI_WORKFLOW_READINESS_VERDICTS,
  AI_WORKFLOW_STATUSES,
  AI_WORKFLOW_STEP_KINDS,
  AI_WORKFLOW_VERSION_STATUSES,
  PRODUCT_AI_WORKFLOW_ENGINE_BASE,
  PRODUCT_AI_WORKFLOW_ENGINE_FREEZE_VERSION,
  PRODUCT_AI_WORKFLOW_ENGINE_ID,
  PRODUCT_AI_WORKFLOW_ENGINE_VERSION,
  PRODUCT_AI_WORKFLOW_FREEZE_TAG,
} from "./workflow-engine/workflow.constants";

export type {
  AiWorkflowEngineManifest,
  AiWorkflowKind,
  AiWorkflowMetadata,
  AiWorkflowReadinessCheck,
  AiWorkflowReadinessResult,
  AiWorkflowReadinessVerdict,
  AiWorkflowStatus,
  AiWorkflowStep,
  AiWorkflowStepKind,
  AiWorkflowVersion,
  AiWorkflowVersionStatus,
  ProductAiWorkflow,
  RegisterAiWorkflowInput,
  RegisterAiWorkflowStepInput,
  RegisterAiWorkflowVersionInput,
  UpdateAiWorkflowStatusInput,
  UpdateAiWorkflowVersionStatusInput,
} from "./workflow-engine/workflow.types";

export {
  getAiWorkflowEngineMetadata,
  isAiWorkflowEngineMetadataIntact,
  PRODUCT_AI_WORKFLOW_ENGINE_METADATA,
  type AiWorkflowEngineMetadata,
} from "./workflow-engine/workflow.metadata";

export {
  clearAiWorkflows,
  getAiWorkflow,
  listAiWorkflows,
  registerAiWorkflow,
  updateAiWorkflowStatus,
} from "./workflow-engine/workflow.registry";

export {
  clearAiWorkflowVersions,
  getAiWorkflowVersion,
  listAiWorkflowVersions,
  registerAiWorkflowVersion,
  updateAiWorkflowVersionStatus,
} from "./workflow-engine/version.registry";

export {
  clearAiWorkflowSteps,
  getAiWorkflowStep,
  listAiWorkflowSteps,
  registerAiWorkflowStep,
} from "./workflow-engine/step.registry";

export {
  assertAiWorkflowEngineReadinessReady,
  buildAiWorkflowEngineManifest,
  clearAiWorkflowEngineLayer,
  evaluateAiWorkflowEngineReadiness,
} from "./workflow-engine/workflow.manifest";

export {
  assertProductAiWorkflowEngineReleaseGatePass,
  checkProductAiWorkflowEngineReleaseGate,
  PRODUCT_AI_WORKFLOW_SIGNOFF_VERSION,
} from "./verify/ai.workflow.gate";

export {
  AI_ORCHESTRATION_KINDS,
  AI_ORCHESTRATION_READINESS_VERDICTS,
  AI_ORCHESTRATION_ROUTE_KINDS,
  AI_ORCHESTRATION_STATUSES,
  AI_ORCHESTRATION_VERSION_STATUSES,
  PRODUCT_AI_ORCHESTRATION_BASE,
  PRODUCT_AI_ORCHESTRATION_FREEZE_TAG,
  PRODUCT_AI_ORCHESTRATION_FREEZE_VERSION,
  PRODUCT_AI_ORCHESTRATION_ID,
  PRODUCT_AI_ORCHESTRATION_VERSION,
} from "./orchestration/orchestration.constants";

export type {
  AiOrchestrationKind,
  AiOrchestrationManifest,
  AiOrchestrationMetadata,
  AiOrchestrationReadinessCheck,
  AiOrchestrationReadinessResult,
  AiOrchestrationReadinessVerdict,
  AiOrchestrationRoute,
  AiOrchestrationRouteKind,
  AiOrchestrationStatus,
  AiOrchestrationVersion,
  AiOrchestrationVersionStatus,
  ProductAiOrchestration,
  RegisterAiOrchestrationInput,
  RegisterAiOrchestrationRouteInput,
  RegisterAiOrchestrationVersionInput,
  UpdateAiOrchestrationStatusInput,
  UpdateAiOrchestrationVersionStatusInput,
} from "./orchestration/orchestration.types";

export {
  getAiOrchestrationMetadata,
  isAiOrchestrationMetadataIntact,
  PRODUCT_AI_ORCHESTRATION_METADATA,
  type AiOrchestrationMetadataRecord,
} from "./orchestration/orchestration.metadata";

export {
  clearAiOrchestrations,
  getAiOrchestration,
  listAiOrchestrations,
  registerAiOrchestration,
  updateAiOrchestrationStatus,
} from "./orchestration/orchestration.registry";

export {
  clearAiOrchestrationVersions,
  getAiOrchestrationVersion,
  listAiOrchestrationVersions,
  registerAiOrchestrationVersion,
  updateAiOrchestrationVersionStatus,
} from "./orchestration/version.registry";

export {
  clearAiOrchestrationRoutes,
  getAiOrchestrationRoute,
  listAiOrchestrationRoutes,
  registerAiOrchestrationRoute,
} from "./orchestration/route.registry";

export {
  assertAiOrchestrationReadinessReady,
  buildAiOrchestrationManifest,
  clearAiOrchestrationLayer,
  evaluateAiOrchestrationReadiness,
} from "./orchestration/orchestration.manifest";

export {
  assertProductAiOrchestrationReleaseGatePass,
  checkProductAiOrchestrationReleaseGate,
  PRODUCT_AI_ORCHESTRATION_SIGNOFF_VERSION,
} from "./verify/ai.orchestration.gate";

export {
  AI_GOVERNANCE_COMPLIANCE_VERDICTS,
  AI_GOVERNANCE_POLICY_KINDS,
  AI_GOVERNANCE_POLICY_STATUSES,
  AI_GOVERNANCE_READINESS_VERDICTS,
  AI_GOVERNANCE_REVIEW_VERDICTS,
  AI_GOVERNANCE_STANDARD_LEVELS,
  PRODUCT_AI_GOVERNANCE_BASE,
  PRODUCT_AI_GOVERNANCE_FREEZE_TAG,
  PRODUCT_AI_GOVERNANCE_FREEZE_VERSION,
  PRODUCT_AI_GOVERNANCE_ID,
  PRODUCT_AI_GOVERNANCE_VERSION,
} from "./governance/governance.constants";

export type {
  AiGovernanceCompliance,
  AiGovernanceComplianceVerdict,
  AiGovernanceManifest,
  AiGovernanceMetadata,
  AiGovernancePolicy,
  AiGovernancePolicyKind,
  AiGovernancePolicyStatus,
  AiGovernanceReadinessCheck,
  AiGovernanceReadinessResult,
  AiGovernanceReadinessVerdict,
  AiGovernanceReview,
  AiGovernanceReviewVerdict,
  AiGovernanceStandard,
  AiGovernanceStandardLevel,
  RecordAiGovernanceComplianceInput,
  RecordAiGovernanceReviewInput,
  RegisterAiGovernancePolicyInput,
  RegisterAiGovernanceStandardInput,
  UpdateAiGovernancePolicyStatusInput,
} from "./governance/governance.types";

export {
  getAiGovernanceMetadata,
  isAiGovernanceMetadataIntact,
  PRODUCT_AI_GOVERNANCE_METADATA,
  type AiGovernanceMetadataRecord,
} from "./governance/governance.metadata";

export {
  clearAiGovernancePolicies,
  getAiGovernancePolicy,
  listAiGovernancePolicies,
  registerAiGovernancePolicy,
  updateAiGovernancePolicyStatus,
} from "./governance/policy.registry";

export {
  clearAiGovernanceStandards,
  getAiGovernanceStandard,
  listAiGovernanceStandards,
  registerAiGovernanceStandard,
} from "./governance/standard.registry";

export {
  clearAiGovernanceReviews,
  getAiGovernanceReview,
  listAiGovernanceReviews,
  recordAiGovernanceReview,
} from "./governance/review.registry";

export {
  clearAiGovernanceCompliances,
  getAiGovernanceCompliance,
  listAiGovernanceCompliances,
  recordAiGovernanceCompliance,
} from "./governance/compliance.registry";

export {
  assertAiGovernanceReadinessReady,
  buildAiGovernanceManifest,
  clearAiGovernanceLayer,
  evaluateAiGovernanceReadiness,
} from "./governance/governance.manifest";

export {
  assertProductAiGovernanceReleaseGatePass,
  checkProductAiGovernanceReleaseGate,
  PRODUCT_AI_GOVERNANCE_SIGNOFF_VERSION,
} from "./verify/ai.governance.gate";

export {
  AI_AUDIT_EVENT_KINDS,
  AI_AUDIT_INTEGRITY_RESULTS,
  AI_AUDIT_READINESS_VERDICTS,
  AI_AUDIT_SEVERITIES,
  AI_AUDIT_TRAIL_STATUSES,
  PRODUCT_AI_AUDIT_BASE,
  PRODUCT_AI_AUDIT_FREEZE_TAG,
  PRODUCT_AI_AUDIT_FREEZE_VERSION,
  PRODUCT_AI_AUDIT_ID,
  PRODUCT_AI_AUDIT_VERSION,
} from "./audit/audit.constants";

export type {
  AiAuditEvent,
  AiAuditEventKind,
  AiAuditIntegrityResult,
  AiAuditManifest,
  AiAuditMetadata,
  AiAuditQuery,
  AiAuditReadinessCheck,
  AiAuditReadinessResult,
  AiAuditReadinessVerdict,
  AiAuditSeal,
  AiAuditSeverity,
  AiAuditTrail,
  AiAuditTrailStatus,
  AppendAiAuditTrailInput,
  MarkAiAuditTrailStatusInput,
  QueryAiAuditTrailInput,
  RecordAiAuditEventInput,
  SealAiAuditTrailInput,
  VerifyAiAuditSealInput,
} from "./audit/audit.types";

export {
  getAiAuditMetadata,
  isAiAuditMetadataIntact,
  PRODUCT_AI_AUDIT_METADATA,
  type AiAuditMetadataRecord,
} from "./audit/audit.metadata";

export {
  clearAiAuditEvents,
  getAiAuditEvent,
  listAiAuditEvents,
  recordAiAuditEvent,
} from "./audit/event.registry";

export {
  appendAiAuditTrail,
  clearAiAuditTrails,
  getAiAuditTrail,
  listAiAuditTrails,
  markAiAuditTrailStatus,
} from "./audit/trail.registry";

export {
  clearAiAuditSeals,
  getAiAuditSeal,
  listAiAuditSeals,
  sealAiAuditTrail,
  verifyAiAuditSeal,
} from "./audit/integrity.registry";

export {
  clearAiAuditQueries,
  getAiAuditQuery,
  listAiAuditQueries,
  queryAiAuditTrail,
} from "./audit/query.registry";

export {
  assertAiAuditReadinessReady,
  buildAiAuditManifest,
  clearAiAuditLayer,
  evaluateAiAuditReadiness,
} from "./audit/audit.manifest";

export {
  assertProductAiAuditReleaseGatePass,
  checkProductAiAuditReleaseGate,
  PRODUCT_AI_AUDIT_SIGNOFF_VERSION,
} from "./verify/ai.audit.gate";

export {
  ENTERPRISE_PRODUCT_AI_BASELINE_ID,
  isProductAiFreezeLockIntact,
  PRODUCT_AI_BASELINE_FREEZE_BASE,
  PRODUCT_AI_BASELINE_FREEZE_VERSION,
  PRODUCT_AI_BASELINE_ID,
  PRODUCT_AI_COMPONENT_LOCK,
  PRODUCT_AI_FREEZE_LOCK,
  PRODUCT_AI_PHASE_VERSIONS,
  PRODUCT_AI_SIGNOFF_VERSION,
  type ProductAiComponentId,
  type ProductAiComponentLock,
  type ProductAiFreezeLock,
  type ProductAiPhaseVersions,
} from "./baseline/freeze/freeze.lock";

export {
  isProductAiImmutableManifestIntact,
  PRODUCT_AI_IMMUTABLE_MANIFEST,
  type ProductAiImmutableManifest,
} from "./baseline/freeze/immutable.manifest";

export {
  isProductAiRollbackSnapshotIntact,
  PRODUCT_AI_ROLLBACK_SNAPSHOT,
  type ProductAiRollbackSnapshot,
} from "./baseline/freeze/rollback.snapshot";

export {
  assertProductAiBaselineReleaseGatePass,
  checkProductAiBaselineReleaseGate,
  PRODUCT_AI_BASELINE_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/ai.baseline.gate";
