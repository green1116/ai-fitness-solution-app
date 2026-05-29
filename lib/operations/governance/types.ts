/**
 * V4-A3 Operational Governance — type definitions
 */

import type { OperationalIntelligenceRuntime } from "../intelligence";
import type {
  GovernanceOrchestrationConflict,
  GovernanceOrchestrationPlan,
  GovernanceOrchestrationRuntimeResult,
  GovernanceOrchestrationState,
  GovernanceOrchestrationTimeline,
  GovernanceOrchestrationVersion,
  GovernanceActionQueueItem,
} from "./orchestration.types";
import type {
  GovernanceCheckpoint,
  GovernanceCheckpointVersion,
  GovernancePersistenceMetadata,
  GovernancePersistenceRuntimeResult,
  GovernancePersistenceStatus,
  GovernancePersistenceSummary,
  GovernancePersistenceVersion,
  GovernanceReplayResult,
  GovernanceRestoreResult,
  GovernanceSnapshot,
  GovernanceSnapshotVersion,
} from "./persistence.types";
import type {
  GovernanceStoreAdapter,
  GovernanceStoreBackend,
  GovernanceStoreOperation,
  GovernanceStoreRegistry,
  GovernanceStoreRuntimeResult,
  GovernanceStoreStatus,
  GovernanceStoreSummary,
  GovernanceStoreTrace,
  GovernanceStoreVersion,
} from "./store.types";
import type {
  GovernanceRecoveryAudit,
  GovernanceRecoveryDegraded,
  GovernanceRecoveryPartial,
  GovernanceRecoveryReplay,
  GovernanceRecoveryRollback,
  GovernanceRecoveryRuntimeResult,
  GovernanceRecoveryStatus,
  GovernanceRecoveryStrategy,
  GovernanceRecoverySummary,
  GovernanceRecoveryVersion,
} from "./recovery.types";
import type {
  GovernanceIncidentRecoveryProfileDecision,
  GovernanceIncidentRecoveryProfileMatch,
  GovernanceIncidentRecoveryProfileRegistry,
  GovernanceIncidentRecoveryProfileResult,
  GovernanceIncidentRecoveryProfileStatus,
  GovernanceIncidentRecoveryProfileTrace,
  GovernanceIncidentRecoveryProfileVersion,
  GovernanceIncidentRecoveryProfile,
} from "./incident-recovery-profile.types";
import type {
  GovernanceIncidentRecoveryProfileConfigResult,
  GovernanceIncidentRecoveryProfileConfigSource,
  GovernanceIncidentRecoveryProfileConfigResolver,
  GovernanceIncidentRecoveryProfileConfigRegistry,
  GovernanceIncidentRecoveryProfileConfigTrace,
  GovernanceIncidentRecoveryProfileConfigStatus,
  GovernanceIncidentRecoveryProfileConfigVersion,
  GovernanceIncidentRecoveryProfileConfigSnapshot,
} from "./incident-recovery-profile-config.types";
import type {
  GovernanceIncidentRecoveryProfileJsonSourceLoadResult,
  GovernanceIncidentRecoveryProfileJsonSourceMergeResult,
  GovernanceIncidentRecoveryProfileJsonSourceResolveResult,
  GovernanceIncidentRecoveryProfileJsonSourceResult,
  GovernanceIncidentRecoveryProfileJsonSourceStatus,
  GovernanceIncidentRecoveryProfileJsonSourceSummary,
  GovernanceIncidentRecoveryProfileJsonSourceTrace,
  GovernanceIncidentRecoveryProfileJsonSourceValidation,
  GovernanceIncidentRecoveryProfileJsonSourceVersion,
  GovernanceIncidentRecoveryProfileJsonSource,
} from "./incident-recovery-profile-config.json-source.types";
import type {
  GovernanceIncidentRecoveryProfileJsonSchemaGuardResult,
  GovernanceIncidentRecoveryProfileJsonSchemaGuardStatus,
  GovernanceIncidentRecoveryProfileJsonSchemaGuardVersion,
} from "./incident-recovery-profile-config.json-schema-guard.types";
import type {
  GovernanceIncidentRecoveryProfileJsonSchemaEvolution,
  GovernanceIncidentRecoveryProfileJsonSchemaEvolutionAlias,
  GovernanceIncidentRecoveryProfileJsonSchemaEvolutionCompatibility,
  GovernanceIncidentRecoveryProfileJsonSchemaEvolutionMigration,
  GovernanceIncidentRecoveryProfileJsonSchemaEvolutionResult,
  GovernanceIncidentRecoveryProfileJsonSchemaEvolutionStatus,
  GovernanceIncidentRecoveryProfileJsonSchemaEvolutionTrace,
  GovernanceIncidentRecoveryProfileJsonSchemaEvolutionVersion,
} from "./incident-recovery-profile-config.json-schema-evolution.types";
import type {
  GovernanceIncidentRecoveryProfileMigrationRuleMatch,
  GovernanceIncidentRecoveryProfileMigrationRuleRegistryResult,
  GovernanceIncidentRecoveryProfileMigrationRuleStatus,
  GovernanceIncidentRecoveryProfileMigrationRuleSummary,
  GovernanceIncidentRecoveryProfileMigrationRuleTrace,
  GovernanceIncidentRecoveryProfileMigrationRuleRegistryVersion,
} from "./incident-recovery-profile-migration-rule-registry.types";
import type {
  GovernanceIncidentRecoveryProfileRenderingPolicyMatch,
  GovernanceIncidentRecoveryProfileRenderingPolicyMode,
  GovernanceIncidentRecoveryProfileRenderingPolicyResult,
  GovernanceIncidentRecoveryProfileRenderingPolicyRule,
  GovernanceIncidentRecoveryProfileRenderingPolicyStatus,
  GovernanceIncidentRecoveryProfileRenderingPolicyTrace,
  GovernanceIncidentRecoveryProfileRenderingPolicyVersion,
} from "./incident-recovery-profile-rendering-policy.types";
import type {
  GovernanceIncidentRecoveryProfileMigrationExecutionCanonical,
  GovernanceIncidentRecoveryProfileMigrationExecutionFallback,
  GovernanceIncidentRecoveryProfileMigrationExecutionMode,
  GovernanceIncidentRecoveryProfileMigrationExecutionPlan,
  GovernanceIncidentRecoveryProfileMigrationExecutionResult,
  GovernanceIncidentRecoveryProfileMigrationExecutionStatus,
  GovernanceIncidentRecoveryProfileMigrationExecutionTrace,
  GovernanceIncidentRecoveryProfileMigrationExecutionVersion,
} from "./incident-recovery-profile-migration-execution.types";
import type {
  GovernanceIncidentRecoveryProfileCanonicalContract,
  GovernanceIncidentRecoveryProfileCanonicalContractCompatibility,
  GovernanceIncidentRecoveryProfileCanonicalContractConsumerVersion,
  GovernanceIncidentRecoveryProfileCanonicalContractReport,
  GovernanceIncidentRecoveryProfileCanonicalContractResult,
  GovernanceIncidentRecoveryProfileCanonicalContractSummary,
  GovernanceIncidentRecoveryProfileCanonicalContractTrace,
  GovernanceIncidentRecoveryProfileCanonicalContractVersion,
  GovernanceIncidentRecoveryProfileCanonicalContractMatrix,
  GovernanceIncidentRecoveryProfileCanonicalContractCompatibilityStatus,
} from "./incident-recovery-profile-canonical-contract.types";
import type {
  GovernanceIncidentRecoveryProfileExternalConsumerRegistry,
  GovernanceIncidentRecoveryProfileExternalConsumerRegistryConsumer,
  GovernanceIncidentRecoveryProfileExternalConsumerRegistryConsumerCompatibility,
  GovernanceIncidentRecoveryProfileExternalConsumerRegistryReport,
  GovernanceIncidentRecoveryProfileExternalConsumerRegistryResult,
  GovernanceIncidentRecoveryProfileExternalConsumerRegistryStatus,
  GovernanceIncidentRecoveryProfileExternalConsumerRegistryTrace,
  GovernanceIncidentRecoveryProfileExternalConsumerRegistryVersion,
} from "./incident-recovery-profile-external-consumer-registry.types";
import type {
  GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigCompatibility,
  GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigMergeStrategy,
  GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigReport,
  GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigResult,
  GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigSnapshot,
  GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigStatus,
  GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigTrace,
  GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigVersion,
} from "./incident-recovery-profile-external-consumer-registry-config.types";
import type {
  GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapter,
  GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterLoadResult,
  GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterReport,
  GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterResolveResult,
  GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterResult,
  GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterSource,
  GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterStatus,
  GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterTrace,
  GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterType,
  GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterVersion,
} from "./incident-recovery-profile-external-consumer-registry-source-adapter.types";
import type {
  CapabilityAuditRecord,
  CapabilityDegradationPlan,
  CapabilityHookEvent,
  CapabilityLineageGraph,
  CapabilityNegotiationResult,
  CapabilityVersionMatrixEntry,
  ConsumerCapabilityNegotiationRuntimeResult,
  ConsumerCapabilityNegotiationStatus,
  ConsumerCapabilityProfile,
  GovernanceConsumerCapabilityNegotiationVersion,
} from "./consumer-capability/capability-types";
import type {
  FederationAuditRecord,
  FederationHookEvent,
  FederationLineageGraph,
  FederationOrchestrationPlan,
  FederationPolicyPropagation,
  FederationRecoveryCoordination,
  FederationRoutingDecision,
  FederationRuntimeResult,
  FederationRuntimeStatus,
  FederationTopology,
  GovernanceFederationRuntimeVersion,
} from "./federation/federation-types";
import type {
  ConsensusAuditRecord,
  ConsensusHookEvent,
  ConsensusLineageGraph,
  ConsensusProposal,
  ConsensusProposalType,
  ConsensusQuorumResult,
  ConsensusReconciliationResult,
  ConsensusRecoveryCoordination,
  ConsensusResolution,
  ConsensusRuntimeResult,
  ConsensusRuntimeStatus,
  ConsensusStateConvergence,
  ConsensusVote,
  FederationConsensusNode,
  GovernanceFederationConsensusRuntimeVersion,
} from "./federation-consensus/consensus-types";
import type {
  FederatedPolicyBundle,
  PolicyBoundaryEnforcement,
  PolicyConflictArbitration,
  PolicyDisseminationResult,
  PolicyFanoutResult,
  PolicyFreezePropagation,
  PolicyPropagationAuditRecord,
  PolicyPropagationHookEvent,
  PolicyPropagationLineageGraph,
  PolicyPropagationRuntimeResult,
  PolicyPropagationStatus,
  PolicyRollbackPropagation,
  PolicySyncResult,
  PolicyVersionPropagation,
  GovernanceFederationPolicyPropagationRuntimeVersion,
} from "./federation-policy/propagation-types";
import type {
  FederationActivationResult,
  FederationConsensusLifecycleState,
  FederationContinuityHandoff,
  FederationContinuityStatus,
  FederationDomainLifecycleState,
  FederationFreezeThawResult,
  FederationLifecycleAuditRecord,
  FederationLifecycleHookEvent,
  FederationLifecycleLineageGraph,
  FederationLifecyclePhase,
  FederationNodeLifecycleState,
  FederationPolicyLifecycleState,
  FederationRecoveryLifecycleState,
  FederationRetirementArchivalResult,
  LifecycleContinuityRuntimeResult,
  GovernanceFederationLifecycleContinuityRuntimeVersion,
} from "./federation-lifecycle/continuity-types";
import type {
  FederationConsensusObservability,
  FederationGovernanceScore,
  FederationHealthSnapshot,
  FederationLifecycleObservability,
  FederationObservabilityAuditRecord,
  FederationObservabilityHookEvent,
  FederationObservabilityLineageGraph,
  FederationObservabilityRuntimeResult,
  FederationObservabilityStatus,
  FederationPropagationObservability,
  FederationRecoveryObservability,
  FederationRiskProfile,
  FederationTopologyObservability,
  GovernanceFederationObservabilityRuntimeVersion,
} from "./federation-observability/observability-types";
import type {
  GovernanceAnalysisResult,
  GovernanceAnomaly,
  GovernanceIntelligenceAuditRecord,
  GovernanceIntelligenceHookEvent,
  GovernanceIntelligenceLineageGraph,
  GovernanceIntelligenceRuntimeResult,
  GovernanceIntelligenceScore,
  GovernanceIntelligenceStatus,
  GovernancePrediction,
  GovernanceRecommendation,
  GovernanceRiskIntelligence,
  GovernanceSignalBundle,
  GovernanceSimulation,
  GovernanceSimulationScenario,
  GovernanceIntelligenceRuntimeVersion,
} from "./intelligence/intelligence-types";
import type {
  GovernanceActionProposal,
  GovernanceApprovalCandidate,
  GovernanceAutonomousAnalysis,
  GovernanceAutonomousAuditRecord,
  GovernanceAutonomousHookEvent,
  GovernanceAutonomousLineageGraph,
  GovernanceAutonomousRuntimeResult,
  GovernanceAutonomousScore,
  GovernanceAutonomousSignalBundle,
  GovernanceAutonomousStatus,
  GovernanceDecisionCandidate,
  GovernanceExecutionPlan,
  GovernanceOptimizationProposal,
  GovernanceRemediationPlan,
  GovernanceAutonomousRuntimeVersion,
} from "./autonomous/autonomous-types";
import type {
  GovernanceFeedbackLoop,
  GovernanceImpactAssessment,
  GovernanceMechanismScore,
  GovernanceModuleOptimization,
  GovernanceResilienceOptimization,
  GovernanceSelfOptimizationAuditRecord,
  GovernanceSelfOptimizationHookEvent,
  GovernanceSelfOptimizationLineageGraph,
  GovernanceSelfOptimizationRuntimeResult,
  GovernanceSelfOptimizationScore,
  GovernanceStrategyOptimization,
  GovernanceSelfOptimizationRuntimeVersion,
  SelfOptimizationStatus,
} from "./self-optimization/optimization-types";
import type {
  GovernanceComplexityProfile,
  GovernanceEvolutionAssessment,
  GovernanceEvolutionDecision,
  GovernanceMechanismInventoryEntry,
  GovernanceMetaGovernanceAuditRecord,
  GovernanceMetaGovernanceHookEvent,
  GovernanceMetaGovernanceLineageGraph,
  GovernanceMetaGovernanceRuntimeResult,
  GovernanceMetaGovernanceScore,
  GovernanceStandardizationPlan,
  GovernanceMetaGovernanceRuntimeVersion,
  MetaGovernanceStatus,
} from "./meta-governance/meta-governance-types";
import type {
  GovernanceBaselineReport,
  GovernanceCapabilityClassification,
  GovernanceCapabilityDependencyGraph,
  GovernanceCapabilityInventoryEntry,
  GovernanceComplexityReport,
  GovernancePlatformBaselineAuditRecord,
  GovernancePlatformBaselineHookEvent,
  GovernancePlatformBaselineLineageGraph,
  GovernancePlatformBaselineRuntimeResult,
  GovernancePlatformBaselineVersion,
  GovernanceReleaseBaseline,
  GovernanceBaselineFreezeStatus,
} from "./platform-baseline/baseline-types";
import type {
  GovernanceLifecycleArchive,
  GovernanceLifecycleReplay,
  GovernanceLifecycleRuntimeResult,
  GovernanceLifecycleSnapshot,
  GovernanceLifecycleState,
  GovernanceLifecycleStatus,
  GovernanceLifecycleSummary,
  GovernanceLifecycleTransition,
  GovernanceLifecycleVersion,
  GovernanceLifecycleRetry,
} from "./lifecycle.types";
import type {
  GovernancePolicyPack,
  GovernancePolicyPackEvaluation,
  GovernancePolicyPackMatch,
  GovernancePolicyPackMode,
  GovernancePolicyPackOverride,
  GovernancePolicyPackSnapshot,
  GovernancePolicyPackVersion,
} from "./policy-pack.types";
import type {
  GovernanceRulebook,
  GovernanceRulebookEvaluation,
  GovernanceRulebookMatch,
  GovernanceRulebookSnapshot,
  GovernanceRulebookVersion,
} from "./rulebook.types";

export const V4A3_OPERATIONAL_GOVERNANCE_VERSION = "4-a3-operational-governance-1" as const;

export type GovernancePolicyAction = "mustExecute" | "canDefer" | "needsApproval" | "needsEscalation" | "riskException";

export type GovernancePolicyResult = {
  policyId: string;
  recommendationId: string;
  action: GovernancePolicyAction;
  reason: string;
  source: string;
  traceId: string;
  confidence: number;
};

export type GovernanceControlType =
  | "riskControl"
  | "complianceControl"
  | "changeControl"
  | "runtimeControl"
  | "rollbackControl"
  | "approvalControl";

export type GovernanceControlResult = {
  controlId: string;
  controlType: GovernanceControlType;
  title: string;
  required: boolean;
  status: "active" | "pending" | "missing";
  source: string;
  traceId: string;
  evidence: string[];
};

export type GovernanceApprovalResult = {
  approvalId: string;
  recommendationId: string;
  required: boolean;
  reason: string;
  approverRole: "opsLead" | "releaseManager" | "governanceBoard";
  status: "required" | "not-required" | "approved" | "rejected";
  source: string;
  traceId: string;
};

export type GovernanceEscalationResult = {
  escalationId: string;
  triggered: boolean;
  triggerType:
    | "thresholdExceeded"
    | "persistentAnomaly"
    | "criticalTrend"
    | "repeatFailure"
    | "missingControl"
    | "approvalRejected";
  severity: "low" | "medium" | "high";
  reason: string;
  target: "opsLead" | "releaseManager" | "governanceBoard";
  source: string;
  traceId: string;
};

export type GovernanceExceptionResult = {
  exceptionId: string;
  exceptionType:
    | "temporaryWaiver"
    | "controlledDeviation"
    | "knownIssueTolerance"
    | "degradedOperation"
    | "riskAccepted";
  active: boolean;
  reason: string;
  expiresAt: string | null;
  source: string;
  traceId: string;
};

export type GovernanceAuditTrail = {
  auditId: string;
  inputSource: string;
  decisionBasis: string[];
  controlsApplied: string[];
  approvals: string[];
  escalationPath: string[];
  finalStatus: string;
  observedAt: string;
};

export type GovernanceSummary = {
  summaryId: string;
  text: string;
  source: string;
  traceId: string;
};

export type OperationalGovernanceRuntimeInput = {
  deploymentId?: string;
  intelligence?: OperationalIntelligenceRuntime;
  incidentRecoveryProfileJsonSourcePath?: string;
  incidentRecoveryProfileRenderingPolicyMode?: "strict" | "lenient" | "audit" | "compat";
  incidentRecoveryProfileMigrationExecutionMode?: "strict" | "compat" | "audit" | "dry-run";
  incidentRecoveryProfileExternalConsumerId?: string;
  incidentRecoveryProfileExternalConsumers?: GovernanceIncidentRecoveryProfileExternalConsumerRegistryConsumer[];
  incidentRecoveryProfileExternalConsumerRegistrySourceType?: GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterType;
  incidentRecoveryProfileExternalConsumerRegistrySourcePath?: string;
  incidentRecoveryProfileExternalConsumerRegistryConfig?: {
    configVersion: string;
    mergeStrategy: GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigMergeStrategy;
    consumers: GovernanceIncidentRecoveryProfileExternalConsumerRegistryConsumer[];
  };
  consumerCapabilityNegotiationRequestedCapabilities?: string[];
  governanceFederationDomainId?: string;
  governanceFederationConsensusProposalType?: ConsensusProposalType;
  governanceFederationPolicyPropagationVersion?: string;
  governanceFederationLifecyclePhase?: FederationLifecyclePhase;
  governanceIntelligenceSimulationScenario?: GovernanceSimulationScenario;
  incidentRecoveryProfileConfig?: {
    sourceType?: "inline" | "jsonLocal" | "env" | "builtinFallback" | "db" | "remote";
    profileVersion: string;
    mergeStrategy: "override" | "extend" | "fallback" | "priorityMerge";
    profiles: GovernanceIncidentRecoveryProfile[];
  };
};

export type GovernanceRuleCategory =
  | "policy"
  | "action"
  | "approval"
  | "escalation"
  | "exception"
  | "control"
  | "audit"
  | "summary";

export type GovernanceSeverityLevel = "low" | "medium" | "high" | "critical";
export type GovernanceConfidenceLevel = "low" | "medium" | "high";

export type GovernanceActionCandidate = {
  candidateId: string;
  kind: "recommendation" | "anomaly" | "bottleneck" | "decision" | "summary";
  refId: string;
  priority: "low" | "medium" | "high" | "critical";
  confidence: number;
  title: string;
  evidence: string[];
};

export type GovernanceRule = {
  ruleId: string;
  ruleName: string;
  ruleCategory: GovernanceRuleCategory;
  enabled: boolean;
  priority: number;
  severity: GovernanceSeverityLevel;
  rationale: string;
  triggers: string[];
};

export type GovernanceRuleMatch = {
  ruleId: string;
  matched: boolean;
  reason: string;
  candidateIds: string[];
};

export type GovernanceRuleTrace = {
  traceId: string;
  ruleId: string;
  matched: boolean;
  reason: string;
  evidence: string[];
};

export type GovernanceRuleRegistry = {
  version: string;
  rules: GovernanceRule[];
};

export type GovernanceRuleEvaluation = {
  governanceRules: GovernanceRuleRegistry;
  matchedRules: GovernanceRuleMatch[];
  unmatchedRules: GovernanceRuleMatch[];
  triggeredControls: string[];
  triggeredApprovals: string[];
  triggeredEscalations: string[];
  triggeredExceptions: string[];
  governanceScore: number;
  governanceConfidence: GovernanceConfidenceLevel;
  ruleTrace: GovernanceRuleTrace[];
};

export type OperationalGovernanceRuntimeResult = {
  runtimeName: "V4-A3 Operational Governance Runtime";
  version: typeof V4A3_OPERATIONAL_GOVERNANCE_VERSION;
  inputSnapshot: {
    deploymentId: string;
    intelligenceRuntimeId: string;
    intelligenceSummary: string;
  };
  policy: GovernancePolicyResult[];
  controls: GovernanceControlResult[];
  approvals: GovernanceApprovalResult[];
  escalation: GovernanceEscalationResult[];
  exceptions: GovernanceExceptionResult[];
  auditTrail: GovernanceAuditTrail;
  summary: GovernanceSummary;
  isGoverned: boolean;
  needsHumanApproval: boolean;
  needsEscalation: boolean;
  hasExceptions: boolean;
  controlCount: number;
  approvalCount: number;
  escalationCount: number;
  governanceRules: GovernanceRuleRegistry;
  matchedRules: GovernanceRuleMatch[];
  unmatchedRules: GovernanceRuleMatch[];
  triggeredControls: string[];
  triggeredApprovals: string[];
  triggeredEscalations: string[];
  triggeredExceptions: string[];
  governanceScore: number;
  governanceConfidence: GovernanceConfidenceLevel;
  ruleTrace: GovernanceRuleTrace[];
  rulebook: GovernanceRulebook;
  rulebookVersion: GovernanceRulebookVersion;
  rulebookSnapshot: GovernanceRulebookSnapshot;
  rulebookMatches: GovernanceRulebookMatch[];
  rulebookRules: GovernanceRulebook["entries"];
  rulebookEvaluation: GovernanceRulebookEvaluation;
  rulebookSummary: string;
  policyPack: GovernancePolicyPack;
  policyPackVersion: GovernancePolicyPackVersion;
  policyPackSnapshot: GovernancePolicyPackSnapshot;
  policyPackMatches: GovernancePolicyPackMatch[];
  policyPackRules: GovernancePolicyPack[];
  policyPackEvaluation: GovernancePolicyPackEvaluation;
  policyPackSummary: string;
  policyPackMode: GovernancePolicyPackMode;
  policyPackOverrides: GovernancePolicyPackOverride[];
  orchestration: GovernanceOrchestrationRuntimeResult;
  orchestrationVersion: GovernanceOrchestrationVersion;
  orchestrationPlan: GovernanceOrchestrationPlan;
  orchestrationState: GovernanceOrchestrationState;
  orchestrationTimeline: GovernanceOrchestrationTimeline;
  orchestrationConflicts: GovernanceOrchestrationConflict[];
  orchestrationSummary: string;
  orchestrationQueue: GovernanceActionQueueItem[];
  lifecycle: GovernanceLifecycleRuntimeResult;
  lifecycleVersion: GovernanceLifecycleVersion;
  lifecycleState: GovernanceLifecycleState;
  lifecycleStatus: GovernanceLifecycleStatus;
  lifecycleTransitions: GovernanceLifecycleTransition[];
  lifecycleTimeline: GovernanceOrchestrationTimeline["entries"];
  lifecycleRetries: GovernanceLifecycleRetry[];
  lifecycleReplay: GovernanceLifecycleReplay;
  lifecycleArchive: GovernanceLifecycleArchive;
  lifecycleSummary: GovernanceLifecycleSummary["text"];
  lifecycleSnapshots: GovernanceLifecycleSnapshot[];
  persistence: GovernancePersistenceRuntimeResult;
  persistenceVersion: GovernancePersistenceVersion;
  persistenceStatus: GovernancePersistenceStatus;
  persistenceSnapshot: GovernanceSnapshot;
  persistenceSnapshotVersion: GovernanceSnapshotVersion;
  persistenceCheckpoint: GovernanceCheckpoint;
  persistenceCheckpointVersion: GovernanceCheckpointVersion;
  persistenceRestore: GovernanceRestoreResult;
  persistenceReplay: GovernanceReplayResult;
  persistenceMetadata: GovernancePersistenceMetadata;
  persistenceSummary: GovernancePersistenceSummary["text"];
  store: GovernanceStoreRuntimeResult;
  storeVersion: GovernanceStoreVersion;
  storeBackend: GovernanceStoreBackend;
  storeAdapter: GovernanceStoreAdapter;
  storeRegistry: GovernanceStoreRegistry;
  storeTrace: GovernanceStoreTrace;
  storeSummary: GovernanceStoreSummary["text"];
  storeStatus: GovernanceStoreStatus;
  storeOperations: GovernanceStoreOperation[];
  recovery: GovernanceRecoveryRuntimeResult;
  recoveryVersion: GovernanceRecoveryVersion;
  recoveryStrategy: GovernanceRecoveryStrategy;
  recoveryRollback: GovernanceRecoveryRollback;
  recoveryReplay: GovernanceRecoveryReplay;
  recoveryPartial: GovernanceRecoveryPartial;
  recoveryDegraded: GovernanceRecoveryDegraded;
  recoveryAudit: GovernanceRecoveryAudit;
  recoverySummary: GovernanceRecoverySummary["text"];
  recoveryStatus: GovernanceRecoveryStatus;
  recoveryTrace: string[];
  incidentRecoveryProfile: GovernanceIncidentRecoveryProfileResult;
  incidentRecoveryProfileVersion: GovernanceIncidentRecoveryProfileVersion;
  incidentRecoveryProfileSnapshot: GovernanceIncidentRecoveryProfile;
  incidentRecoveryProfileMatches: GovernanceIncidentRecoveryProfileMatch[];
  incidentRecoveryProfileRegistry: GovernanceIncidentRecoveryProfileRegistry;
  incidentRecoveryProfileTrace: GovernanceIncidentRecoveryProfileTrace;
  incidentRecoveryProfileSummary: string;
  incidentRecoveryProfileStatus: GovernanceIncidentRecoveryProfileStatus;
  incidentRecoveryProfileDecision: GovernanceIncidentRecoveryProfileDecision;
  incidentRecoveryProfileConfig: GovernanceIncidentRecoveryProfileConfigResult;
  incidentRecoveryProfileConfigVersion: GovernanceIncidentRecoveryProfileConfigVersion;
  incidentRecoveryProfileConfigSnapshot: GovernanceIncidentRecoveryProfileConfigSnapshot;
  incidentRecoveryProfileConfigSource: GovernanceIncidentRecoveryProfileConfigSource;
  incidentRecoveryProfileConfigResolved: GovernanceIncidentRecoveryProfileConfigResolver;
  incidentRecoveryProfileConfigMerged: GovernanceIncidentRecoveryProfile[];
  incidentRecoveryProfileConfigRegistry: GovernanceIncidentRecoveryProfileConfigRegistry;
  incidentRecoveryProfileConfigTrace: GovernanceIncidentRecoveryProfileConfigTrace;
  incidentRecoveryProfileConfigSummary: string;
  incidentRecoveryProfileConfigStatus: GovernanceIncidentRecoveryProfileConfigStatus;
  incidentRecoveryProfileJsonSource: GovernanceIncidentRecoveryProfileJsonSourceResult;
  incidentRecoveryProfileJsonSourceVersion: GovernanceIncidentRecoveryProfileJsonSourceVersion;
  incidentRecoveryProfileJsonSourcePath: string;
  incidentRecoveryProfileJsonSourceSnapshot: GovernanceIncidentRecoveryProfileJsonSource;
  incidentRecoveryProfileJsonSourceLoaded: GovernanceIncidentRecoveryProfileJsonSourceLoadResult;
  incidentRecoveryProfileJsonSourceValidated: GovernanceIncidentRecoveryProfileJsonSourceValidation;
  incidentRecoveryProfileJsonSourceResolved: GovernanceIncidentRecoveryProfileJsonSourceResolveResult;
  incidentRecoveryProfileJsonSourceMerged: GovernanceIncidentRecoveryProfileJsonSourceMergeResult;
  incidentRecoveryProfileJsonSourceTrace: GovernanceIncidentRecoveryProfileJsonSourceTrace;
  incidentRecoveryProfileJsonSourceSummary: GovernanceIncidentRecoveryProfileJsonSourceSummary["text"];
  incidentRecoveryProfileJsonSourceStatus: GovernanceIncidentRecoveryProfileJsonSourceStatus;
  incidentRecoveryProfileJsonSchemaGuard: GovernanceIncidentRecoveryProfileJsonSchemaGuardResult;
  incidentRecoveryProfileJsonSchemaGuardVersion: GovernanceIncidentRecoveryProfileJsonSchemaGuardVersion;
  incidentRecoveryProfileJsonSchemaGuardSummary: string;
  incidentRecoveryProfileJsonSchemaGuardStatus: GovernanceIncidentRecoveryProfileJsonSchemaGuardStatus;
  incidentRecoveryProfileJsonSchemaEvolution: GovernanceIncidentRecoveryProfileJsonSchemaEvolutionResult;
  incidentRecoveryProfileJsonSchemaEvolutionVersion: GovernanceIncidentRecoveryProfileJsonSchemaEvolutionVersion;
  incidentRecoveryProfileJsonSchemaEvolutionSnapshot: GovernanceIncidentRecoveryProfileJsonSchemaEvolution;
  incidentRecoveryProfileJsonSchemaEvolutionCompatibility: GovernanceIncidentRecoveryProfileJsonSchemaEvolutionCompatibility;
  incidentRecoveryProfileJsonSchemaEvolutionMigrations: GovernanceIncidentRecoveryProfileJsonSchemaEvolutionMigration[];
  incidentRecoveryProfileJsonSchemaEvolutionAliases: GovernanceIncidentRecoveryProfileJsonSchemaEvolutionAlias[];
  incidentRecoveryProfileJsonSchemaEvolutionTrace: GovernanceIncidentRecoveryProfileJsonSchemaEvolutionTrace;
  incidentRecoveryProfileJsonSchemaEvolutionSummary: string;
  incidentRecoveryProfileJsonSchemaEvolutionStatus: GovernanceIncidentRecoveryProfileJsonSchemaEvolutionStatus;
  incidentRecoveryProfileMigrationRuleRegistry: GovernanceIncidentRecoveryProfileMigrationRuleRegistryResult;
  incidentRecoveryProfileMigrationRuleRegistryVersion: GovernanceIncidentRecoveryProfileMigrationRuleRegistryVersion;
  incidentRecoveryProfileMigrationRuleRegistrySnapshot: {
    sourceVersion: string;
    targetVersion: string;
    selectedRuleId: string;
  };
  incidentRecoveryProfileMigrationRuleRegistryMatches: GovernanceIncidentRecoveryProfileMigrationRuleMatch[];
  incidentRecoveryProfileMigrationRuleRegistryTrace: GovernanceIncidentRecoveryProfileMigrationRuleTrace;
  incidentRecoveryProfileMigrationRuleRegistrySummary: GovernanceIncidentRecoveryProfileMigrationRuleSummary["text"];
  incidentRecoveryProfileMigrationRuleRegistryStatus: GovernanceIncidentRecoveryProfileMigrationRuleStatus;
  incidentRecoveryProfileRenderingPolicy: GovernanceIncidentRecoveryProfileRenderingPolicyResult;
  incidentRecoveryProfileRenderingPolicyVersion: GovernanceIncidentRecoveryProfileRenderingPolicyVersion;
  incidentRecoveryProfileRenderingPolicySnapshot: GovernanceIncidentRecoveryProfileRenderingPolicyRule;
  incidentRecoveryProfileRenderingPolicyMatches: GovernanceIncidentRecoveryProfileRenderingPolicyMatch[];
  incidentRecoveryProfileRenderingPolicyTrace: GovernanceIncidentRecoveryProfileRenderingPolicyTrace;
  incidentRecoveryProfileRenderingPolicySummary: string;
  incidentRecoveryProfileRenderingPolicyStatus: GovernanceIncidentRecoveryProfileRenderingPolicyStatus;
  incidentRecoveryProfileRenderingPolicyMode: GovernanceIncidentRecoveryProfileRenderingPolicyMode;
  incidentRecoveryProfileMigrationExecution: GovernanceIncidentRecoveryProfileMigrationExecutionResult;
  incidentRecoveryProfileMigrationExecutionVersion: GovernanceIncidentRecoveryProfileMigrationExecutionVersion;
  incidentRecoveryProfileMigrationExecutionPlan: GovernanceIncidentRecoveryProfileMigrationExecutionPlan;
  incidentRecoveryProfileMigrationExecutionCanonical: GovernanceIncidentRecoveryProfileMigrationExecutionCanonical;
  incidentRecoveryProfileMigrationExecutionFallback: GovernanceIncidentRecoveryProfileMigrationExecutionFallback;
  incidentRecoveryProfileMigrationExecutionTrace: GovernanceIncidentRecoveryProfileMigrationExecutionTrace;
  incidentRecoveryProfileMigrationExecutionSummary: string;
  incidentRecoveryProfileMigrationExecutionStatus: GovernanceIncidentRecoveryProfileMigrationExecutionStatus;
  incidentRecoveryProfileMigrationExecutionMode: GovernanceIncidentRecoveryProfileMigrationExecutionMode;
  incidentRecoveryProfileCanonicalContract: GovernanceIncidentRecoveryProfileCanonicalContractResult;
  incidentRecoveryProfileCanonicalContractVersion: GovernanceIncidentRecoveryProfileCanonicalContractVersion;
  incidentRecoveryProfileCanonicalContractSnapshot: GovernanceIncidentRecoveryProfileCanonicalContract;
  incidentRecoveryProfileCanonicalContractConsumer: "recovery-consumer" | "audit-consumer" | "rendering-consumer" | "registry-consumer" | "reporting-consumer" | "external-integration-consumer";
  incidentRecoveryProfileCanonicalContractConsumerVersion: GovernanceIncidentRecoveryProfileCanonicalContractConsumerVersion;
  incidentRecoveryProfileCanonicalContractCompatibility: GovernanceIncidentRecoveryProfileCanonicalContractCompatibility;
  incidentRecoveryProfileCanonicalContractMatrix: GovernanceIncidentRecoveryProfileCanonicalContractMatrix;
  incidentRecoveryProfileCanonicalContractReport: GovernanceIncidentRecoveryProfileCanonicalContractReport;
  incidentRecoveryProfileCanonicalContractTrace: GovernanceIncidentRecoveryProfileCanonicalContractTrace;
  incidentRecoveryProfileCanonicalContractSummary: GovernanceIncidentRecoveryProfileCanonicalContractSummary["text"];
  incidentRecoveryProfileCanonicalContractStatus: GovernanceIncidentRecoveryProfileCanonicalContractCompatibilityStatus;
  incidentRecoveryProfileExternalConsumerRegistry: GovernanceIncidentRecoveryProfileExternalConsumerRegistryResult;
  incidentRecoveryProfileExternalConsumerRegistryVersion: GovernanceIncidentRecoveryProfileExternalConsumerRegistryVersion;
  incidentRecoveryProfileExternalConsumerRegistrySnapshot: GovernanceIncidentRecoveryProfileExternalConsumerRegistry;
  incidentRecoveryProfileExternalConsumerRegistryConsumers: GovernanceIncidentRecoveryProfileExternalConsumerRegistryConsumer[];
  incidentRecoveryProfileExternalConsumerRegistryResolvedConsumer: GovernanceIncidentRecoveryProfileExternalConsumerRegistryConsumer;
  incidentRecoveryProfileExternalConsumerRegistryCompatibility: GovernanceIncidentRecoveryProfileExternalConsumerRegistryConsumerCompatibility;
  incidentRecoveryProfileExternalConsumerRegistryTrace: GovernanceIncidentRecoveryProfileExternalConsumerRegistryTrace;
  incidentRecoveryProfileExternalConsumerRegistrySummary: string;
  incidentRecoveryProfileExternalConsumerRegistryReport: GovernanceIncidentRecoveryProfileExternalConsumerRegistryReport;
  incidentRecoveryProfileExternalConsumerRegistryStatus: GovernanceIncidentRecoveryProfileExternalConsumerRegistryStatus;
  incidentRecoveryProfileExternalConsumerRegistrySourceAdapter: GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterResult;
  incidentRecoveryProfileExternalConsumerRegistrySourceAdapterVersion: GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterVersion;
  incidentRecoveryProfileExternalConsumerRegistrySourceAdapterSnapshot: GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapter;
  incidentRecoveryProfileExternalConsumerRegistrySourceAdapterSource: GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterSource;
  incidentRecoveryProfileExternalConsumerRegistrySourceAdapterLoaded: GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterLoadResult;
  incidentRecoveryProfileExternalConsumerRegistrySourceAdapterValidated: GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterResult["validated"];
  incidentRecoveryProfileExternalConsumerRegistrySourceAdapterResolved: GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterResolveResult;
  incidentRecoveryProfileExternalConsumerRegistrySourceAdapterTrace: GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterTrace;
  incidentRecoveryProfileExternalConsumerRegistrySourceAdapterSummary: string;
  incidentRecoveryProfileExternalConsumerRegistrySourceAdapterReport: GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterReport;
  incidentRecoveryProfileExternalConsumerRegistrySourceAdapterStatus: GovernanceIncidentRecoveryProfileExternalConsumerRegistrySourceAdapterStatus;
  incidentRecoveryProfileExternalConsumerRegistryConfig: GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigResult;
  incidentRecoveryProfileExternalConsumerRegistryConfigVersion: GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigVersion;
  incidentRecoveryProfileExternalConsumerRegistryConfigSnapshot: GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigSnapshot;
  incidentRecoveryProfileExternalConsumerRegistryConfigConsumers: GovernanceIncidentRecoveryProfileExternalConsumerRegistryConsumer[];
  incidentRecoveryProfileExternalConsumerRegistryConfigResolvedConsumer: GovernanceIncidentRecoveryProfileExternalConsumerRegistryConsumer;
  incidentRecoveryProfileExternalConsumerRegistryConfigCompatibility: GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigCompatibility;
  incidentRecoveryProfileExternalConsumerRegistryConfigTrace: GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigTrace;
  incidentRecoveryProfileExternalConsumerRegistryConfigSummary: string;
  incidentRecoveryProfileExternalConsumerRegistryConfigReport: GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigReport;
  incidentRecoveryProfileExternalConsumerRegistryConfigStatus: GovernanceIncidentRecoveryProfileExternalConsumerRegistryConfigStatus;
  consumerCapabilityNegotiation: ConsumerCapabilityNegotiationRuntimeResult;
  consumerCapabilityNegotiationVersion: GovernanceConsumerCapabilityNegotiationVersion;
  consumerCapabilityNegotiationProfile: ConsumerCapabilityProfile;
  consumerCapabilityNegotiationResult: CapabilityNegotiationResult;
  consumerCapabilityNegotiationResolvedCapabilities: string[];
  consumerCapabilityNegotiationDegradationPlan: CapabilityDegradationPlan;
  consumerCapabilityNegotiationVersionMatrix: CapabilityVersionMatrixEntry[];
  consumerCapabilityNegotiationLineage: CapabilityLineageGraph;
  consumerCapabilityNegotiationAudit: CapabilityAuditRecord[];
  consumerCapabilityNegotiationHooks: CapabilityHookEvent[];
  consumerCapabilityNegotiationSummary: string;
  consumerCapabilityNegotiationStatus: ConsumerCapabilityNegotiationStatus;
  governanceFederation: FederationRuntimeResult;
  governanceFederationVersion: GovernanceFederationRuntimeVersion;
  governanceFederationRegistry: FederationRuntimeResult["registry"];
  governanceFederationTopology: FederationTopology;
  governanceFederationRouting: FederationRoutingDecision;
  governanceFederationOrchestration: FederationOrchestrationPlan;
  governanceFederationPolicy: FederationPolicyPropagation;
  governanceFederationRecovery: FederationRecoveryCoordination;
  governanceFederationLineage: FederationLineageGraph;
  governanceFederationAudit: FederationAuditRecord[];
  governanceFederationHooks: FederationHookEvent[];
  governanceFederationSummary: string;
  governanceFederationStatus: FederationRuntimeStatus;
  governanceFederationConsensus: ConsensusRuntimeResult;
  governanceFederationConsensusVersion: GovernanceFederationConsensusRuntimeVersion;
  governanceFederationConsensusRegistry: ConsensusRuntimeResult["registry"];
  governanceFederationConsensusNodes: FederationConsensusNode[];
  governanceFederationConsensusProposal: ConsensusProposal;
  governanceFederationConsensusVotes: ConsensusVote[];
  governanceFederationConsensusQuorum: ConsensusQuorumResult;
  governanceFederationConsensusResolution: ConsensusResolution;
  governanceFederationConsensusReconciliation: ConsensusReconciliationResult;
  governanceFederationConsensusConvergence: ConsensusStateConvergence;
  governanceFederationConsensusRecovery: ConsensusRecoveryCoordination;
  governanceFederationConsensusLineage: ConsensusLineageGraph;
  governanceFederationConsensusAudit: ConsensusAuditRecord[];
  governanceFederationConsensusHooks: ConsensusHookEvent[];
  governanceFederationConsensusSummary: string;
  governanceFederationConsensusStatus: ConsensusRuntimeStatus;
  governanceFederationPolicyPropagation: PolicyPropagationRuntimeResult;
  governanceFederationPolicyPropagationVersion: GovernanceFederationPolicyPropagationRuntimeVersion;
  governanceFederationPolicyPropagationRegistry: PolicyPropagationRuntimeResult["registry"];
  governanceFederationPolicyPropagationBundle: FederatedPolicyBundle;
  governanceFederationPolicyPropagationDissemination: PolicyDisseminationResult;
  governanceFederationPolicyPropagationSync: PolicySyncResult;
  governanceFederationPolicyPropagationFanout: PolicyFanoutResult;
  governanceFederationPolicyPropagationBoundary: PolicyBoundaryEnforcement;
  governanceFederationPolicyPropagationVersionPropagation: PolicyVersionPropagation;
  governanceFederationPolicyPropagationConflict: PolicyConflictArbitration;
  governanceFederationPolicyPropagationRollback: PolicyRollbackPropagation;
  governanceFederationPolicyPropagationFreeze: PolicyFreezePropagation;
  governanceFederationPolicyPropagationLineage: PolicyPropagationLineageGraph;
  governanceFederationPolicyPropagationAudit: PolicyPropagationAuditRecord[];
  governanceFederationPolicyPropagationHooks: PolicyPropagationHookEvent[];
  governanceFederationPolicyPropagationSummary: string;
  governanceFederationPolicyPropagationStatus: PolicyPropagationStatus;
  governanceFederationLifecycleContinuity: LifecycleContinuityRuntimeResult;
  governanceFederationLifecycleContinuityVersion: GovernanceFederationLifecycleContinuityRuntimeVersion;
  governanceFederationLifecycleContinuityRegistry: LifecycleContinuityRuntimeResult["registry"];
  governanceFederationLifecycleContinuityDomainLifecycle: FederationDomainLifecycleState[];
  governanceFederationLifecycleContinuityNodeLifecycle: FederationNodeLifecycleState[];
  governanceFederationLifecycleContinuityPolicyLifecycle: FederationPolicyLifecycleState;
  governanceFederationLifecycleContinuityConsensusLifecycle: FederationConsensusLifecycleState;
  governanceFederationLifecycleContinuityRecoveryLifecycle: FederationRecoveryLifecycleState;
  governanceFederationLifecycleContinuityActivation: FederationActivationResult;
  governanceFederationLifecycleContinuityFreezeThaw: FederationFreezeThawResult;
  governanceFederationLifecycleContinuityRetirement: FederationRetirementArchivalResult;
  governanceFederationLifecycleContinuityHandoff: FederationContinuityHandoff;
  governanceFederationLifecycleContinuityLineage: FederationLifecycleLineageGraph;
  governanceFederationLifecycleContinuityAudit: FederationLifecycleAuditRecord[];
  governanceFederationLifecycleContinuityHooks: FederationLifecycleHookEvent[];
  governanceFederationLifecycleContinuitySummary: string;
  governanceFederationLifecycleContinuityStatus: FederationContinuityStatus;
  governanceFederationLifecyclePhase: FederationLifecyclePhase;
  governanceFederationObservability: FederationObservabilityRuntimeResult;
  governanceFederationObservabilityVersion: GovernanceFederationObservabilityRuntimeVersion;
  governanceFederationObservabilityRegistry: FederationObservabilityRuntimeResult["registry"];
  governanceFederationObservabilityHealth: FederationHealthSnapshot;
  governanceFederationObservabilityTopology: FederationTopologyObservability;
  governanceFederationObservabilityConsensus: FederationConsensusObservability;
  governanceFederationObservabilityPropagation: FederationPropagationObservability;
  governanceFederationObservabilityLifecycle: FederationLifecycleObservability;
  governanceFederationObservabilityRecovery: FederationRecoveryObservability;
  governanceFederationObservabilityRisk: FederationRiskProfile;
  governanceFederationObservabilityGovernanceScore: FederationGovernanceScore;
  governanceFederationObservabilityLineage: FederationObservabilityLineageGraph;
  governanceFederationObservabilityAudit: FederationObservabilityAuditRecord[];
  governanceFederationObservabilityHooks: FederationObservabilityHookEvent[];
  governanceFederationObservabilitySummary: string;
  governanceFederationObservabilityStatus: FederationObservabilityStatus;
  governanceIntelligence: GovernanceIntelligenceRuntimeResult;
  governanceIntelligenceVersion: GovernanceIntelligenceRuntimeVersion;
  governanceIntelligenceRegistry: GovernanceIntelligenceRuntimeResult["registry"];
  governanceIntelligenceSignals: GovernanceSignalBundle;
  governanceIntelligenceAnalysis: GovernanceAnalysisResult;
  governanceIntelligenceAnomalies: GovernanceAnomaly[];
  governanceIntelligencePrediction: GovernancePrediction;
  governanceIntelligenceRecommendations: GovernanceRecommendation[];
  governanceIntelligenceSimulations: GovernanceSimulation[];
  governanceIntelligenceRisk: GovernanceRiskIntelligence;
  governanceIntelligenceScore: GovernanceIntelligenceScore;
  governanceIntelligenceLineage: GovernanceIntelligenceLineageGraph;
  governanceIntelligenceAudit: GovernanceIntelligenceAuditRecord[];
  governanceIntelligenceHooks: GovernanceIntelligenceHookEvent[];
  governanceIntelligenceSummary: string;
  governanceIntelligenceStatus: GovernanceIntelligenceStatus;
  governanceAutonomous: GovernanceAutonomousRuntimeResult;
  governanceAutonomousVersion: GovernanceAutonomousRuntimeVersion;
  governanceAutonomousRegistry: GovernanceAutonomousRuntimeResult["registry"];
  governanceAutonomousSignals: GovernanceAutonomousSignalBundle;
  governanceAutonomousAnalysis: GovernanceAutonomousAnalysis;
  governanceAutonomousDecisions: GovernanceDecisionCandidate[];
  governanceAutonomousProposals: GovernanceActionProposal[];
  governanceAutonomousExecutionPlan: GovernanceExecutionPlan;
  governanceAutonomousRemediations: GovernanceRemediationPlan[];
  governanceAutonomousOptimizations: GovernanceOptimizationProposal[];
  governanceAutonomousApproval: GovernanceApprovalCandidate;
  governanceAutonomousScore: GovernanceAutonomousScore;
  governanceAutonomousLineage: GovernanceAutonomousLineageGraph;
  governanceAutonomousAudit: GovernanceAutonomousAuditRecord[];
  governanceAutonomousHooks: GovernanceAutonomousHookEvent[];
  governanceAutonomousSummary: string;
  governanceAutonomousStatus: GovernanceAutonomousStatus;
  governanceSelfOptimization: GovernanceSelfOptimizationRuntimeResult;
  governanceSelfOptimizationVersion: GovernanceSelfOptimizationRuntimeVersion;
  governanceSelfOptimizationRegistry: GovernanceSelfOptimizationRuntimeResult["registry"];
  governanceSelfOptimizationFeedback: GovernanceFeedbackLoop;
  governanceSelfOptimizationMechanisms: GovernanceMechanismScore[];
  governanceSelfOptimizationStrategies: GovernanceStrategyOptimization[];
  governanceSelfOptimizationModules: GovernanceModuleOptimization[];
  governanceSelfOptimizationImpact: GovernanceImpactAssessment;
  governanceSelfOptimizationResilience: GovernanceResilienceOptimization;
  governanceSelfOptimizationLoopClosed: boolean;
  governanceSelfOptimizationScore: GovernanceSelfOptimizationScore;
  governanceSelfOptimizationLineage: GovernanceSelfOptimizationLineageGraph;
  governanceSelfOptimizationAudit: GovernanceSelfOptimizationAuditRecord[];
  governanceSelfOptimizationHooks: GovernanceSelfOptimizationHookEvent[];
  governanceSelfOptimizationSummary: string;
  governanceSelfOptimizationStatus: SelfOptimizationStatus;
  governanceMetaGovernance: GovernanceMetaGovernanceRuntimeResult;
  governanceMetaGovernanceVersion: GovernanceMetaGovernanceRuntimeVersion;
  governanceMetaGovernanceRegistry: GovernanceMetaGovernanceRuntimeResult["registry"];
  governanceMetaGovernanceInventory: GovernanceMechanismInventoryEntry[];
  governanceMetaGovernanceAssessment: GovernanceEvolutionAssessment;
  governanceMetaGovernanceDecisions: GovernanceEvolutionDecision[];
  governanceMetaGovernanceComplexity: GovernanceComplexityProfile;
  governanceMetaGovernanceStandardization: GovernanceStandardizationPlan;
  governanceMetaGovernanceScore: GovernanceMetaGovernanceScore;
  governanceMetaGovernanceLineage: GovernanceMetaGovernanceLineageGraph;
  governanceMetaGovernanceAudit: GovernanceMetaGovernanceAuditRecord[];
  governanceMetaGovernanceHooks: GovernanceMetaGovernanceHookEvent[];
  governanceMetaGovernanceSummary: string;
  governanceMetaGovernanceStatus: MetaGovernanceStatus;
  governancePlatformBaseline: GovernancePlatformBaselineRuntimeResult;
  governancePlatformBaselineVersion: GovernancePlatformBaselineVersion;
  governancePlatformBaselineRegistry: GovernancePlatformBaselineRuntimeResult["registry"];
  governancePlatformBaselineInventory: GovernanceCapabilityInventoryEntry[];
  governancePlatformBaselineClassifications: GovernanceCapabilityClassification[];
  governancePlatformBaselineDependencyGraph: GovernanceCapabilityDependencyGraph;
  governancePlatformBaselineComplexityReport: GovernanceComplexityReport;
  governancePlatformBaselineReport: GovernanceBaselineReport;
  governancePlatformBaselineRelease: GovernanceReleaseBaseline;
  governancePlatformBaselineLineage: GovernancePlatformBaselineLineageGraph;
  governancePlatformBaselineAudit: GovernancePlatformBaselineAuditRecord[];
  governancePlatformBaselineHooks: GovernancePlatformBaselineHookEvent[];
  governancePlatformBaselineSummary: string;
  governancePlatformBaselineStatus: GovernanceBaselineFreezeStatus;
};
