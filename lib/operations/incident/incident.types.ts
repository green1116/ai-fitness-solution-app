/**
 * Post-Launch P3 — Incident Response Operations types
 */

import type {
  ESCALATION_STEP_STATUSES,
  ESCALATION_WORKFLOW_STEPS,
  INCIDENT_IMPACT_LEVELS,
  INCIDENT_MANAGER_STATUSES,
  INCIDENT_READINESS_VERDICTS,
  INCIDENT_URGENCY_LEVELS,
  OPERATIONS_INCIDENT_RESPONSE_BASE,
  OPERATIONS_INCIDENT_RESPONSE_FREEZE_VERSION,
  OPERATIONS_INCIDENT_RESPONSE_ID,
  OPERATIONS_INCIDENT_RESPONSE_VERSION,
  OPERATIONS_INCIDENT_SEVERITIES,
  OPERATIONS_INCIDENT_STATUSES,
  RESOLUTION_OUTCOMES,
} from "./incident.constants";

export type OperationsIncidentSeverity =
  (typeof OPERATIONS_INCIDENT_SEVERITIES)[number];
export type OperationsIncidentStatus =
  (typeof OPERATIONS_INCIDENT_STATUSES)[number];
export type IncidentImpactLevel = (typeof INCIDENT_IMPACT_LEVELS)[number];
export type IncidentUrgencyLevel = (typeof INCIDENT_URGENCY_LEVELS)[number];
export type EscalationWorkflowStep = (typeof ESCALATION_WORKFLOW_STEPS)[number];
export type EscalationStepStatus = (typeof ESCALATION_STEP_STATUSES)[number];
export type ResolutionOutcome = (typeof RESOLUTION_OUTCOMES)[number];
export type IncidentReadinessVerdict =
  (typeof INCIDENT_READINESS_VERDICTS)[number];
export type IncidentManagerStatus = (typeof INCIDENT_MANAGER_STATUSES)[number];

export type IncidentMetadata = Record<string, unknown>;

/** Incident model. */
export type OperationsIncident = {
  id: string;
  title: string;
  productId: string;
  productionOperationId: string;
  supportSlaProfileId: string;
  customerHealthProfileId?: string;
  supportIncidentId?: string;
  impact: IncidentImpactLevel;
  urgency: IncidentUrgencyLevel;
  severity: OperationsIncidentSeverity;
  status: OperationsIncidentStatus;
  detail: string;
  metadata: IncidentMetadata;
  openedAt: string;
  acknowledgedAt?: string;
  escalatedAt?: string;
  resolvedAt?: string;
  closedAt?: string;
  updatedAt: string;
};

export type OpenOperationsIncidentInput = {
  id?: string;
  title: string;
  productId: string;
  productionOperationId: string;
  supportSlaProfileId: string;
  customerHealthProfileId?: string;
  impact?: IncidentImpactLevel;
  urgency?: IncidentUrgencyLevel;
  severity?: OperationsIncidentSeverity;
  detail?: string;
  metadata?: IncidentMetadata;
};

/** Severity classification. */
export type SeverityClassification = {
  impact: IncidentImpactLevel;
  urgency: IncidentUrgencyLevel;
  severity: OperationsIncidentSeverity;
  score: number;
  detail: string;
};

export type ClassifySeverityInput = {
  impact: IncidentImpactLevel;
  urgency: IncidentUrgencyLevel;
};

/** Escalation workflow. */
export type EscalationStepRecord = {
  step: EscalationWorkflowStep;
  status: EscalationStepStatus;
  detail: string;
  completedAt?: string;
};

export type EscalationWorkflow = {
  id: string;
  operationsIncidentId: string;
  steps: EscalationStepRecord[];
  currentStep?: EscalationWorkflowStep;
  complete: boolean;
  failed: boolean;
  updatedAt: string;
};

export type StartEscalationWorkflowInput = {
  id?: string;
  operationsIncidentId: string;
};

/** Resolution tracking. */
export type IncidentResolution = {
  id: string;
  operationsIncidentId: string;
  outcome: ResolutionOutcome;
  detail: string;
  resolvedBy: string;
  responseMinutes: number;
  resolutionMinutes: number;
  auditEntryId?: string;
  resolvedAt: string;
};

export type RecordIncidentResolutionInput = {
  id?: string;
  operationsIncidentId: string;
  outcome: ResolutionOutcome;
  detail?: string;
  resolvedBy?: string;
};

/** Incident metrics. */
export type IncidentMetrics = {
  productionOperationId?: string;
  supportSlaProfileId?: string;
  incidentCount: number;
  openCount: number;
  escalatedCount: number;
  resolvedCount: number;
  closedCount: number;
  sev1Count: number;
  sev2Count: number;
  avgResponseMinutes?: number;
  avgResolutionMinutes?: number;
  escalationCompleteRate: number;
  mttrScore: number;
  computedAt: string;
};

/** Readiness. */
export type IncidentReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type IncidentReadinessResult = {
  operationsIncidentId: string;
  verdict: IncidentReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: IncidentReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type IncidentRegistryManifest = {
  incidentResponseId: typeof OPERATIONS_INCIDENT_RESPONSE_ID;
  version: typeof OPERATIONS_INCIDENT_RESPONSE_VERSION;
  freezeVersion: typeof OPERATIONS_INCIDENT_RESPONSE_FREEZE_VERSION;
  base: typeof OPERATIONS_INCIDENT_RESPONSE_BASE;
  incidentCount: number;
  escalationCount: number;
  resolutionCount: number;
};
