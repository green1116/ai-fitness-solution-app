/**
 * V67 P8 — Monitoring sign-off & freeze types (read-only)
 */
import type { PostmortemFoundationReport } from "../postmortem/governance.types";

export const V67_MONITORING_SIGNOFF_VERSION = "v67-monitoring-signoff-1" as const;
export const V67_MONITORING_FREEZE_VERSION = "v67-monitoring-freeze-1" as const;

export type FreezeChecklistStatus = "pass" | "fail" | "warn" | "na";

export type MonitoringSignoffPhase = {
  id: string;
  label: string;
  ok: boolean;
};

export type MonitoringSignoffSignals = {
  monitoringReady?: boolean;
  freezeChecklistPass?: boolean;
  releaseGatesPass?: boolean;
  rollbackSnapshotComplete?: boolean;
  versionLockIntact?: boolean;
};

export type MonitoringLayerVersionLock = {
  foundation: string;
  incidentLifecycle: string;
  alertTaxonomy: string;
  sloGovernance: string;
  oncallGovernance: string;
  observabilityDashboard: string;
  postmortemFoundation: string;
  signoff: typeof V67_MONITORING_SIGNOFF_VERSION;
  freeze: typeof V67_MONITORING_FREEZE_VERSION;
  upstreamV66DeploymentSignoff: string;
  upstreamV66DeploymentFreeze: string;
  upstreamV65ProductionSignoff: string;
  upstreamV64CommercialFreeze: string;
};

export type FreezeChecklistItem = {
  id: string;
  label: string;
  status: FreezeChecklistStatus;
  required: boolean;
  notes?: string;
};

export type FreezeChecklistManifest = {
  version: typeof V67_MONITORING_FREEZE_VERSION;
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
  version: typeof V67_MONITORING_SIGNOFF_VERSION;
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
  version: typeof V67_MONITORING_FREEZE_VERSION;
  entryCount: number;
  indexComplete: boolean;
  entries: RollbackSnapshotEntry[];
  summary: string;
};

export type MonitoringPhaseReadiness = {
  p1: boolean;
  p2: boolean;
  p3: boolean;
  p4: boolean;
  p5: boolean;
  p6: boolean;
  p7: boolean;
};

export type MonitoringFreezeManifest = {
  version: typeof V67_MONITORING_FREEZE_VERSION;
  freezeId: string;
  frozenAt: string;
  deploymentId: string;
  layerVersionLock: MonitoringLayerVersionLock;
  versionLockOk: boolean;
  postmortem: PostmortemFoundationReport;
  freezeChecklist: FreezeChecklistManifest;
  rollbackSnapshot: RollbackSnapshotIndex;
  backwardCompatible: boolean;
  frozen: boolean;
  summary: string;
};

export type MonitoringSignoffReport = {
  version: typeof V67_MONITORING_SIGNOFF_VERSION;
  signoffId: string;
  signedOffAt: string;
  deploymentId: string;
  phases: MonitoringSignoffPhase[];
  releaseGates: ReleaseGateSummary;
  freeze: MonitoringFreezeManifest;
  finalReadinessScore: number;
  allPhasesPass: boolean;
  signedOff: boolean;
  closingSummary: string;
  summary: string;
};
