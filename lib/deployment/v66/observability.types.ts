/**
 * V66 P3 — Deployment observability baseline types (read-only)
 */

export const V66_DEPLOYMENT_OBSERVABILITY_VERSION = "v66-deployment-observability-1" as const;

export type DeploymentLogLevel = "debug" | "info" | "warn" | "error";

export type DeploymentLogPhase =
  | "baseline"
  | "execution"
  | "observability"
  | "deploy"
  | "health"
  | "verify";

export type StructuredDeploymentLog = {
  schemaVersion: typeof V66_DEPLOYMENT_OBSERVABILITY_VERSION;
  timestamp: string;
  deploymentId: string;
  phase: DeploymentLogPhase;
  eventId: string;
  level: DeploymentLogLevel;
  message: string;
  meta?: Record<string, string | number | boolean>;
};

export type DeploymentObservabilitySignals = {
  executionReady?: boolean;
  logSchemaComplete?: boolean;
  opsEventCatalogComplete?: boolean;
  observabilitySurfaceComplete?: boolean;
};

export type DeploymentLogEventDefinition = {
  id: string;
  phase: DeploymentLogPhase;
  level: DeploymentLogLevel;
  message: string;
  required: boolean;
};

export type OpsEventCategory = "deploy" | "health" | "config" | "verify" | "upstream" | "observability";

export type OpsEventSeverity = "info" | "warn" | "error";

export type OpsEventDefinition = {
  id: string;
  name: string;
  category: OpsEventCategory;
  severity: OpsEventSeverity;
  source: string;
  description: string;
};

export type ObservabilitySurfaceKind = "module" | "script" | "schema" | "frozen-layer";

export type ObservabilitySurfaceEntry = {
  id: string;
  label: string;
  kind: ObservabilitySurfaceKind;
  target: string;
  required: boolean;
  description: string;
};

export type DeploymentLogManifest = {
  version: typeof V66_DEPLOYMENT_OBSERVABILITY_VERSION;
  schemaVersion: string;
  eventCount: number;
  requiredEventCount: number;
  schemaComplete: boolean;
  events: DeploymentLogEventDefinition[];
  summary: string;
};

export type OpsEventManifest = {
  version: typeof V66_DEPLOYMENT_OBSERVABILITY_VERSION;
  eventCount: number;
  categoryCount: number;
  catalogComplete: boolean;
  events: OpsEventDefinition[];
  summary: string;
};

export type ObservabilitySurfaceManifest = {
  version: typeof V66_DEPLOYMENT_OBSERVABILITY_VERSION;
  entryCount: number;
  requiredEntryCount: number;
  surfaceComplete: boolean;
  entries: ObservabilitySurfaceEntry[];
  summary: string;
};

export type DeploymentObservabilityReport = {
  version: typeof V66_DEPLOYMENT_OBSERVABILITY_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  executionVersion: string;
  executionReady: boolean;
  deploymentLogs: DeploymentLogManifest;
  opsEvents: OpsEventManifest;
  observabilitySurface: ObservabilitySurfaceManifest;
  sampleLogs: StructuredDeploymentLog[];
  observabilityReady: boolean;
  readinessScore: number;
  summary: string;
};
