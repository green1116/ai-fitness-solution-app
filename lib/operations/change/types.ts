import type { GovernanceAutonomousRuntimeResult } from "../governance/autonomous/autonomous-types";
import type { OperationalAutonomousExecutionRuntimeResult } from "../execution/types";

export const AUTONOMOUS_CHANGE_MANAGEMENT_RUNTIME_VERSION =
  "v4-a4-a2-autonomous-change-management-runtime-1" as const;
export type AutonomousChangeManagementRuntimeVersion =
  typeof AUTONOMOUS_CHANGE_MANAGEMENT_RUNTIME_VERSION;

export type ChangeLifecyclePhase =
  | "describe"
  | "classify"
  | "assess"
  | "approve"
  | "orchestrate"
  | "execute"
  | "rollback"
  | "audit";

export type ChangeType =
  | "configuration"
  | "policy"
  | "rule"
  | "dependency"
  | "version"
  | "deployment"
  | "recovery"
  | "optimization";

export type ChangePriority = "low" | "medium" | "high" | "critical";
export type ChangeRisk = "minimal" | "moderate" | "elevated" | "critical";
export type ChangeScope = "local" | "domain" | "federation" | "platform";
export type ChangeOwner = "system" | "operator" | "autonomous-agent";
export type ChangeStatus = "draft" | "assessed" | "pending_approval" | "approved" | "rejected" | "executing" | "completed" | "failed" | "rolled_back";

export type ChangeReason = {
  reasonId: string;
  category: "incident" | "optimization" | "compliance" | "maintenance" | "recovery";
  description: string;
};

export type ChangeRequest = {
  requestId: string;
  title: string;
  description: string;
  changeType: ChangeType;
  priority: ChangePriority;
  risk: ChangeRisk;
  scope: ChangeScope;
  owner: ChangeOwner;
  reason: ChangeReason;
  sourceProposalId?: string;
  status: ChangeStatus;
};

export type ChangeClassification = {
  classificationId: string;
  requestId: string;
  changeType: ChangeType;
  category: string;
  tags: string[];
};

export type ImpactAssessment = {
  assessmentId: string;
  requestId: string;
  stabilityImpact: number;
  continuityImpact: number;
  userImpact: number;
  overallImpact: number;
};

export type RiskAssessment = {
  assessmentId: string;
  requestId: string;
  risk: ChangeRisk;
  score: number;
  factors: string[];
};

export type DependencyAssessment = {
  assessmentId: string;
  requestId: string;
  upstream: string[];
  downstream: string[];
  blockedBy: string[];
};

export type RollbackAssessment = {
  assessmentId: string;
  requestId: string;
  rollbackReady: boolean;
  strategy: string;
  estimatedDurationMs: number;
};

export type ChangeAssessment = {
  assessmentId: string;
  requestId: string;
  impact: ImpactAssessment;
  risk: RiskAssessment;
  dependency: DependencyAssessment;
  rollback: RollbackAssessment;
  compositeScore: number;
  approvedForWorkflow: boolean;
};

export type ApprovalPolicy = {
  policyId: string;
  name: string;
  autoApproveBelowRisk: ChangeRisk;
  requiresManualAboveRisk: ChangeRisk;
  multiStageThreshold: ChangePriority;
};

export type ApprovalGate = {
  gateId: string;
  stage: number;
  name: string;
  required: boolean;
  passed: boolean;
};

export type ApprovalDecision = {
  decisionId: string;
  requestId: string;
  mode: "auto" | "manual" | "multi-stage";
  approved: boolean;
  gates: ApprovalGate[];
  reason: string;
  timestamp: string;
};

export type ChangeStage = {
  stageId: string;
  order: number;
  name: string;
  action: string;
  status: ChangeStatus;
};

export type ChangeExecutionWindow = {
  windowId: string;
  startsAt: string;
  endsAt: string;
  timezone: string;
};

export type ChangeDependency = {
  dependencyId: string;
  fromStageId: string;
  toStageId: string;
  relation: "requires" | "blocks";
};

export type ChangePlan = {
  planId: string;
  requestId: string;
  stages: ChangeStage[];
  window: ChangeExecutionWindow;
  dependencies: ChangeDependency[];
  sequence: number[];
};

export type ChangeRecord = {
  recordId: string;
  requestId: string;
  planId: string;
  status: ChangeStatus;
  timestamp: string;
};

export type ChangeTrace = {
  traceId: string;
  events: { phase: ChangeLifecyclePhase; detail: string; timestamp: string }[];
};

export type ChangeEvidence = {
  evidenceId: string;
  requestId: string;
  artifacts: string[];
};

export type ChangeOutcome = {
  outcomeId: string;
  requestId: string;
  success: boolean;
  rolledBack: boolean;
  message: string;
};

export type ChangeAuditBundle = {
  records: ChangeRecord[];
  trace: ChangeTrace;
  evidence: ChangeEvidence;
  outcome: ChangeOutcome;
};

export type ChangeMetrics = {
  metricsId: string;
  changes: number;
  approved: number;
  rejected: number;
  executed: number;
  rolledBack: number;
  failed: number;
};

export type ChangeSummary = {
  summaryId: string;
  text: string;
};

export type ChangeHealth = {
  healthId: string;
  score: number;
  status: "healthy" | "degraded" | "critical";
};

export type ChangeRiskProfile = {
  profileId: string;
  overallRisk: ChangeRisk;
  highRiskCount: number;
  criticalCount: number;
};

export type ChangeReport = {
  reportId: string;
  summary: ChangeSummary;
  health: ChangeHealth;
  riskProfile: ChangeRiskProfile;
};

export type ChangeLifecycleState = {
  lifecycleId: string;
  phases: ChangeLifecyclePhase[];
  currentPhase: ChangeLifecyclePhase;
  closed: boolean;
};

export type AutonomousChangeManagementRuntimeInput = {
  deploymentId: string;
  autonomous: GovernanceAutonomousRuntimeResult;
  execution?: OperationalAutonomousExecutionRuntimeResult;
};

export type AutonomousChangeManagementRuntimeResult = {
  version: AutonomousChangeManagementRuntimeVersion;
  registry: { changeManagementId: string; requestCount: number };
  lifecycle: ChangeLifecycleState;
  requests: ChangeRequest[];
  classifications: ChangeClassification[];
  assessments: ChangeAssessment[];
  approvals: ApprovalDecision[];
  plans: ChangePlan[];
  audit: ChangeAuditBundle;
  metrics: ChangeMetrics;
  report: ChangeReport;
  flags: {
    classification: boolean;
    assessment: boolean;
    approval: boolean;
    workflow: boolean;
    audit: boolean;
    metrics: boolean;
    reporting: boolean;
  };
  summary: { summaryId: string; text: string; traceId: string };
  status: ChangeStatus;
};
