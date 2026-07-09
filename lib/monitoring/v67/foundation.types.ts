/**
 * V67 P1 — Monitoring & incident response foundation types (read-only)
 */

export const V67_MONITORING_FOUNDATION_VERSION = "v67-monitoring-foundation-1" as const;

export type MonitoringEnvironment = "production" | "staging" | "development";

export type AlertSeverity = "critical" | "high" | "medium" | "low" | "info";

export type AlertChannelKind = "email" | "webhook" | "oncall" | "declarative";

export type IncidentEventKind =
  | "availability"
  | "latency"
  | "error-rate"
  | "security"
  | "deployment"
  | "slo-breach";

export type IncidentStatus = "open" | "acknowledged" | "mitigating" | "resolved";

export type SloMeasurementWindow = "5m" | "1h" | "24h" | "30d";

export type OncallTier = "primary" | "secondary" | "escalation" | "executive";

export type MonitoringFoundationSignals = {
  v66DeploymentClosed?: boolean;
  alertContractComplete?: boolean;
  eventContractComplete?: boolean;
  sloContractComplete?: boolean;
  oncallContractComplete?: boolean;
  upstreamFrozenIntact?: boolean;
};

export type AlertRuleDefinition = {
  id: string;
  name: string;
  severity: AlertSeverity;
  channel: AlertChannelKind;
  signal: string;
  required: boolean;
  description: string;
};

export type AlertContractManifest = {
  version: typeof V67_MONITORING_FOUNDATION_VERSION;
  ruleCount: number;
  severityCount: number;
  contractComplete: boolean;
  rules: AlertRuleDefinition[];
  summary: string;
};

export type IncidentEventDefinition = {
  id: string;
  kind: IncidentEventKind;
  severity: AlertSeverity;
  status: IncidentStatus;
  source: string;
  required: boolean;
  description: string;
};

export type EventContractManifest = {
  version: typeof V67_MONITORING_FOUNDATION_VERSION;
  eventCount: number;
  kindCount: number;
  contractComplete: boolean;
  events: IncidentEventDefinition[];
  summary: string;
};

export type SliDefinition = {
  id: string;
  name: string;
  measurement: string;
  window: SloMeasurementWindow;
  target: number;
  unit: string;
  required: boolean;
};

export type SloDefinition = {
  id: string;
  name: string;
  sliRef: string;
  objective: number;
  window: SloMeasurementWindow;
  required: boolean;
  description: string;
};

export type SloContractManifest = {
  version: typeof V67_MONITORING_FOUNDATION_VERSION;
  sliCount: number;
  sloCount: number;
  contractComplete: boolean;
  slis: SliDefinition[];
  slos: SloDefinition[];
  summary: string;
};

export type OncallRotationEntry = {
  id: string;
  tier: OncallTier;
  role: string;
  escalationMinutes: number;
  required: boolean;
  description: string;
};

export type OncallContractManifest = {
  version: typeof V67_MONITORING_FOUNDATION_VERSION;
  entryCount: number;
  tierCount: number;
  contractComplete: boolean;
  rotations: OncallRotationEntry[];
  summary: string;
};

export type UpstreamFrozenMonitoringLock = {
  v66DeploymentSignoff: string;
  v66DeploymentFreeze: string;
  v65ProductionSignoff: string;
  v64CommercialFreeze: string;
};

export type MonitoringFoundationReport = {
  version: typeof V67_MONITORING_FOUNDATION_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  environment: MonitoringEnvironment;
  upstreamFrozen: UpstreamFrozenMonitoringLock;
  upstreamFrozenIntact: boolean;
  alertContract: AlertContractManifest;
  eventContract: EventContractManifest;
  sloContract: SloContractManifest;
  oncallContract: OncallContractManifest;
  contractsComplete: boolean;
  foundationReady: boolean;
  readinessScore: number;
  summary: string;
};
