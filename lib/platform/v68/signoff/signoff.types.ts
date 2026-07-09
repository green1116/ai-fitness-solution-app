/**
 * V68 P8 — Platform sign-off & freeze types (read-only)
 */
import type { ObservabilityPolicyReport } from "../observability-policy/governance.types";

export const V68_PLATFORM_SIGNOFF_VERSION = "v68-platform-signoff-1" as const;
export const V68_PLATFORM_FREEZE_VERSION = "v68-platform-freeze-1" as const;

export type FreezeChecklistStatus = "pass" | "fail" | "warn" | "na";

export type PlatformSignoffPhase = {
  id: string;
  label: string;
  ok: boolean;
};

export type PlatformSignoffSignals = {
  platformReady?: boolean;
  freezeChecklistPass?: boolean;
  releaseGatesPass?: boolean;
  rollbackSnapshotComplete?: boolean;
  versionLockIntact?: boolean;
};

export type PlatformLayerVersionLock = {
  serviceCatalog: string;
  dependencyGraph: string;
  configurationGovernance: string;
  featureFlagGovernance: string;
  capacityPlanning: string;
  reliabilityPolicy: string;
  observabilityPolicy: string;
  signoff: typeof V68_PLATFORM_SIGNOFF_VERSION;
  freeze: typeof V68_PLATFORM_FREEZE_VERSION;
  upstreamV67MonitoringSignoff: string;
  upstreamV67MonitoringFreeze: string;
};

export type FreezeChecklistItem = {
  id: string;
  label: string;
  status: FreezeChecklistStatus;
  required: boolean;
  notes?: string;
};

export type FreezeChecklistManifest = {
  version: typeof V68_PLATFORM_FREEZE_VERSION;
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
  version: typeof V68_PLATFORM_SIGNOFF_VERSION;
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
  version: typeof V68_PLATFORM_FREEZE_VERSION;
  entryCount: number;
  indexComplete: boolean;
  entries: RollbackSnapshotEntry[];
  summary: string;
};

export type PlatformPhaseReadiness = {
  p1: boolean;
  p2: boolean;
  p3: boolean;
  p4: boolean;
  p5: boolean;
  p6: boolean;
  p7: boolean;
};

export type PlatformFreezeManifest = {
  version: typeof V68_PLATFORM_FREEZE_VERSION;
  freezeId: string;
  frozenAt: string;
  deploymentId: string;
  layerVersionLock: PlatformLayerVersionLock;
  versionLockOk: boolean;
  observabilityPolicy: ObservabilityPolicyReport;
  freezeChecklist: FreezeChecklistManifest;
  rollbackSnapshot: RollbackSnapshotIndex;
  backwardCompatible: boolean;
  frozen: boolean;
  summary: string;
};

export type PlatformSignoffReport = {
  version: typeof V68_PLATFORM_SIGNOFF_VERSION;
  signoffId: string;
  signedOffAt: string;
  deploymentId: string;
  phases: PlatformSignoffPhase[];
  releaseGates: ReleaseGateSummary;
  freeze: PlatformFreezeManifest;
  finalReadinessScore: number;
  allPhasesPass: boolean;
  signedOff: boolean;
  closingSummary: string;
  summary: string;
};
