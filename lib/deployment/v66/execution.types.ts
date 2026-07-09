/**
 * V66 P2 — Deployment execution & health check types (read-only)
 */

export const V66_DEPLOYMENT_EXECUTION_VERSION = "v66-deployment-execution-1" as const;

export type HealthCheckStatus = "pass" | "fail" | "warn" | "skip";

export type HealthCheckSeverity = "critical" | "high" | "medium" | "low";

export type HealthCheckCategory =
  | "upstream"
  | "config"
  | "build"
  | "process"
  | "probe";

export type DeploymentExecutionSignals = {
  baselineReady?: boolean;
  requiredSecretsConfigured?: boolean;
  forbiddenFlagsClear?: boolean;
  prismaClientGenerated?: boolean;
  databaseReachable?: boolean;
  buildArtifactsPresent?: boolean;
  lockfilePresent?: boolean;
  nodeEngineDeclared?: boolean;
  startupSequenceComplete?: boolean;
  probeSurfaceComplete?: boolean;
};

export type HealthCheckResult = {
  id: string;
  label: string;
  category: HealthCheckCategory;
  severity: HealthCheckSeverity;
  status: HealthCheckStatus;
  required: boolean;
  notes?: string;
};

export type StartupVerificationStep = {
  id: string;
  order: number;
  label: string;
  status: HealthCheckStatus;
  required: boolean;
  notes?: string;
};

export type ReadinessProbeKind = "http" | "script" | "module" | "frozen-layer";

export type ReadinessProbeEntry = {
  id: string;
  label: string;
  kind: ReadinessProbeKind;
  target: string;
  method?: string;
  required: boolean;
  description: string;
};

export type HealthCheckManifest = {
  version: typeof V66_DEPLOYMENT_EXECUTION_VERSION;
  checkCount: number;
  passCount: number;
  requiredPass: boolean;
  checks: HealthCheckResult[];
  summary: string;
};

export type StartupVerificationManifest = {
  version: typeof V66_DEPLOYMENT_EXECUTION_VERSION;
  stepCount: number;
  passCount: number;
  sequenceComplete: boolean;
  steps: StartupVerificationStep[];
  summary: string;
};

export type ReadinessProbeManifest = {
  version: typeof V66_DEPLOYMENT_EXECUTION_VERSION;
  probeCount: number;
  requiredProbeCount: number;
  surfaceComplete: boolean;
  probes: ReadinessProbeEntry[];
  summary: string;
};

export type DeploymentExecutionReport = {
  version: typeof V66_DEPLOYMENT_EXECUTION_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  baselineVersion: string;
  baselineReady: boolean;
  healthChecks: HealthCheckManifest;
  startupVerification: StartupVerificationManifest;
  readinessProbes: ReadinessProbeManifest;
  executionReady: boolean;
  readinessScore: number;
  summary: string;
};
