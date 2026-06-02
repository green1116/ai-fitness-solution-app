import type { OperationalAutonomousExecutionRuntimeResult } from "../execution/types";
import type { AutonomousChangeManagementRuntimeResult } from "../change/types";
import type { AutonomousIncidentManagementRuntimeResult } from "../incident/types";
import type { AutonomousRecoveryOrchestrationRuntimeResult } from "../recovery/types";

export const AUTONOMOUS_OPERATIONS_CENTER_RUNTIME_VERSION =
  "v4-a4-a5-autonomous-operations-center-1" as const;
export type AutonomousOperationsCenterRuntimeVersion =
  typeof AUTONOMOUS_OPERATIONS_CENTER_RUNTIME_VERSION;

export type OperationsStatus = "operational" | "degraded" | "critical" | "recovering";
export type HealthStatus = "healthy" | "degraded" | "critical";
export type HealthTrend = "improving" | "stable" | "degrading";
export type RiskLevel = "low" | "medium" | "high" | "critical";

export type OperationsCenter = {
  centerId: string;
  deploymentId: string;
  platformVersion: "V4-A4";
  runtimes: {
    execution: string;
    change: string;
    incident: string;
    recovery: string;
  };
};

export type OperationsState = {
  stateId: string;
  executionStatus: string;
  changeStatus: string;
  incidentStatus: string;
  recoveryStatus: string;
  compositeStatus: OperationsStatus;
};

export type OperationsHealth = {
  healthId: string;
  score: number;
  status: HealthStatus;
  indicators: HealthIndicator[];
};

export type HealthIndicator = {
  indicatorId: string;
  domain: "execution" | "change" | "incident" | "recovery" | "platform";
  score: number;
  status: HealthStatus;
  label: string;
};

export type HealthScore = {
  scoreId: string;
  composite: number;
  execution: number;
  change: number;
  incident: number;
  recovery: number;
};

export type ExecutionOverview = {
  overviewId: string;
  runtimeId: string;
  status: string;
  candidates: number;
  executions: number;
  successRate: number;
  summary: string;
};

export type ChangeOverview = {
  overviewId: string;
  runtimeId: string;
  status: string;
  changes: number;
  approved: number;
  rejected: number;
  summary: string;
};

export type IncidentOverview = {
  overviewId: string;
  runtimeId: string;
  status: string;
  incidents: number;
  open: number;
  escalated: number;
  summary: string;
};

export type RecoveryOverview = {
  overviewId: string;
  runtimeId: string;
  status: string;
  recoveries: number;
  successful: number;
  verified: number;
  summary: string;
};

export type OperationsDashboardModel = {
  dashboardId: string;
  execution: ExecutionOverview;
  change: ChangeOverview;
  incident: IncidentOverview;
  recovery: RecoveryOverview;
};

export type OperationsRelationship =
  | "change_to_execution"
  | "execution_to_incident"
  | "incident_to_recovery"
  | "change_to_incident"
  | "execution_to_recovery";

export type OperationsCorrelation = {
  correlationId: string;
  relationship: OperationsRelationship;
  fromId: string;
  toId: string;
  confidence: number;
  reason: string;
};

export type OperationsImpactGraph = {
  graphId: string;
  nodes: string[];
  correlations: OperationsCorrelation[];
};

export type RiskSignal = {
  signalId: string;
  source: "execution" | "change" | "incident" | "recovery";
  message: string;
  weight: number;
};

export type RiskIndicator = {
  indicatorId: string;
  domain: string;
  level: RiskLevel;
  score: number;
};

export type OperationsRiskProfile = {
  profileId: string;
  level: RiskLevel;
  score: number;
  signals: RiskSignal[];
  indicators: RiskIndicator[];
};

export type OperationsTimelineEntry = {
  entryId: string;
  domain: "execution" | "change" | "incident" | "recovery";
  event: string;
  detail: string;
  timestamp: string;
};

export type OperationsTimeline = {
  timelineId: string;
  entries: OperationsTimelineEntry[];
};

export type OperationsSummary = {
  summaryId: string;
  text: string;
};

export type OperationsSnapshot = {
  snapshotId: string;
  capturedAt: string;
  status: OperationsStatus;
  healthScore: number;
  riskLevel: RiskLevel;
};

export type OperationsInsight = {
  insightId: string;
  category: "health" | "risk" | "correlation" | "throughput";
  message: string;
  priority: "low" | "medium" | "high" | "critical";
};

export type OperationsCommand = {
  commandId: string;
  name: string;
  target: "execution" | "change" | "incident" | "recovery" | "platform";
  enabled: boolean;
};

export type OperationsAction = {
  actionId: string;
  commandId: string;
  name: string;
  status: "pending" | "ready" | "blocked";
};

export type OperationsRecommendation = {
  recommendationId: string;
  action: string;
  rationale: string;
  priority: "low" | "medium" | "high" | "critical";
};

export type AutonomousOperationsCenterRuntimeInput = {
  deploymentId: string;
  execution: OperationalAutonomousExecutionRuntimeResult;
  change: AutonomousChangeManagementRuntimeResult;
  incident: AutonomousIncidentManagementRuntimeResult;
  recovery: AutonomousRecoveryOrchestrationRuntimeResult;
};

export type AutonomousOperationsCenterRuntimeResult = {
  version: AutonomousOperationsCenterRuntimeVersion;
  center: OperationsCenter;
  state: OperationsState;
  health: OperationsHealth;
  dashboard: OperationsDashboardModel;
  correlation: OperationsImpactGraph;
  risk: OperationsRiskProfile;
  timeline: OperationsTimeline;
  summary: OperationsSummary;
  snapshot: OperationsSnapshot;
  insights: OperationsInsight[];
  commands: OperationsCommand[];
  actions: OperationsAction[];
  recommendations: OperationsRecommendation[];
  flags: {
    dashboard: boolean;
    correlation: boolean;
    health: boolean;
    risk: boolean;
    timeline: boolean;
    summary: boolean;
  };
  loop: {
    phases: string[];
    currentPhase: string;
    closed: boolean;
  };
  summaryText: { summaryId: string; text: string; traceId: string };
  status: OperationsStatus;
};
