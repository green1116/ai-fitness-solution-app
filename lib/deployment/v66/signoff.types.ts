/**
 * V66 P8 — Deployment sign-off & freeze types (read-only)
 */
import type { DeploymentOpsReport } from "./ops.types";

export const V66_DEPLOYMENT_SIGNOFF_VERSION = "v66-deployment-signoff-1" as const;
export const V66_DEPLOYMENT_FREEZE_VERSION = "v66-deployment-freeze-1" as const;

export type FreezeChecklistStatus = "pass" | "fail" | "warn" | "na";

export type DeploymentSignoffPhase = {
  id: string;
  label: string;
  ok: boolean;
};

export type DeploymentSignoffSignals = {
  opsReady?: boolean;
  freezeChecklistPass?: boolean;
  releaseGatesPass?: boolean;
  rollbackSnapshotComplete?: boolean;
  versionLockIntact?: boolean;
};

export type DeploymentLayerVersionLock = {
  baseline: string;
  execution: string;
  observability: string;
  releaseOrchestration: string;
  security: string;
  dr: string;
  ops: string;
  signoff: typeof V66_DEPLOYMENT_SIGNOFF_VERSION;
  freeze: typeof V66_DEPLOYMENT_FREEZE_VERSION;
  upstreamV65Signoff: string;
  upstreamV64Commercial: string;
};

export type FreezeChecklistItem = {
  id: string;
  label: string;
  status: FreezeChecklistStatus;
  required: boolean;
  notes?: string;
};

export type FreezeChecklistManifest = {
  version: typeof V66_DEPLOYMENT_FREEZE_VERSION;
  itemCount: number;
  passCount: number;
  checklistPass: boolean;
  items: FreezeChecklistItem[];
  summary: string;
};

export type ReleaseGateEntry = {
  id: string;
  phase: string;
  label: string;
  ok: boolean;
  verifyScript: string;
};

export type ReleaseGateSummary = {
  version: typeof V66_DEPLOYMENT_SIGNOFF_VERSION;
  gateCount: number;
  passCount: number;
  allGatesPass: boolean;
  gates: ReleaseGateEntry[];
  summary: string;
};

export type RollbackSnapshotEntry = {
  id: string;
  layer: string;
  snapshotPath: string;
  rollbackAction: string;
  required: boolean;
};

export type RollbackSnapshotIndex = {
  version: typeof V66_DEPLOYMENT_FREEZE_VERSION;
  entryCount: number;
  indexComplete: boolean;
  entries: RollbackSnapshotEntry[];
  summary: string;
};

export type DeploymentFreezeManifest = {
  version: typeof V66_DEPLOYMENT_FREEZE_VERSION;
  freezeId: string;
  frozenAt: string;
  deploymentId: string;
  layerVersionLock: DeploymentLayerVersionLock;
  versionLockOk: boolean;
  ops: DeploymentOpsReport;
  freezeChecklist: FreezeChecklistManifest;
  rollbackSnapshot: RollbackSnapshotIndex;
  backwardCompatible: boolean;
  frozen: boolean;
  summary: string;
};

export type DeploymentSignoffReport = {
  version: typeof V66_DEPLOYMENT_SIGNOFF_VERSION;
  signoffId: string;
  signedOffAt: string;
  deploymentId: string;
  phases: DeploymentSignoffPhase[];
  releaseGates: ReleaseGateSummary;
  freeze: DeploymentFreezeManifest;
  finalReadinessScore: number;
  allPhasesPass: boolean;
  signedOff: boolean;
  closingSummary: string;
  summary: string;
};
