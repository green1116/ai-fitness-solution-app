import type { GovernancePolicyPackEvaluation, GovernancePolicyPackMode } from "./policy-pack.types";
import type { GovernanceRulebookEvaluation } from "./rulebook.types";
import type { GovernanceRuleEvaluation, GovernanceSeverityLevel } from "./types";

export const GOVERNANCE_ORCHESTRATION_VERSION = "v4-a3-r4-orchestration-1" as const;
export type GovernanceOrchestrationVersion = typeof GOVERNANCE_ORCHESTRATION_VERSION;

export type GovernanceOrchestrationActionType =
  | "escalate"
  | "approve"
  | "manualReview"
  | "applyControl"
  | "recordException"
  | "generateAudit"
  | "defer";

export type GovernanceOrchestrationStepStatus =
  | "pending"
  | "approved"
  | "escalated"
  | "controlled"
  | "exceptionRecorded"
  | "audited"
  | "deferred"
  | "completed";

export type GovernanceOrchestrationState = {
  status: "pending" | "inProgress" | "completed";
  currentPhase: GovernanceOrchestrationActionType | "idle";
  completedSteps: number;
  totalSteps: number;
  requiresManualReview: boolean;
  highSeverityPending: boolean;
};

export type GovernanceOrchestrationStep = {
  stepId: string;
  order: number;
  action: GovernanceOrchestrationActionType;
  sourceRuleId: string;
  severity: GovernanceSeverityLevel;
  priority: number;
  status: GovernanceOrchestrationStepStatus;
  reason: string;
  autoCompletable: boolean;
};

export type GovernanceOrchestrationPlan = {
  planId: string;
  deploymentId: string;
  policyPackMode: GovernancePolicyPackMode;
  steps: GovernanceOrchestrationStep[];
  executionOrder: GovernanceOrchestrationActionType[];
};

export type GovernanceActionQueueItem = {
  queueId: string;
  position: number;
  action: GovernanceOrchestrationActionType;
  sourceRuleId: string;
  severity: GovernanceSeverityLevel;
  enqueuedAt: string;
  status: GovernanceOrchestrationStepStatus;
};

export type GovernanceOrchestrationConflict = {
  conflictId: string;
  actionA: GovernanceOrchestrationActionType;
  actionB: GovernanceOrchestrationActionType;
  sourceRuleIds: string[];
  resolution: string;
  winner: GovernanceOrchestrationActionType;
};

export type GovernanceOrchestrationTimelineEntry = {
  sequence: number;
  timestamp: string;
  action: GovernanceOrchestrationActionType;
  stepId: string;
  sourceRuleId: string;
  status: GovernanceOrchestrationStepStatus;
  note: string;
};

export type GovernanceOrchestrationTimeline = {
  timelineId: string;
  startedAt: string;
  entries: GovernanceOrchestrationTimelineEntry[];
};

export type GovernanceOrchestrationSummary = {
  summaryId: string;
  text: string;
  finalState: GovernanceOrchestrationState["status"];
  prioritizedActions: GovernanceOrchestrationActionType[];
  conflictCount: number;
  traceId: string;
};

export type GovernanceOrchestrationRuntimeInput = {
  deploymentId: string;
  observedAt: string;
  policyPackMode: GovernancePolicyPackMode;
  ruleEvaluation: GovernanceRuleEvaluation;
  rulebookEvaluation: GovernanceRulebookEvaluation;
  policyPackEvaluation: GovernancePolicyPackEvaluation;
};

export type GovernanceOrchestrationRuntimeResult = {
  version: GovernanceOrchestrationVersion;
  plan: GovernanceOrchestrationPlan;
  state: GovernanceOrchestrationState;
  timeline: GovernanceOrchestrationTimeline;
  conflicts: GovernanceOrchestrationConflict[];
  queue: GovernanceActionQueueItem[];
  summary: GovernanceOrchestrationSummary;
};
