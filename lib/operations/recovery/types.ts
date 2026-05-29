import type { GovernanceAutonomousRuntimeResult } from "../governance/autonomous/autonomous-types";
import type { GovernanceIntelligenceRuntimeResult } from "../governance/intelligence/intelligence-types";
import type { OperationalAutonomousExecutionRuntimeResult } from "../execution/types";
import type { AutonomousChangeManagementRuntimeResult } from "../change/types";
import type { AutonomousIncidentManagementRuntimeResult } from "../incident/types";

export const AUTONOMOUS_RECOVERY_ORCHESTRATION_RUNTIME_VERSION =
  "v4-a4-a4-autonomous-recovery-orchestration-runtime-1" as const;
export type AutonomousRecoveryOrchestrationRuntimeVersion =
  typeof AUTONOMOUS_RECOVERY_ORCHESTRATION_RUNTIME_VERSION;

export type RecoveryLifecyclePhase =
  | "discover"
  | "isolate"
  | "diagnose"
  | "plan"
  | "orchestrate"
  | "recover"
  | "verify"
  | "close"
  | "audit";

export type RecoveryType =
  | "execution"
  | "change"
  | "incident"
  | "dependency"
  | "configuration"
  | "policy"
  | "version"
  | "service";

export type RecoverySeverity = "low" | "medium" | "high" | "critical";
export type RecoveryPriority = "low" | "medium" | "high" | "critical";
export type RecoveryStatus =
  | "requested"
  | "isolating"
  | "diagnosing"
  | "planned"
  | "recovering"
  | "verifying"
  | "completed"
  | "failed"
  | "closed";
export type RecoveryOwner = "system" | "operator" | "recovery-lead" | "autonomous-agent";
export type RecoverySource = "governance" | "execution" | "change" | "incident" | "intelligence";
export type RecoveryMode = "automatic" | "manual" | "staged";

export type RecoveryRequest = {
  requestId: string;
  title: string;
  description: string;
  recoveryType: RecoveryType;
  severity: RecoverySeverity;
  priority: RecoveryPriority;
  status: RecoveryStatus;
  owner: RecoveryOwner;
  source: RecoverySource;
  detectedAt: string;
  sourceIncidentId?: string;
};

export type RecoveryClassification = {
  classificationId: string;
  requestId: string;
  recoveryType: RecoveryType;
  category: string;
  tags: string[];
};

export type RecoveryImpactAssessment = {
  assessmentId: string;
  requestId: string;
  stabilityImpact: number;
  continuityImpact: number;
  blastRadius: number;
  overallImpact: number;
};

export type RecoveryRiskAssessment = {
  assessmentId: string;
  requestId: string;
  riskLevel: RecoverySeverity;
  score: number;
  factors: string[];
};

export type RecoveryDependencyAssessment = {
  assessmentId: string;
  requestId: string;
  upstream: string[];
  downstream: string[];
  blockedBy: string[];
};

export type RecoveryAssessment = {
  assessmentId: string;
  requestId: string;
  impact: RecoveryImpactAssessment;
  risk: RecoveryRiskAssessment;
  dependency: RecoveryDependencyAssessment;
  compositeScore: number;
  recoveryReady: boolean;
};

export type RecoveryWindow = {
  windowId: string;
  startsAt: string;
  endsAt: string;
  timezone: string;
};

export type RecoveryStage = {
  stageId: string;
  order: number;
  name: string;
  action: string;
  status: RecoveryStatus;
};

export type RecoveryAction = {
  actionId: string;
  stageId: string;
  name: string;
  category: "contain" | "diagnose" | "recover" | "verify";
};

export type RecoveryDependency = {
  dependencyId: string;
  fromStageId: string;
  toStageId: string;
  relation: "requires" | "blocks";
};

export type RecoveryPlan = {
  planId: string;
  requestId: string;
  mode: RecoveryMode;
  stages: RecoveryStage[];
  actions: RecoveryAction[];
  dependencies: RecoveryDependency[];
  window: RecoveryWindow;
  sequence: number[];
};

export type ContainmentStep = {
  stepId: string;
  order: number;
  action: string;
  status: RecoveryStatus;
};

export type DiagnosticStep = {
  stepId: string;
  order: number;
  action: string;
  status: RecoveryStatus;
};

export type RecoveryStep = {
  stepId: string;
  order: number;
  action: string;
  status: RecoveryStatus;
};

export type VerificationStep = {
  stepId: string;
  order: number;
  action: string;
  status: RecoveryStatus;
};

export type RecoveryOrchestration = {
  orchestrationId: string;
  planId: string;
  containment: ContainmentStep[];
  diagnostic: DiagnosticStep[];
  recovery: RecoveryStep[];
  verification: VerificationStep[];
  chainComplete: boolean;
};

export type RecoveryTimelineEntry = {
  entryId: string;
  phase: RecoveryLifecyclePhase;
  detail: string;
  timestamp: string;
};

export type RecoveryTimeline = {
  timelineId: string;
  requestId: string;
  entries: RecoveryTimelineEntry[];
};

export type RecoveryTrace = {
  traceId: string;
  events: { event: string; detail: string; timestamp: string }[];
};

export type RecoveryEvidence = {
  evidenceId: string;
  requestId: string;
  artifacts: string[];
};

export type RecoveryOutcome = {
  outcomeId: string;
  requestId: string;
  success: boolean;
  verified: boolean;
  message: string;
};

export type RecoveryTrackingBundle = {
  timelines: RecoveryTimeline[];
  trace: RecoveryTrace;
  evidence: RecoveryEvidence;
  outcome: RecoveryOutcome;
};

export type RecoveryMetrics = {
  metricsId: string;
  recoveries: number;
  successful: number;
  failed: number;
  automatic: number;
  manual: number;
  verified: number;
};

export type RecoverySummary = {
  summaryId: string;
  text: string;
};

export type RecoveryHealth = {
  healthId: string;
  score: number;
  status: "healthy" | "degraded" | "critical";
};

export type RecoveryRiskProfile = {
  profileId: string;
  overallSeverity: RecoverySeverity;
  highRiskCount: number;
  criticalCount: number;
};

export type RecoveryReport = {
  reportId: string;
  summary: RecoverySummary;
  health: RecoveryHealth;
  riskProfile: RecoveryRiskProfile;
};

export type RecoveryLifecycleState = {
  lifecycleId: string;
  phases: RecoveryLifecyclePhase[];
  currentPhase: RecoveryLifecyclePhase;
  closed: boolean;
};

export type AutonomousRecoveryOrchestrationRuntimeInput = {
  deploymentId: string;
  intelligence: GovernanceIntelligenceRuntimeResult;
  autonomous: GovernanceAutonomousRuntimeResult;
  execution?: OperationalAutonomousExecutionRuntimeResult;
  change?: AutonomousChangeManagementRuntimeResult;
  incident?: AutonomousIncidentManagementRuntimeResult;
};

export type AutonomousRecoveryOrchestrationRuntimeResult = {
  version: AutonomousRecoveryOrchestrationRuntimeVersion;
  registry: { recoveryOrchestrationId: string; requestCount: number };
  lifecycle: RecoveryLifecycleState;
  requests: RecoveryRequest[];
  classifications: RecoveryClassification[];
  assessments: RecoveryAssessment[];
  plans: RecoveryPlan[];
  orchestration: RecoveryOrchestration[];
  tracking: RecoveryTrackingBundle;
  metrics: RecoveryMetrics;
  report: RecoveryReport;
  flags: {
    classification: boolean;
    assessment: boolean;
    planning: boolean;
    orchestration: boolean;
    tracking: boolean;
    metrics: boolean;
    reporting: boolean;
  };
  summary: { summaryId: string; text: string; traceId: string };
  status: RecoveryStatus;
};
