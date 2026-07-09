/**
 * V66 P1 — Deployment baseline & env contract types (read-only)
 */

export const V66_DEPLOYMENT_BASELINE_VERSION = "v66-deployment-baseline-1" as const;

export type DeploymentTarget = "production" | "staging" | "development";

export type ChecklistStatus = "pass" | "fail" | "warn" | "na";

export type UpstreamFrozenLayerLock = {
  v65ProductionSignoff: string;
  v65ProductionFreeze: string;
  v64CommercialFreeze: string;
};

export type DeploymentBaselineSignals = {
  v65ProductionClosed?: boolean;
  envContractComplete?: boolean;
  requiredSecretsConfigured?: boolean;
  forbiddenFlagsClear?: boolean;
  runtimeSurfaceComplete?: boolean;
  verifyChainPass?: boolean;
};

export type DeploymentBaselineReport = {
  version: typeof V66_DEPLOYMENT_BASELINE_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  targetEnvironment: DeploymentTarget;
  upstreamFrozen: UpstreamFrozenLayerLock;
  upstreamFrozenIntact: boolean;
  envContract: import("./env.contract").EnvContractManifest;
  deploymentChecklist: import("./deployment.checklist").DeploymentChecklistItem[];
  runtimeConfigSurface: import("./runtime.surface").RuntimeConfigSurfaceManifest;
  checklistPassCount: number;
  checklistRequiredCount: number;
  contractComplete: boolean;
  deploymentReady: boolean;
  readinessScore: number;
  summary: string;
};
