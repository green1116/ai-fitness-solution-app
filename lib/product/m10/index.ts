/**
 * Product M10 — Enterprise AI Runtime public exports
 * Isolated namespace: lib/product/m10
 */

export {
  AI_RUNTIME_CAPABILITY_KINDS,
  AI_RUNTIME_CAPABILITY_STATUSES,
  AI_RUNTIME_DOMAIN_SCOPES,
  AI_RUNTIME_READINESS_VERDICTS,
  PRODUCT_AI_RUNTIME_FOUNDATION_BASE,
  PRODUCT_AI_RUNTIME_FOUNDATION_FREEZE_VERSION,
  PRODUCT_AI_RUNTIME_FOUNDATION_ID,
  PRODUCT_AI_RUNTIME_FOUNDATION_VERSION,
  PRODUCT_AI_RUNTIME_FREEZE_TAG,
} from "./foundation/runtime.constants";

export type {
  AiRuntimeCapability,
  AiRuntimeCapabilityKind,
  AiRuntimeCapabilityStatus,
  AiRuntimeDomainScope,
  AiRuntimeFoundationManifest,
  AiRuntimeMetadata,
  AiRuntimeReadinessCheck,
  AiRuntimeReadinessResult,
  AiRuntimeReadinessVerdict,
  RegisterAiRuntimeCapabilityInput,
  UpdateAiRuntimeCapabilityStatusInput,
} from "./foundation/runtime.types";

export {
  getAiRuntimeFoundationMetadata,
  isAiRuntimeFoundationMetadataIntact,
  PRODUCT_AI_RUNTIME_FOUNDATION_METADATA,
  type AiRuntimeFoundationMetadata,
} from "./foundation/runtime.metadata";

export {
  clearAiRuntimeCapabilities,
  getAiRuntimeCapability,
  listAiRuntimeCapabilities,
  registerAiRuntimeCapability,
  updateAiRuntimeCapabilityStatus,
} from "./foundation/runtime.registry";

export {
  assertAiRuntimeFoundationReadinessReady,
  buildAiRuntimeFoundationManifest,
  evaluateAiRuntimeFoundationReadiness,
} from "./foundation/runtime.manifest";

export {
  assertProductAiRuntimeFoundationReleaseGatePass,
  checkProductAiRuntimeFoundationReleaseGate,
  PRODUCT_AI_RUNTIME_FOUNDATION_SIGNOFF_VERSION,
} from "./verify/runtime.foundation.gate";

export {
  AI_JOB_BINDING_STATUSES,
  AI_JOB_KINDS,
  AI_JOB_READINESS_VERDICTS,
  AI_JOB_STATUSES,
  AI_JOB_STEP_STATUSES,
  PRODUCT_AI_JOB_RUNTIME_BASE,
  PRODUCT_AI_JOB_RUNTIME_FREEZE_TAG,
  PRODUCT_AI_JOB_RUNTIME_FREEZE_VERSION,
  PRODUCT_AI_JOB_RUNTIME_ID,
  PRODUCT_AI_JOB_RUNTIME_VERSION,
} from "./job-runtime/job.constants";

export type {
  AiJobBindingStatus,
  AiJobCapabilityBinding,
  AiJobDefinition,
  AiJobKind,
  AiJobMetadata,
  AiJobReadinessCheck,
  AiJobReadinessResult,
  AiJobReadinessVerdict,
  AiJobRuntimeManifest,
  AiJobStatus,
  AiJobStep,
  AiJobStepStatus,
  BindAiJobCapabilityInput,
  RegisterAiJobInput,
  RegisterAiJobStepInput,
  UpdateAiJobStatusInput,
  UpdateAiJobStepStatusInput,
} from "./job-runtime/job.types";

export {
  getAiJobRuntimeMetadata,
  isAiJobRuntimeMetadataIntact,
  PRODUCT_AI_JOB_RUNTIME_METADATA,
  type AiJobRuntimeMetadata,
} from "./job-runtime/job.metadata";

export {
  clearAiJobs,
  getAiJob,
  listAiJobs,
  registerAiJob,
  updateAiJobStatus,
} from "./job-runtime/job.registry";

export {
  clearAiJobSteps,
  getAiJobStep,
  listAiJobSteps,
  registerAiJobStep,
  updateAiJobStepStatus,
} from "./job-runtime/step.registry";

export {
  bindAiJobCapability,
  clearAiJobCapabilityBindings,
  getAiJobCapabilityBinding,
  listAiJobCapabilityBindings,
} from "./job-runtime/binding.registry";

export {
  assertAiJobRuntimeReadinessReady,
  buildAiJobRuntimeManifest,
  clearAiJobRuntimeLayer,
  evaluateAiJobRuntimeReadiness,
} from "./job-runtime/job.manifest";

export {
  assertProductAiJobRuntimeReleaseGatePass,
  checkProductAiJobRuntimeReleaseGate,
  PRODUCT_AI_JOB_RUNTIME_SIGNOFF_VERSION,
} from "./verify/job.runtime.gate";

export {
  AI_QUEUE_BINDING_STATUSES,
  AI_QUEUE_CHANNEL_STATUSES,
  AI_QUEUE_KINDS,
  AI_QUEUE_READINESS_VERDICTS,
  AI_QUEUE_STATUSES,
  PRODUCT_AI_QUEUE_RUNTIME_BASE,
  PRODUCT_AI_QUEUE_RUNTIME_FREEZE_TAG,
  PRODUCT_AI_QUEUE_RUNTIME_FREEZE_VERSION,
  PRODUCT_AI_QUEUE_RUNTIME_ID,
  PRODUCT_AI_QUEUE_RUNTIME_VERSION,
} from "./queue-runtime/queue.constants";

export type {
  AiQueueBindingStatus,
  AiQueueChannel,
  AiQueueChannelStatus,
  AiQueueDefinition,
  AiQueueJobBinding,
  AiQueueKind,
  AiQueueMetadata,
  AiQueueReadinessCheck,
  AiQueueReadinessResult,
  AiQueueReadinessVerdict,
  AiQueueRuntimeManifest,
  AiQueueStatus,
  BindAiQueueJobInput,
  RegisterAiQueueChannelInput,
  RegisterAiQueueInput,
  UpdateAiQueueChannelStatusInput,
  UpdateAiQueueStatusInput,
} from "./queue-runtime/queue.types";

export {
  getAiQueueRuntimeMetadata,
  isAiQueueRuntimeMetadataIntact,
  PRODUCT_AI_QUEUE_RUNTIME_METADATA,
  type AiQueueRuntimeMetadata,
} from "./queue-runtime/queue.metadata";

export {
  clearAiQueues,
  getAiQueue,
  listAiQueues,
  registerAiQueue,
  updateAiQueueStatus,
} from "./queue-runtime/queue.registry";

export {
  clearAiQueueChannels,
  getAiQueueChannel,
  listAiQueueChannels,
  registerAiQueueChannel,
  updateAiQueueChannelStatus,
} from "./queue-runtime/channel.registry";

export {
  bindAiQueueJob,
  clearAiQueueJobBindings,
  getAiQueueJobBinding,
  listAiQueueJobBindings,
} from "./queue-runtime/binding.registry";

export {
  assertAiQueueRuntimeReadinessReady,
  buildAiQueueRuntimeManifest,
  clearAiQueueRuntimeLayer,
  evaluateAiQueueRuntimeReadiness,
} from "./queue-runtime/queue.manifest";

export {
  assertProductAiQueueRuntimeReleaseGatePass,
  checkProductAiQueueRuntimeReleaseGate,
  PRODUCT_AI_QUEUE_RUNTIME_SIGNOFF_VERSION,
} from "./verify/queue.runtime.gate";

export {
  AI_SCHEDULE_BINDING_STATUSES,
  AI_SCHEDULE_KINDS,
  AI_SCHEDULE_READINESS_VERDICTS,
  AI_SCHEDULE_STATUSES,
  AI_SCHEDULE_TRIGGER_STATUSES,
  PRODUCT_AI_SCHEDULER_BASE,
  PRODUCT_AI_SCHEDULER_FREEZE_TAG,
  PRODUCT_AI_SCHEDULER_FREEZE_VERSION,
  PRODUCT_AI_SCHEDULER_ID,
  PRODUCT_AI_SCHEDULER_VERSION,
} from "./scheduler/scheduler.constants";

export type {
  AiScheduleBindingStatus,
  AiScheduleDefinition,
  AiScheduleKind,
  AiScheduleMetadata,
  AiScheduleQueueBinding,
  AiScheduleReadinessCheck,
  AiScheduleReadinessResult,
  AiScheduleReadinessVerdict,
  AiSchedulerManifest,
  AiScheduleStatus,
  AiScheduleTrigger,
  AiScheduleTriggerStatus,
  BindAiScheduleQueueInput,
  RegisterAiScheduleInput,
  RegisterAiScheduleTriggerInput,
  UpdateAiScheduleStatusInput,
  UpdateAiScheduleTriggerStatusInput,
} from "./scheduler/scheduler.types";

export {
  getAiSchedulerMetadata,
  isAiSchedulerMetadataIntact,
  PRODUCT_AI_SCHEDULER_METADATA,
  type AiSchedulerMetadata,
} from "./scheduler/scheduler.metadata";

export {
  clearAiSchedules,
  getAiSchedule,
  listAiSchedules,
  registerAiSchedule,
  updateAiScheduleStatus,
} from "./scheduler/schedule.registry";

export {
  clearAiScheduleTriggers,
  getAiScheduleTrigger,
  listAiScheduleTriggers,
  registerAiScheduleTrigger,
  updateAiScheduleTriggerStatus,
} from "./scheduler/trigger.registry";

export {
  bindAiScheduleQueue,
  clearAiScheduleQueueBindings,
  getAiScheduleQueueBinding,
  listAiScheduleQueueBindings,
} from "./scheduler/binding.registry";

export {
  assertAiSchedulerReadinessReady,
  buildAiSchedulerManifest,
  clearAiSchedulerLayer,
  evaluateAiSchedulerReadiness,
} from "./scheduler/scheduler.manifest";

export {
  assertProductAiSchedulerReleaseGatePass,
  checkProductAiSchedulerReleaseGate,
  PRODUCT_AI_SCHEDULER_SIGNOFF_VERSION,
} from "./verify/scheduler.gate";

export {
  AI_RESOURCE_BINDING_STATUSES,
  AI_RESOURCE_KINDS,
  AI_RESOURCE_QUOTA_STATUSES,
  AI_RESOURCE_READINESS_VERDICTS,
  AI_RESOURCE_STATUSES,
  PRODUCT_AI_RESOURCE_MANAGER_BASE,
  PRODUCT_AI_RESOURCE_MANAGER_FREEZE_TAG,
  PRODUCT_AI_RESOURCE_MANAGER_FREEZE_VERSION,
  PRODUCT_AI_RESOURCE_MANAGER_ID,
  PRODUCT_AI_RESOURCE_MANAGER_VERSION,
} from "./resource-manager/resource.constants";

export type {
  AiResourceBindingStatus,
  AiResourceDefinition,
  AiResourceKind,
  AiResourceManagerManifest,
  AiResourceMetadata,
  AiResourceQuota,
  AiResourceQuotaStatus,
  AiResourceReadinessCheck,
  AiResourceReadinessResult,
  AiResourceReadinessVerdict,
  AiResourceScheduleBinding,
  AiResourceStatus,
  BindAiResourceScheduleInput,
  RegisterAiResourceInput,
  RegisterAiResourceQuotaInput,
  UpdateAiResourceQuotaStatusInput,
  UpdateAiResourceStatusInput,
} from "./resource-manager/resource.types";

export {
  getAiResourceManagerMetadata,
  isAiResourceManagerMetadataIntact,
  PRODUCT_AI_RESOURCE_MANAGER_METADATA,
  type AiResourceManagerMetadata,
} from "./resource-manager/resource.metadata";

export {
  clearAiResources,
  getAiResource,
  listAiResources,
  registerAiResource,
  updateAiResourceStatus,
} from "./resource-manager/resource.registry";

export {
  clearAiResourceQuotas,
  getAiResourceQuota,
  listAiResourceQuotas,
  registerAiResourceQuota,
  updateAiResourceQuotaStatus,
} from "./resource-manager/quota.registry";

export {
  bindAiResourceSchedule,
  clearAiResourceScheduleBindings,
  getAiResourceScheduleBinding,
  listAiResourceScheduleBindings,
} from "./resource-manager/binding.registry";

export {
  assertAiResourceManagerReadinessReady,
  buildAiResourceManagerManifest,
  clearAiResourceManagerLayer,
  evaluateAiResourceManagerReadiness,
} from "./resource-manager/resource.manifest";

export {
  assertProductAiResourceManagerReleaseGatePass,
  checkProductAiResourceManagerReleaseGate,
  PRODUCT_AI_RESOURCE_MANAGER_SIGNOFF_VERSION,
} from "./verify/resource.manager.gate";

export {
  AI_RUNTIME_GOVERNANCE_COMPLIANCE_VERDICTS,
  AI_RUNTIME_GOVERNANCE_POLICY_KINDS,
  AI_RUNTIME_GOVERNANCE_POLICY_STATUSES,
  AI_RUNTIME_GOVERNANCE_READINESS_VERDICTS,
  AI_RUNTIME_GOVERNANCE_REVIEW_VERDICTS,
  AI_RUNTIME_GOVERNANCE_STANDARD_LEVELS,
  PRODUCT_AI_RUNTIME_GOVERNANCE_BASE,
  PRODUCT_AI_RUNTIME_GOVERNANCE_FREEZE_TAG,
  PRODUCT_AI_RUNTIME_GOVERNANCE_FREEZE_VERSION,
  PRODUCT_AI_RUNTIME_GOVERNANCE_ID,
  PRODUCT_AI_RUNTIME_GOVERNANCE_VERSION,
} from "./runtime-governance/governance.constants";

export type {
  AiRuntimeGovernanceCompliance,
  AiRuntimeGovernanceComplianceVerdict,
  AiRuntimeGovernanceManifest,
  AiRuntimeGovernanceMetadata,
  AiRuntimeGovernancePolicy,
  AiRuntimeGovernancePolicyKind,
  AiRuntimeGovernancePolicyStatus,
  AiRuntimeGovernanceReadinessCheck,
  AiRuntimeGovernanceReadinessResult,
  AiRuntimeGovernanceReadinessVerdict,
  AiRuntimeGovernanceReview,
  AiRuntimeGovernanceReviewVerdict,
  AiRuntimeGovernanceStandard,
  AiRuntimeGovernanceStandardLevel,
  RecordAiRuntimeGovernanceComplianceInput,
  RecordAiRuntimeGovernanceReviewInput,
  RegisterAiRuntimeGovernancePolicyInput,
  RegisterAiRuntimeGovernanceStandardInput,
  UpdateAiRuntimeGovernancePolicyStatusInput,
} from "./runtime-governance/governance.types";

export {
  getAiRuntimeGovernanceMetadata,
  isAiRuntimeGovernanceMetadataIntact,
  PRODUCT_AI_RUNTIME_GOVERNANCE_METADATA,
  type AiRuntimeGovernanceMetadataRecord,
} from "./runtime-governance/governance.metadata";

export {
  clearAiRuntimeGovernancePolicies,
  getAiRuntimeGovernancePolicy,
  listAiRuntimeGovernancePolicies,
  registerAiRuntimeGovernancePolicy,
  updateAiRuntimeGovernancePolicyStatus,
} from "./runtime-governance/policy.registry";

export {
  clearAiRuntimeGovernanceStandards,
  getAiRuntimeGovernanceStandard,
  listAiRuntimeGovernanceStandards,
  registerAiRuntimeGovernanceStandard,
} from "./runtime-governance/standard.registry";

export {
  clearAiRuntimeGovernanceReviews,
  getAiRuntimeGovernanceReview,
  listAiRuntimeGovernanceReviews,
  recordAiRuntimeGovernanceReview,
} from "./runtime-governance/review.registry";

export {
  clearAiRuntimeGovernanceCompliances,
  getAiRuntimeGovernanceCompliance,
  listAiRuntimeGovernanceCompliances,
  recordAiRuntimeGovernanceCompliance,
} from "./runtime-governance/compliance.registry";

export {
  assertAiRuntimeGovernanceReadinessReady,
  buildAiRuntimeGovernanceManifest,
  clearAiRuntimeGovernanceLayer,
  evaluateAiRuntimeGovernanceReadiness,
} from "./runtime-governance/governance.manifest";

export {
  assertProductAiRuntimeGovernanceReleaseGatePass,
  checkProductAiRuntimeGovernanceReleaseGate,
  PRODUCT_AI_RUNTIME_GOVERNANCE_SIGNOFF_VERSION,
} from "./verify/runtime.governance.gate";

export {
  AI_RUNTIME_AUDIT_EVENT_KINDS,
  AI_RUNTIME_AUDIT_INTEGRITY_RESULTS,
  AI_RUNTIME_AUDIT_READINESS_VERDICTS,
  AI_RUNTIME_AUDIT_SEVERITIES,
  AI_RUNTIME_AUDIT_TRAIL_STATUSES,
  PRODUCT_AI_RUNTIME_AUDIT_BASE,
  PRODUCT_AI_RUNTIME_AUDIT_FREEZE_TAG,
  PRODUCT_AI_RUNTIME_AUDIT_FREEZE_VERSION,
  PRODUCT_AI_RUNTIME_AUDIT_ID,
  PRODUCT_AI_RUNTIME_AUDIT_VERSION,
} from "./runtime-audit/audit.constants";

export type {
  AiRuntimeAuditEvent,
  AiRuntimeAuditEventKind,
  AiRuntimeAuditIntegrityResult,
  AiRuntimeAuditManifest,
  AiRuntimeAuditMetadata,
  AiRuntimeAuditQuery,
  AiRuntimeAuditReadinessCheck,
  AiRuntimeAuditReadinessResult,
  AiRuntimeAuditReadinessVerdict,
  AiRuntimeAuditSeal,
  AiRuntimeAuditSeverity,
  AiRuntimeAuditTrail,
  AiRuntimeAuditTrailStatus,
  AppendAiRuntimeAuditTrailInput,
  MarkAiRuntimeAuditTrailStatusInput,
  QueryAiRuntimeAuditTrailInput,
  RecordAiRuntimeAuditEventInput,
  SealAiRuntimeAuditTrailInput,
  VerifyAiRuntimeAuditSealInput,
} from "./runtime-audit/audit.types";

export {
  getAiRuntimeAuditMetadata,
  isAiRuntimeAuditMetadataIntact,
  PRODUCT_AI_RUNTIME_AUDIT_METADATA,
  type AiRuntimeAuditMetadataRecord,
} from "./runtime-audit/audit.metadata";

export {
  clearAiRuntimeAuditEvents,
  getAiRuntimeAuditEvent,
  listAiRuntimeAuditEvents,
  recordAiRuntimeAuditEvent,
} from "./runtime-audit/event.registry";

export {
  appendAiRuntimeAuditTrail,
  clearAiRuntimeAuditTrails,
  getAiRuntimeAuditTrail,
  listAiRuntimeAuditTrails,
  markAiRuntimeAuditTrailStatus,
} from "./runtime-audit/trail.registry";

export {
  clearAiRuntimeAuditSeals,
  getAiRuntimeAuditSeal,
  listAiRuntimeAuditSeals,
  sealAiRuntimeAuditTrail,
  verifyAiRuntimeAuditSeal,
} from "./runtime-audit/integrity.registry";

export {
  clearAiRuntimeAuditQueries,
  getAiRuntimeAuditQuery,
  listAiRuntimeAuditQueries,
  queryAiRuntimeAuditTrail,
} from "./runtime-audit/query.registry";

export {
  assertAiRuntimeAuditReadinessReady,
  buildAiRuntimeAuditManifest,
  clearAiRuntimeAuditLayer,
  evaluateAiRuntimeAuditReadiness,
} from "./runtime-audit/audit.manifest";

export {
  assertProductAiRuntimeAuditReleaseGatePass,
  checkProductAiRuntimeAuditReleaseGate,
  PRODUCT_AI_RUNTIME_AUDIT_SIGNOFF_VERSION,
} from "./verify/runtime.audit.gate";

export {
  ENTERPRISE_PRODUCT_AI_RUNTIME_BASELINE_ID,
  isProductAiRuntimeFreezeLockIntact,
  PRODUCT_AI_RUNTIME_BASELINE_FREEZE_BASE,
  PRODUCT_AI_RUNTIME_BASELINE_FREEZE_VERSION,
  PRODUCT_AI_RUNTIME_BASELINE_ID,
  PRODUCT_AI_RUNTIME_COMPONENT_LOCK,
  PRODUCT_AI_RUNTIME_FREEZE_LOCK,
  PRODUCT_AI_RUNTIME_PHASE_VERSIONS,
  PRODUCT_AI_RUNTIME_SIGNOFF_VERSION,
  type ProductAiRuntimeComponentId,
  type ProductAiRuntimeComponentLock,
  type ProductAiRuntimeFreezeLock,
  type ProductAiRuntimePhaseVersions,
} from "./baseline/freeze/freeze.lock";

export {
  isProductAiRuntimeImmutableManifestIntact,
  PRODUCT_AI_RUNTIME_IMMUTABLE_MANIFEST,
  type ProductAiRuntimeImmutableManifest,
} from "./baseline/freeze/immutable.manifest";

export {
  isProductAiRuntimeRollbackSnapshotIntact,
  PRODUCT_AI_RUNTIME_ROLLBACK_SNAPSHOT,
  type ProductAiRuntimeRollbackSnapshot,
} from "./baseline/freeze/rollback.snapshot";

export {
  assertProductAiRuntimeBaselineReleaseGatePass,
  checkProductAiRuntimeBaselineReleaseGate,
  PRODUCT_AI_RUNTIME_BASELINE_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/runtime.baseline.gate";
