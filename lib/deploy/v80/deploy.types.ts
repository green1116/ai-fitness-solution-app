/**
 * V80 DEPLOY P1 — Launch types
 */
export const V80_DEPLOY_LAUNCH_VERSION = "v80-deploy-launch-1" as const;
export const V80_DEPLOY_LAUNCH_FREEZE_VERSION = "v80-deploy-launch-freeze-1" as const;

export type DeployStructureNode = {
  id: string;
  tier: "edge" | "compute" | "worker" | "queue" | "data";
  component: string;
  path: string;
  scaling: string;
  productionRef: string;
  required: boolean;
};

export type DeployEnvVar = {
  key: string;
  required: boolean;
  secret: boolean;
  forbiddenInProduction?: boolean;
  category: "database" | "runtime" | "security" | "deployment" | "v80";
  description: string;
};

export type RuntimeEntryPoint = {
  id: string;
  kind: "api" | "workflow" | "pdf" | "worker" | "ops";
  name: string;
  path: string;
  startCommand?: string;
  healthProbe?: string;
  required: boolean;
};

export type GoLiveGate = {
  id: string;
  label: string;
  category: "upstream" | "env" | "database" | "runtime" | "verify";
  command?: string;
  required: boolean;
};

export type DeployLaunchManifest = {
  version: typeof V80_DEPLOY_LAUNCH_VERSION;
  codeReleaseVersion: string;
  structureNodes: number;
  envVars: number;
  runtimeEntries: number;
  goLiveGates: number;
  launchComplete: boolean;
  summary: string;
};

export type DeployLaunchReport = {
  version: typeof V80_DEPLOY_LAUNCH_VERSION;
  freezeVersion: typeof V80_DEPLOY_LAUNCH_FREEZE_VERSION;
  reportId: string;
  scaleReady: boolean;
  manifest: DeployLaunchManifest;
  structure: DeployStructureNode[];
  envContract: DeployEnvVar[];
  runtimeEntries: RuntimeEntryPoint[];
  goLiveChecklist: GoLiveGate[];
  launchReady: boolean;
  readinessScore: number;
  summary: string;
};
