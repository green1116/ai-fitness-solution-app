import type { GovernanceIntelligenceRuntimeResult } from "../governance/intelligence/intelligence-types";
import type { FederationObservabilityRuntimeResult } from "../governance/federation-observability/observability-types";
import type { OperationalAutonomousExecutionRuntimeResult } from "../execution/types";
import type { AutonomousChangeManagementRuntimeResult } from "../change/types";

export const AUTONOMOUS_INCIDENT_MANAGEMENT_RUNTIME_VERSION =
  "v4-a4-a3-autonomous-incident-management-runtime-1" as const;
export type AutonomousIncidentManagementRuntimeVersion =
  typeof AUTONOMOUS_INCIDENT_MANAGEMENT_RUNTIME_VERSION;

export type IncidentLifecyclePhase =
  | "discover"
  | "classify"
  | "assess"
  | "escalate"
  | "orchestrate"
  | "track"
  | "close"
  | "audit";

export type IncidentType =
  | "availability"
  | "performance"
  | "security"
  | "compliance"
  | "execution"
  | "change"
  | "dependency"
  | "recovery";

export type IncidentSeverity = "low" | "medium" | "high" | "critical";
export type IncidentPriority = "low" | "medium" | "high" | "critical";
export type IncidentStatus = "open" | "investigating" | "escalated" | "responding" | "resolved" | "closed" | "failed";
export type IncidentOwner = "system" | "operator" | "incident-commander" | "autonomous-agent";
export type IncidentSource = "observability" | "intelligence" | "execution" | "change" | "governance";

export type Incident = {
  incidentId: string;
  title: string;
  description: string;
  incidentType: IncidentType;
  severity: IncidentSeverity;
  priority: IncidentPriority;
  status: IncidentStatus;
  owner: IncidentOwner;
  source: IncidentSource;
  detectedAt: string;
  sourceAnomalyId?: string;
};

export type IncidentClassification = {
  classificationId: string;
  incidentId: string;
  incidentType: IncidentType;
  category: string;
  tags: string[];
};

export type IncidentImpactAssessment = {
  assessmentId: string;
  incidentId: string;
  serviceImpact: number;
  userImpact: number;
  federationImpact: number;
  overallImpact: number;
};

export type UrgencyAssessment = {
  assessmentId: string;
  incidentId: string;
  urgency: IncidentPriority;
  score: number;
  timeToActMinutes: number;
};

export type IncidentRiskAssessment = {
  assessmentId: string;
  incidentId: string;
  riskLevel: IncidentSeverity;
  score: number;
  factors: string[];
};

export type IncidentAssessment = {
  assessmentId: string;
  incidentId: string;
  impact: IncidentImpactAssessment;
  urgency: UrgencyAssessment;
  risk: IncidentRiskAssessment;
  compositeScore: number;
  responseReady: boolean;
};

export type EscalationPolicy = {
  policyId: string;
  name: string;
  autoEscalateAboveSeverity: IncidentSeverity;
  manualEscalateAboveSeverity: IncidentSeverity;
  multiStageThreshold: IncidentPriority;
};

export type EscalationLevel = 1 | 2 | 3 | 4;

export type EscalationDecision = {
  decisionId: string;
  incidentId: string;
  mode: "auto" | "manual" | "multi-stage";
  level: EscalationLevel;
  escalated: boolean;
  reason: string;
  timestamp: string;
};

export type ResponseStage = {
  stageId: string;
  order: number;
  name: string;
  action: string;
  status: IncidentStatus;
};

export type ResponseAction = {
  actionId: string;
  stageId: string;
  name: string;
  category: "contain" | "diagnose" | "remediate" | "recover" | "verify";
};

export type ResponseDependency = {
  dependencyId: string;
  fromStageId: string;
  toStageId: string;
  relation: "requires" | "blocks";
};

export type ResponsePlan = {
  planId: string;
  incidentId: string;
  stages: ResponseStage[];
  actions: ResponseAction[];
  dependencies: ResponseDependency[];
  sequence: number[];
};

export type IncidentTimelineEntry = {
  entryId: string;
  phase: IncidentLifecyclePhase;
  detail: string;
  timestamp: string;
};

export type IncidentTimeline = {
  timelineId: string;
  incidentId: string;
  entries: IncidentTimelineEntry[];
};

export type IncidentTrace = {
  traceId: string;
  events: { event: string; detail: string; timestamp: string }[];
};

export type IncidentEvidence = {
  evidenceId: string;
  incidentId: string;
  artifacts: string[];
};

export type IncidentOutcome = {
  outcomeId: string;
  incidentId: string;
  resolved: boolean;
  escalated: boolean;
  message: string;
};

export type IncidentTrackingBundle = {
  timelines: IncidentTimeline[];
  trace: IncidentTrace;
  evidence: IncidentEvidence;
  outcome: IncidentOutcome;
};

export type IncidentMetrics = {
  metricsId: string;
  incidents: number;
  open: number;
  resolved: number;
  escalated: number;
  critical: number;
  failed: number;
};

export type IncidentSummary = {
  summaryId: string;
  text: string;
};

export type IncidentHealth = {
  healthId: string;
  score: number;
  status: "healthy" | "degraded" | "critical";
};

export type IncidentRiskProfile = {
  profileId: string;
  overallSeverity: IncidentSeverity;
  criticalCount: number;
  highCount: number;
};

export type IncidentReport = {
  reportId: string;
  summary: IncidentSummary;
  health: IncidentHealth;
  riskProfile: IncidentRiskProfile;
};

export type IncidentLifecycleState = {
  lifecycleId: string;
  phases: IncidentLifecyclePhase[];
  currentPhase: IncidentLifecyclePhase;
  closed: boolean;
};

export type AutonomousIncidentManagementRuntimeInput = {
  deploymentId: string;
  intelligence: GovernanceIntelligenceRuntimeResult;
  observability?: FederationObservabilityRuntimeResult;
  execution?: OperationalAutonomousExecutionRuntimeResult;
  change?: AutonomousChangeManagementRuntimeResult;
};

export type AutonomousIncidentManagementRuntimeResult = {
  version: AutonomousIncidentManagementRuntimeVersion;
  registry: { incidentManagementId: string; incidentCount: number };
  lifecycle: IncidentLifecycleState;
  incidents: Incident[];
  classifications: IncidentClassification[];
  assessments: IncidentAssessment[];
  escalations: EscalationDecision[];
  responsePlans: ResponsePlan[];
  tracking: IncidentTrackingBundle;
  metrics: IncidentMetrics;
  report: IncidentReport;
  flags: {
    classification: boolean;
    assessment: boolean;
    escalation: boolean;
    workflow: boolean;
    tracking: boolean;
    metrics: boolean;
    reporting: boolean;
  };
  summary: { summaryId: string; text: string; traceId: string };
  status: IncidentStatus;
};
