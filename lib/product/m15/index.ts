/**
 * Product M15 ? Enterprise Evolution public exports
 * Isolated namespace: lib/product/m15
 * Additive exports: Foundation (P1) ? Feedback (P2) ? Experience (P3) ? Learning (P4) ? Optimization (P5) ? Capability (P6) ? Governance (P7) ? Baseline Freeze (P8)
 */

export {
  EVOLUTION_CAPABILITY_KINDS,
  EVOLUTION_CAPABILITY_STATUSES,
  EVOLUTION_DOMAIN_SCOPES,
  EVOLUTION_GOVERNANCE_POLICY_KINDS,
  EVOLUTION_GOVERNANCE_POLICY_STATUSES,
  EVOLUTION_PROGRESSION_MODES,
  EVOLUTION_READINESS_VERDICTS,
  EVOLUTION_TRACK_KINDS,
  EVOLUTION_TRACK_STATUSES,
  PRODUCT_EVOLUTION_FOUNDATION_BASE,
  PRODUCT_EVOLUTION_FOUNDATION_FREEZE_VERSION,
  PRODUCT_EVOLUTION_FOUNDATION_ID,
  PRODUCT_EVOLUTION_FOUNDATION_VERSION,
  PRODUCT_EVOLUTION_FREEZE_TAG,
} from "./foundation/evolution.constants";

export type {
  EvaluateEvolutionProgressionContractInput,
  EvolutionCapability,
  EvolutionCapabilityKind,
  EvolutionCapabilityStatus,
  EvolutionDomainScope,
  EvolutionFoundationManifest,
  EvolutionGovernancePolicy,
  EvolutionGovernancePolicyKind,
  EvolutionGovernancePolicyStatus,
  EvolutionMetadata,
  EvolutionProgressionContract,
  EvolutionProgressionHit,
  EvolutionProgressionMode,
  EvolutionProgressionQuery,
  EvolutionReadinessCheck,
  EvolutionReadinessResult,
  EvolutionReadinessVerdict,
  EvolutionTrack,
  EvolutionTrackKind,
  EvolutionTrackStatus,
  EvolutionTrackValidationIssue,
  EvolutionTrackValidationResult,
  RegisterEvolutionCapabilityInput,
  RegisterEvolutionGovernancePolicyInput,
  RegisterEvolutionTrackInput,
  UpdateEvolutionCapabilityStatusInput,
  UpdateEvolutionTrackStatusInput,
} from "./foundation/evolution.types";

export {
  getEvolutionFoundationMetadata,
  isEvolutionFoundationMetadataIntact,
  PRODUCT_EVOLUTION_FOUNDATION_METADATA,
  validateEvolutionTrack,
  validateEvolutionTrackInput,
  type EvolutionFoundationMetadata,
} from "./foundation/evolution.metadata";

export {
  clearEvolutionTracks,
  getEvolutionTrack,
  getEvolutionTrackByKey,
  listEvolutionTracks,
  registerEvolutionTrack,
  updateEvolutionTrackStatus,
} from "./foundation/evolution.registry";

export {
  clearEvolutionCapabilities,
  getEvolutionCapability,
  listEvolutionCapabilities,
  registerEvolutionCapability,
  updateEvolutionCapabilityStatus,
} from "./foundation/capability.registry";

export {
  clearEvolutionGovernancePolicies,
  getEvolutionGovernancePolicy,
  listEvolutionGovernancePolicies,
  registerEvolutionGovernancePolicy,
} from "./foundation/governance.policy";

export {
  clearEvolutionProgressionContracts,
  evaluateEvolutionProgressionContract,
  getEvolutionProgressionContract,
  listEvolutionProgressionContracts,
} from "./foundation/progression.contract";

export {
  assertEvolutionFoundationReadinessReady,
  buildEvolutionFoundationManifest,
  clearEvolutionFoundationLayer,
  evaluateEvolutionFoundationReadiness,
} from "./foundation/evolution.manifest";

export {
  assertProductEvolutionFoundationReleaseGatePass,
  checkProductEvolutionFoundationReleaseGate,
  PRODUCT_EVOLUTION_FOUNDATION_SIGNOFF_VERSION,
  type GateCheckItem,
  type GateVerdict,
  type ReleaseGateResult,
} from "./verify/evolution.foundation.gate";

export {
  EVOLUTION_FEEDBACK_CAPABILITY_KINDS,
  EVOLUTION_FEEDBACK_CAPABILITY_STATUSES,
  EVOLUTION_FEEDBACK_DOMAIN_SCOPES,
  EVOLUTION_FEEDBACK_GOVERNANCE_POLICY_KINDS,
  EVOLUTION_FEEDBACK_GOVERNANCE_POLICY_STATUSES,
  EVOLUTION_FEEDBACK_INTAKE_MODES,
  EVOLUTION_FEEDBACK_KINDS,
  EVOLUTION_FEEDBACK_READINESS_VERDICTS,
  EVOLUTION_FEEDBACK_STATUSES,
  PRODUCT_EVOLUTION_FEEDBACK_BASE,
  PRODUCT_EVOLUTION_FEEDBACK_FREEZE_TAG,
  PRODUCT_EVOLUTION_FEEDBACK_FREEZE_VERSION,
  PRODUCT_EVOLUTION_FEEDBACK_ID,
  PRODUCT_EVOLUTION_FEEDBACK_VERSION,
} from "./feedback/feedback.constants";

export type {
  EvaluateEvolutionFeedbackIntakeContractInput,
  EvolutionFeedback,
  EvolutionFeedbackCapability,
  EvolutionFeedbackCapabilityKind,
  EvolutionFeedbackCapabilityStatus,
  EvolutionFeedbackDomainScope,
  EvolutionFeedbackGovernancePolicy,
  EvolutionFeedbackGovernancePolicyKind,
  EvolutionFeedbackGovernancePolicyStatus,
  EvolutionFeedbackIntakeContract,
  EvolutionFeedbackIntakeHit,
  EvolutionFeedbackIntakeMode,
  EvolutionFeedbackIntakeQuery,
  EvolutionFeedbackKind,
  EvolutionFeedbackManifest,
  EvolutionFeedbackMetadata,
  EvolutionFeedbackReadinessCheck,
  EvolutionFeedbackReadinessResult,
  EvolutionFeedbackReadinessVerdict,
  EvolutionFeedbackStatus,
  EvolutionFeedbackValidationIssue,
  EvolutionFeedbackValidationResult,
  RegisterEvolutionFeedbackCapabilityInput,
  RegisterEvolutionFeedbackGovernancePolicyInput,
  RegisterEvolutionFeedbackInput,
  UpdateEvolutionFeedbackCapabilityStatusInput,
  UpdateEvolutionFeedbackStatusInput,
} from "./feedback/feedback.types";

export {
  getEvolutionFeedbackMetadata,
  isEvolutionFeedbackMetadataIntact,
  PRODUCT_EVOLUTION_FEEDBACK_METADATA,
  validateEvolutionFeedback,
  validateEvolutionFeedbackInput,
  type EvolutionFeedbackMetadataRecord,
} from "./feedback/feedback.metadata";

export {
  clearEvolutionFeedbacks,
  getEvolutionFeedback,
  getEvolutionFeedbackByKey,
  listEvolutionFeedbacks,
  registerEvolutionFeedback,
  updateEvolutionFeedbackStatus,
} from "./feedback/feedback.registry";

export {
  clearEvolutionFeedbackCapabilities,
  getEvolutionFeedbackCapability,
  listEvolutionFeedbackCapabilities,
  registerEvolutionFeedbackCapability,
  updateEvolutionFeedbackCapabilityStatus,
} from "./feedback/capability.registry";

export {
  clearEvolutionFeedbackGovernancePolicies,
  getEvolutionFeedbackGovernancePolicy,
  listEvolutionFeedbackGovernancePolicies,
  registerEvolutionFeedbackGovernancePolicy,
} from "./feedback/governance.policy";

export {
  clearEvolutionFeedbackIntakeContracts,
  evaluateEvolutionFeedbackIntakeContract,
  getEvolutionFeedbackIntakeContract,
  listEvolutionFeedbackIntakeContracts,
} from "./feedback/intake.contract";

export {
  assertEvolutionFeedbackReadinessReady,
  buildEvolutionFeedbackManifest,
  clearEvolutionFeedbackLayer,
  evaluateEvolutionFeedbackReadiness,
} from "./feedback/feedback.manifest";

export {
  assertProductEvolutionFeedbackReleaseGatePass,
  checkProductEvolutionFeedbackReleaseGate,
  PRODUCT_EVOLUTION_FEEDBACK_SIGNOFF_VERSION,
} from "./verify/evolution.feedback.gate";

export {
  EVOLUTION_EXPERIENCE_CAPABILITY_KINDS,
  EVOLUTION_EXPERIENCE_CAPABILITY_STATUSES,
  EVOLUTION_EXPERIENCE_DOMAIN_SCOPES,
  EVOLUTION_EXPERIENCE_EXPOSURE_MODES,
  EVOLUTION_EXPERIENCE_GOVERNANCE_POLICY_KINDS,
  EVOLUTION_EXPERIENCE_GOVERNANCE_POLICY_STATUSES,
  EVOLUTION_EXPERIENCE_KINDS,
  EVOLUTION_EXPERIENCE_READINESS_VERDICTS,
  EVOLUTION_EXPERIENCE_STATUSES,
  PRODUCT_EVOLUTION_EXPERIENCE_BASE,
  PRODUCT_EVOLUTION_EXPERIENCE_FREEZE_TAG,
  PRODUCT_EVOLUTION_EXPERIENCE_FREEZE_VERSION,
  PRODUCT_EVOLUTION_EXPERIENCE_ID,
  PRODUCT_EVOLUTION_EXPERIENCE_VERSION,
} from "./experience/experience.constants";

export type {
  EvaluateEvolutionExperienceExposureContractInput,
  EvolutionExperience,
  EvolutionExperienceCapability,
  EvolutionExperienceCapabilityKind,
  EvolutionExperienceCapabilityStatus,
  EvolutionExperienceDomainScope,
  EvolutionExperienceExposureContract,
  EvolutionExperienceExposureHit,
  EvolutionExperienceExposureMode,
  EvolutionExperienceExposureQuery,
  EvolutionExperienceGovernancePolicy,
  EvolutionExperienceGovernancePolicyKind,
  EvolutionExperienceGovernancePolicyStatus,
  EvolutionExperienceKind,
  EvolutionExperienceManifest,
  EvolutionExperienceMetadata,
  EvolutionExperienceReadinessCheck,
  EvolutionExperienceReadinessResult,
  EvolutionExperienceReadinessVerdict,
  EvolutionExperienceStatus,
  EvolutionExperienceValidationIssue,
  EvolutionExperienceValidationResult,
  RegisterEvolutionExperienceCapabilityInput,
  RegisterEvolutionExperienceGovernancePolicyInput,
  RegisterEvolutionExperienceInput,
  UpdateEvolutionExperienceCapabilityStatusInput,
  UpdateEvolutionExperienceStatusInput,
} from "./experience/experience.types";

export {
  getEvolutionExperienceMetadata,
  isEvolutionExperienceMetadataIntact,
  PRODUCT_EVOLUTION_EXPERIENCE_METADATA,
  validateEvolutionExperience,
  validateEvolutionExperienceInput,
  type EvolutionExperienceMetadataRecord,
} from "./experience/experience.metadata";

export {
  clearEvolutionExperiences,
  getEvolutionExperience,
  getEvolutionExperienceByKey,
  listEvolutionExperiences,
  registerEvolutionExperience,
  updateEvolutionExperienceStatus,
} from "./experience/experience.registry";

export {
  clearEvolutionExperienceCapabilities,
  getEvolutionExperienceCapability,
  listEvolutionExperienceCapabilities,
  registerEvolutionExperienceCapability,
  updateEvolutionExperienceCapabilityStatus,
} from "./experience/capability.registry";

export {
  clearEvolutionExperienceGovernancePolicies,
  getEvolutionExperienceGovernancePolicy,
  listEvolutionExperienceGovernancePolicies,
  registerEvolutionExperienceGovernancePolicy,
} from "./experience/governance.policy";

export {
  clearEvolutionExperienceExposureContracts,
  evaluateEvolutionExperienceExposureContract,
  getEvolutionExperienceExposureContract,
  listEvolutionExperienceExposureContracts,
} from "./experience/exposure.contract";

export {
  assertEvolutionExperienceReadinessReady,
  buildEvolutionExperienceManifest,
  clearEvolutionExperienceLayer,
  evaluateEvolutionExperienceReadiness,
} from "./experience/experience.manifest";

export {
  assertProductEvolutionExperienceReleaseGatePass,
  checkProductEvolutionExperienceReleaseGate,
  PRODUCT_EVOLUTION_EXPERIENCE_SIGNOFF_VERSION,
} from "./verify/evolution.experience.gate";

export {
  EVOLUTION_LEARNING_CAPABILITY_KINDS,
  EVOLUTION_LEARNING_CAPABILITY_STATUSES,
  EVOLUTION_LEARNING_DOMAIN_SCOPES,
  EVOLUTION_LEARNING_GOVERNANCE_POLICY_KINDS,
  EVOLUTION_LEARNING_GOVERNANCE_POLICY_STATUSES,
  EVOLUTION_LEARNING_INSIGHT_MODES,
  EVOLUTION_LEARNING_KINDS,
  EVOLUTION_LEARNING_READINESS_VERDICTS,
  EVOLUTION_LEARNING_STATUSES,
  PRODUCT_EVOLUTION_LEARNING_BASE,
  PRODUCT_EVOLUTION_LEARNING_FREEZE_TAG,
  PRODUCT_EVOLUTION_LEARNING_FREEZE_VERSION,
  PRODUCT_EVOLUTION_LEARNING_ID,
  PRODUCT_EVOLUTION_LEARNING_VERSION,
} from "./learning-runtime/learning.constants";

export type {
  EvaluateEvolutionLearningInsightContractInput,
  EvolutionLearning,
  EvolutionLearningCapability,
  EvolutionLearningCapabilityKind,
  EvolutionLearningCapabilityStatus,
  EvolutionLearningDomainScope,
  EvolutionLearningGovernancePolicy,
  EvolutionLearningGovernancePolicyKind,
  EvolutionLearningGovernancePolicyStatus,
  EvolutionLearningInsightContract,
  EvolutionLearningInsightHit,
  EvolutionLearningInsightMode,
  EvolutionLearningInsightQuery,
  EvolutionLearningKind,
  EvolutionLearningManifest,
  EvolutionLearningMetadata,
  EvolutionLearningReadinessCheck,
  EvolutionLearningReadinessResult,
  EvolutionLearningReadinessVerdict,
  EvolutionLearningStatus,
  EvolutionLearningValidationIssue,
  EvolutionLearningValidationResult,
  RegisterEvolutionLearningCapabilityInput,
  RegisterEvolutionLearningGovernancePolicyInput,
  RegisterEvolutionLearningInput,
  UpdateEvolutionLearningCapabilityStatusInput,
  UpdateEvolutionLearningStatusInput,
} from "./learning-runtime/learning.types";

export {
  getEvolutionLearningMetadata,
  isEvolutionLearningMetadataIntact,
  PRODUCT_EVOLUTION_LEARNING_METADATA,
  validateEvolutionLearning,
  validateEvolutionLearningInput,
  type EvolutionLearningMetadataRecord,
} from "./learning-runtime/learning.metadata";

export {
  clearEvolutionLearnings,
  getEvolutionLearning,
  getEvolutionLearningByKey,
  listEvolutionLearnings,
  registerEvolutionLearning,
  updateEvolutionLearningStatus,
} from "./learning-runtime/learning.registry";

export {
  clearEvolutionLearningCapabilities,
  getEvolutionLearningCapability,
  listEvolutionLearningCapabilities,
  registerEvolutionLearningCapability,
  updateEvolutionLearningCapabilityStatus,
} from "./learning-runtime/capability.registry";

export {
  clearEvolutionLearningGovernancePolicies,
  getEvolutionLearningGovernancePolicy,
  listEvolutionLearningGovernancePolicies,
  registerEvolutionLearningGovernancePolicy,
} from "./learning-runtime/governance.policy";

export {
  clearEvolutionLearningInsightContracts,
  evaluateEvolutionLearningInsightContract,
  getEvolutionLearningInsightContract,
  listEvolutionLearningInsightContracts,
} from "./learning-runtime/insight.contract";

export {
  assertEvolutionLearningReadinessReady,
  buildEvolutionLearningManifest,
  clearEvolutionLearningLayer,
  evaluateEvolutionLearningReadiness,
} from "./learning-runtime/learning.manifest";

export {
  assertProductEvolutionLearningReleaseGatePass,
  checkProductEvolutionLearningReleaseGate,
  PRODUCT_EVOLUTION_LEARNING_SIGNOFF_VERSION,
} from "./verify/evolution.learning.gate";

export {
  EVOLUTION_OPTIMIZATION_CAPABILITY_KINDS,
  EVOLUTION_OPTIMIZATION_CAPABILITY_STATUSES,
  EVOLUTION_OPTIMIZATION_DOMAIN_SCOPES,
  EVOLUTION_OPTIMIZATION_EVALUATION_MODES,
  EVOLUTION_OPTIMIZATION_GOVERNANCE_POLICY_KINDS,
  EVOLUTION_OPTIMIZATION_GOVERNANCE_POLICY_STATUSES,
  EVOLUTION_OPTIMIZATION_PROPOSAL_KINDS,
  EVOLUTION_OPTIMIZATION_PROPOSAL_STATUSES,
  EVOLUTION_OPTIMIZATION_READINESS_VERDICTS,
  PRODUCT_EVOLUTION_OPTIMIZATION_BASE,
  PRODUCT_EVOLUTION_OPTIMIZATION_FREEZE_TAG,
  PRODUCT_EVOLUTION_OPTIMIZATION_FREEZE_VERSION,
  PRODUCT_EVOLUTION_OPTIMIZATION_ID,
  PRODUCT_EVOLUTION_OPTIMIZATION_VERSION,
} from "./optimization-runtime/optimization.constants";

export type {
  EvaluateEvolutionOptimizationEvaluationContractInput,
  EvolutionOptimizationCapability,
  EvolutionOptimizationCapabilityKind,
  EvolutionOptimizationCapabilityStatus,
  EvolutionOptimizationDomainScope,
  EvolutionOptimizationEvaluationContract,
  EvolutionOptimizationEvaluationHit,
  EvolutionOptimizationEvaluationMode,
  EvolutionOptimizationEvaluationQuery,
  EvolutionOptimizationGovernancePolicy,
  EvolutionOptimizationGovernancePolicyKind,
  EvolutionOptimizationGovernancePolicyStatus,
  EvolutionOptimizationManifest,
  EvolutionOptimizationMetadata,
  EvolutionOptimizationProposal,
  EvolutionOptimizationProposalKind,
  EvolutionOptimizationProposalStatus,
  EvolutionOptimizationProposalValidationIssue,
  EvolutionOptimizationProposalValidationResult,
  EvolutionOptimizationReadinessCheck,
  EvolutionOptimizationReadinessResult,
  EvolutionOptimizationReadinessVerdict,
  RegisterEvolutionOptimizationCapabilityInput,
  RegisterEvolutionOptimizationGovernancePolicyInput,
  RegisterEvolutionOptimizationProposalInput,
  UpdateEvolutionOptimizationCapabilityStatusInput,
  UpdateEvolutionOptimizationProposalStatusInput,
} from "./optimization-runtime/optimization.types";

export {
  getEvolutionOptimizationMetadata,
  isEvolutionOptimizationMetadataIntact,
  PRODUCT_EVOLUTION_OPTIMIZATION_METADATA,
  validateEvolutionOptimizationProposal,
  validateEvolutionOptimizationProposalInput,
  type EvolutionOptimizationMetadataRecord,
} from "./optimization-runtime/optimization.metadata";

export {
  clearEvolutionOptimizationProposals,
  getEvolutionOptimizationProposal,
  getEvolutionOptimizationProposalByKey,
  listEvolutionOptimizationProposals,
  registerEvolutionOptimizationProposal,
  updateEvolutionOptimizationProposalStatus,
} from "./optimization-runtime/optimization.registry";

export {
  clearEvolutionOptimizationCapabilities,
  getEvolutionOptimizationCapability,
  listEvolutionOptimizationCapabilities,
  registerEvolutionOptimizationCapability,
  updateEvolutionOptimizationCapabilityStatus,
} from "./optimization-runtime/capability.registry";

export {
  clearEvolutionOptimizationGovernancePolicies,
  getEvolutionOptimizationGovernancePolicy,
  listEvolutionOptimizationGovernancePolicies,
  registerEvolutionOptimizationGovernancePolicy,
} from "./optimization-runtime/governance.policy";

export {
  clearEvolutionOptimizationEvaluationContracts,
  evaluateEvolutionOptimizationEvaluationContract,
  getEvolutionOptimizationEvaluationContract,
  listEvolutionOptimizationEvaluationContracts,
} from "./optimization-runtime/evaluation.contract";

export {
  assertEvolutionOptimizationReadinessReady,
  buildEvolutionOptimizationManifest,
  clearEvolutionOptimizationLayer,
  evaluateEvolutionOptimizationReadiness,
} from "./optimization-runtime/optimization.manifest";

export {
  assertProductEvolutionOptimizationReleaseGatePass,
  checkProductEvolutionOptimizationReleaseGate,
  PRODUCT_EVOLUTION_OPTIMIZATION_SIGNOFF_VERSION,
} from "./verify/evolution.optimization.gate";

export {
  EVOLUTION_CAPABILITY_ADVANCEMENT_MODES,
  EVOLUTION_CAPABILITY_DOMAIN_SCOPES,
  EVOLUTION_CAPABILITY_GOVERNANCE_POLICY_KINDS,
  EVOLUTION_CAPABILITY_GOVERNANCE_POLICY_STATUSES,
  EVOLUTION_CAPABILITY_SPEC_KINDS,
  EVOLUTION_CAPABILITY_READINESS_VERDICTS,
  EVOLUTION_CAPABILITY_REVISION_KINDS,
  EVOLUTION_CAPABILITY_REVISION_STATUSES,
  EVOLUTION_CAPABILITY_SPEC_STATUSES,
  PRODUCT_EVOLUTION_CAPABILITY_BASE,
  PRODUCT_EVOLUTION_CAPABILITY_FREEZE_TAG,
  PRODUCT_EVOLUTION_CAPABILITY_FREEZE_VERSION,
  PRODUCT_EVOLUTION_CAPABILITY_ID,
  PRODUCT_EVOLUTION_CAPABILITY_VERSION,
} from "./capability-runtime/capability.constants";

export type {
  EvaluateEvolutionCapabilityAdvancementContractInput,
  EvolutionCapabilityAdvancementContract,
  EvolutionCapabilityAdvancementHit,
  EvolutionCapabilityAdvancementMode,
  EvolutionCapabilityAdvancementQuery,
  EvolutionCapabilityDomainScope,
  EvolutionCapabilityGovernancePolicy,
  EvolutionCapabilityGovernancePolicyKind,
  EvolutionCapabilityGovernancePolicyStatus,
  EvolutionCapabilityManifest,
  EvolutionCapabilityReadinessCheck,
  EvolutionCapabilityReadinessResult,
  EvolutionCapabilityReadinessVerdict,
  EvolutionCapabilityRevision,
  EvolutionCapabilityRevisionKind,
  EvolutionCapabilityRevisionStatus,
  EvolutionCapabilityRuntimeMetadata,
  EvolutionCapabilitySpec,
  EvolutionCapabilitySpecKind,
  EvolutionCapabilitySpecStatus,
  EvolutionCapabilitySpecValidationIssue,
  EvolutionCapabilitySpecValidationResult,
  RegisterEvolutionCapabilityGovernancePolicyInput,
  RegisterEvolutionCapabilityRevisionInput,
  RegisterEvolutionCapabilitySpecInput,
  UpdateEvolutionCapabilityRevisionStatusInput,
  UpdateEvolutionCapabilitySpecStatusInput,
} from "./capability-runtime/capability.types";

export {
  getEvolutionCapabilityRuntimeMetadata,
  isEvolutionCapabilityRuntimeMetadataIntact,
  PRODUCT_EVOLUTION_CAPABILITY_METADATA,
  validateEvolutionCapabilitySpec,
  validateEvolutionCapabilitySpecInput,
  type EvolutionCapabilityMetadataRecord,
} from "./capability-runtime/capability.metadata";

export {
  clearEvolutionCapabilitySpecs,
  getEvolutionCapabilitySpec,
  getEvolutionCapabilitySpecByKey,
  listEvolutionCapabilitySpecs,
  registerEvolutionCapabilitySpec,
  updateEvolutionCapabilitySpecStatus,
} from "./capability-runtime/capability.registry";

export {
  clearEvolutionCapabilityRevisions,
  getEvolutionCapabilityRevision,
  listEvolutionCapabilityRevisions,
  registerEvolutionCapabilityRevision,
  updateEvolutionCapabilityRevisionStatus,
} from "./capability-runtime/revision.registry";

export {
  clearEvolutionCapabilityGovernancePolicies,
  getEvolutionCapabilityGovernancePolicy,
  listEvolutionCapabilityGovernancePolicies,
  registerEvolutionCapabilityGovernancePolicy,
} from "./capability-runtime/governance.policy";

export {
  clearEvolutionCapabilityAdvancementContracts,
  evaluateEvolutionCapabilityAdvancementContract,
  getEvolutionCapabilityAdvancementContract,
  listEvolutionCapabilityAdvancementContracts,
} from "./capability-runtime/advancement.contract";

export {
  assertEvolutionCapabilityReadinessReady,
  buildEvolutionCapabilityManifest,
  clearEvolutionCapabilityRuntimeLayer,
  evaluateEvolutionCapabilityReadiness,
} from "./capability-runtime/capability.manifest";

export {
  assertProductEvolutionCapabilityReleaseGatePass,
  checkProductEvolutionCapabilityReleaseGate,
  PRODUCT_EVOLUTION_CAPABILITY_SIGNOFF_VERSION,
} from "./verify/evolution.capability.gate";

export {
  EVOLUTION_GOVERNANCE_CONTROL_POLICY_KINDS,
  EVOLUTION_GOVERNANCE_CONTROL_POLICY_STATUSES,
  EVOLUTION_GOVERNANCE_DOMAIN_SCOPES,
  EVOLUTION_GOVERNANCE_FRAME_KINDS,
  EVOLUTION_GOVERNANCE_FRAME_STATUSES,
  EVOLUTION_GOVERNANCE_OVERSIGHT_MODES,
  EVOLUTION_GOVERNANCE_READINESS_VERDICTS,
  EVOLUTION_GOVERNANCE_REVIEW_KINDS,
  EVOLUTION_GOVERNANCE_REVIEW_STATUSES,
  PRODUCT_EVOLUTION_GOVERNANCE_BASE,
  PRODUCT_EVOLUTION_GOVERNANCE_FREEZE_TAG,
  PRODUCT_EVOLUTION_GOVERNANCE_FREEZE_VERSION,
  PRODUCT_EVOLUTION_GOVERNANCE_ID,
  PRODUCT_EVOLUTION_GOVERNANCE_VERSION,
} from "./governance-runtime/governance.constants";

export type {
  EvaluateEvolutionGovernanceOversightContractInput,
  EvolutionGovernance,
  EvolutionGovernanceControlPolicy,
  EvolutionGovernanceControlPolicyKind,
  EvolutionGovernanceControlPolicyStatus,
  EvolutionGovernanceDomainScope,
  EvolutionGovernanceKind,
  EvolutionGovernanceManifest,
  EvolutionGovernanceOversightContract,
  EvolutionGovernanceOversightHit,
  EvolutionGovernanceOversightMode,
  EvolutionGovernanceOversightQuery,
  EvolutionGovernanceReadinessCheck,
  EvolutionGovernanceReadinessResult,
  EvolutionGovernanceReadinessVerdict,
  EvolutionGovernanceReview,
  EvolutionGovernanceReviewKind,
  EvolutionGovernanceReviewStatus,
  EvolutionGovernanceRuntimeMetadata,
  EvolutionGovernanceStatus,
  EvolutionGovernanceValidationIssue,
  EvolutionGovernanceValidationResult,
  RegisterEvolutionGovernanceControlPolicyInput,
  RegisterEvolutionGovernanceInput,
  RegisterEvolutionGovernanceReviewInput,
  UpdateEvolutionGovernanceReviewStatusInput,
  UpdateEvolutionGovernanceStatusInput,
} from "./governance-runtime/governance.types";

export {
  getEvolutionGovernanceRuntimeMetadata,
  isEvolutionGovernanceRuntimeMetadataIntact,
  PRODUCT_EVOLUTION_GOVERNANCE_METADATA,
  validateEvolutionGovernance,
  validateEvolutionGovernanceInput,
  type EvolutionGovernanceMetadataRecord,
} from "./governance-runtime/governance.metadata";

export {
  clearEvolutionGovernances,
  getEvolutionGovernance,
  getEvolutionGovernanceByKey,
  listEvolutionGovernances,
  registerEvolutionGovernance,
  updateEvolutionGovernanceStatus,
} from "./governance-runtime/governance.registry";

export {
  clearEvolutionGovernanceReviews,
  getEvolutionGovernanceReview,
  listEvolutionGovernanceReviews,
  registerEvolutionGovernanceReview,
  updateEvolutionGovernanceReviewStatus,
} from "./governance-runtime/review.registry";

export {
  clearEvolutionGovernanceControlPolicies,
  getEvolutionGovernanceControlPolicy,
  listEvolutionGovernanceControlPolicies,
  registerEvolutionGovernanceControlPolicy,
} from "./governance-runtime/governance.policy";

export {
  clearEvolutionGovernanceOversightContracts,
  evaluateEvolutionGovernanceOversightContract,
  getEvolutionGovernanceOversightContract,
  listEvolutionGovernanceOversightContracts,
} from "./governance-runtime/oversight.contract";

export {
  assertEvolutionGovernanceReadinessReady,
  buildEvolutionGovernanceManifest,
  clearEvolutionGovernanceRuntimeLayer,
  evaluateEvolutionGovernanceReadiness,
} from "./governance-runtime/governance.manifest";

export {
  assertProductEvolutionGovernanceReleaseGatePass,
  checkProductEvolutionGovernanceReleaseGate,
  PRODUCT_EVOLUTION_GOVERNANCE_SIGNOFF_VERSION,
} from "./verify/evolution.governance.gate";

export {
  ENTERPRISE_PRODUCT_EVOLUTION_BASELINE_ID,
  isProductEvolutionFreezeLockIntact,
  PRODUCT_EVOLUTION_BASELINE_FREEZE_BASE,
  PRODUCT_EVOLUTION_BASELINE_FREEZE_VERSION,
  PRODUCT_EVOLUTION_BASELINE_ID,
  PRODUCT_EVOLUTION_COMPONENT_LOCK,
  PRODUCT_EVOLUTION_FREEZE_LOCK,
  PRODUCT_EVOLUTION_PHASE_VERSIONS,
  PRODUCT_EVOLUTION_SIGNOFF_VERSION,
  type ProductEvolutionComponentId,
  type ProductEvolutionComponentLock,
  type ProductEvolutionFreezeLock,
  type ProductEvolutionPhaseVersions,
} from "./baseline/freeze/freeze.lock";

export {
  isProductEvolutionImmutableManifestIntact,
  PRODUCT_EVOLUTION_IMMUTABLE_MANIFEST,
  type ProductEvolutionImmutableManifest,
} from "./baseline/freeze/immutable.manifest";

export {
  isProductEvolutionRollbackSnapshotIntact,
  PRODUCT_EVOLUTION_ROLLBACK_SNAPSHOT,
  type ProductEvolutionRollbackSnapshot,
} from "./baseline/freeze/rollback.snapshot";

export {
  assertProductEvolutionBaselineReleaseGatePass,
  checkProductEvolutionBaselineReleaseGate,
  PRODUCT_EVOLUTION_BASELINE_SIGNOFF_VERSION,
} from "./verify/evolution.baseline.gate";
