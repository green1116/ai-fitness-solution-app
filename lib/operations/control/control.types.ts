/**
 * Post-Launch P7 — Operations Control Plane types
 */

import type {
  COMMAND_CENTER_MODES,
  DOMAIN_HEALTH_LEVELS,
  OPERATIONS_CONTROL_PLANE_BASE,
  OPERATIONS_CONTROL_PLANE_FREEZE_VERSION,
  OPERATIONS_CONTROL_PLANE_ID,
  OPERATIONS_CONTROL_PLANE_VERSION,
  OPS_CONTROL_MANAGER_STATUSES,
  OPS_CONTROL_READINESS_VERDICTS,
  OPS_DECISION_VERDICTS,
  OPS_ORCHESTRATION_DOMAINS,
  OPS_ORCHESTRATION_STATUSES,
} from "./control.constants";

export type OpsOrchestrationStatus =
  (typeof OPS_ORCHESTRATION_STATUSES)[number];
export type OpsOrchestrationDomain =
  (typeof OPS_ORCHESTRATION_DOMAINS)[number];
export type DomainHealthLevel = (typeof DOMAIN_HEALTH_LEVELS)[number];
export type OpsDecisionVerdict = (typeof OPS_DECISION_VERDICTS)[number];
export type CommandCenterMode = (typeof COMMAND_CENTER_MODES)[number];
export type OpsControlReadinessVerdict =
  (typeof OPS_CONTROL_READINESS_VERDICTS)[number];
export type OpsControlManagerStatus =
  (typeof OPS_CONTROL_MANAGER_STATUSES)[number];

export type OpsControlMetadata = Record<string, unknown>;

/** Operations orchestration. */
export type OpsDomainBinding = {
  domain: OpsOrchestrationDomain;
  refId: string;
  label: string;
  present: boolean;
};

export type OperationsOrchestration = {
  id: string;
  name: string;
  productId: string;
  productionOperationId: string;
  customerHealthProfileId?: string;
  operationsIncidentId?: string;
  operationsReleaseId?: string;
  growthDashboardId?: string;
  supportCaseId?: string;
  domains: OpsDomainBinding[];
  status: OpsOrchestrationStatus;
  detail: string;
  metadata: OpsControlMetadata;
  createdAt: string;
  updatedAt: string;
};

export type CreateOperationsOrchestrationInput = {
  id?: string;
  name: string;
  productId: string;
  productionOperationId: string;
  customerHealthProfileId?: string;
  operationsIncidentId?: string;
  operationsReleaseId?: string;
  growthDashboardId?: string;
  supportCaseId?: string;
  detail?: string;
  metadata?: OpsControlMetadata;
};

/** Health aggregation. */
export type DomainHealthRecord = {
  domain: OpsOrchestrationDomain;
  level: DomainHealthLevel;
  score: number;
  detail: string;
};

export type AggregatedOpsHealth = {
  orchestrationId: string;
  domains: DomainHealthRecord[];
  overallLevel: DomainHealthLevel;
  overallScore: number;
  degradedDomains: OpsOrchestrationDomain[];
  computedAt: string;
};

/** Command center. */
export type CommandCenterSnapshot = {
  id: string;
  orchestrationId: string;
  mode: CommandCenterMode;
  openIncidents: number;
  openSupportCases: number;
  activeReleases: number;
  customerAtRisk: number;
  growthScore?: number;
  productionScore?: number;
  alerts: string[];
  detail: string;
  snapshotAt: string;
};

export type BuildCommandCenterInput = {
  id?: string;
  orchestrationId: string;
};

/** Operational decision engine. */
export type OperationalDecision = {
  id: string;
  orchestrationId: string;
  verdict: OpsDecisionVerdict;
  confidence: number;
  reasons: string[];
  recommendedActions: string[];
  decidedAt: string;
};

export type DecideOperationsInput = {
  id?: string;
  orchestrationId: string;
};

/** Executive operations dashboard. */
export type ExecutiveOpsDashboard = {
  id: string;
  orchestrationId: string;
  productId: string;
  health: AggregatedOpsHealth;
  commandCenter: CommandCenterSnapshot;
  decision: OperationalDecision;
  executiveScore: number;
  summary: string;
  builtAt: string;
};

export type BuildExecutiveOpsDashboardInput = {
  id?: string;
  orchestrationId: string;
};

/** Readiness. */
export type OpsControlReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type OpsControlReadinessResult = {
  orchestrationId: string;
  verdict: OpsControlReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: OpsControlReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type OpsControlRegistryManifest = {
  controlPlaneId: typeof OPERATIONS_CONTROL_PLANE_ID;
  version: typeof OPERATIONS_CONTROL_PLANE_VERSION;
  freezeVersion: typeof OPERATIONS_CONTROL_PLANE_FREEZE_VERSION;
  base: typeof OPERATIONS_CONTROL_PLANE_BASE;
  orchestrationCount: number;
  commandCenterCount: number;
  decisionCount: number;
  dashboardCount: number;
};
