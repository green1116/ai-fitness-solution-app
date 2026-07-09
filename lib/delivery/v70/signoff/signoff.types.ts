/**
 * V70 P8 — Delivery sign-off & freeze types (read-only)
 */
import type { DeliveryComplianceReport } from "../delivery.compliance";

export const V70_DELIVERY_SIGNOFF_VERSION = "v70-delivery-signoff-1" as const;
export const V70_DELIVERY_FREEZE_VERSION = "v70-delivery-freeze-1" as const;

export type SignoffStateKind = "pass" | "fail" | "ready" | "blocked";

export type FreezeStateKind = "frozen" | "unfrozen" | "blocked";

export type FreezeChecklistStatus = "pass" | "fail" | "warn" | "na";

export type DeliverySignoffPhase = {
  id: string;
  label: string;
  state: SignoffStateKind;
  ok: boolean;
};

export type DeliverySignoffSignals = {
  deliveryReady?: boolean;
  freezeChecklistPass?: boolean;
  releaseGatesPass?: boolean;
  rollbackSnapshotComplete?: boolean;
  versionLockIntact?: boolean;
};

export type LockVersion = {
  releaseCatalog: string;
  releaseDependency: string;
  releasePolicy: string;
  versionCompatibility: string;
  upgradeGovernance: string;
  lifecycleManagement: string;
  deliveryCompliance: string;
  signoff: typeof V70_DELIVERY_SIGNOFF_VERSION;
  freeze: typeof V70_DELIVERY_FREEZE_VERSION;
  upstreamV69TechnicalGovernanceSignoff: string;
  upstreamV69TechnicalGovernanceFreeze: string;
};

export type FreezeChecklistItem = {
  id: string;
  label: string;
  status: FreezeChecklistStatus;
  state: SignoffStateKind;
  required: boolean;
  notes?: string;
};

export type FreezeChecklist = {
  version: typeof V70_DELIVERY_FREEZE_VERSION;
  itemCount: number;
  passCount: number;
  failCount: number;
  checklistPass: boolean;
  items: FreezeChecklistItem[];
  summary: string;
};

export type GateSummaryEntry = {
  id: string;
  phase: string;
  label: string;
  state: SignoffStateKind;
  ok: boolean;
  verifyScript: string;
};

export type GateSummary = {
  version: typeof V70_DELIVERY_SIGNOFF_VERSION;
  gateCount: number;
  passCount: number;
  failCount: number;
  allGatesPass: boolean;
  gates: GateSummaryEntry[];
  summary: string;
};

export type RollbackSnapshotEntry = {
  id: string;
  layer: string;
  snapshotPath: string;
  rollbackAction: string;
  required: boolean;
};

export type RollbackSnapshot = {
  version: typeof V70_DELIVERY_FREEZE_VERSION;
  entryCount: number;
  indexComplete: boolean;
  entries: RollbackSnapshotEntry[];
  summary: string;
};

export type ReadinessReport = {
  p1: boolean;
  p2: boolean;
  p3: boolean;
  p4: boolean;
  p5: boolean;
  p6: boolean;
  p7: boolean;
  ready: boolean;
  blocked: boolean;
  summary: string;
};

export type SignoffState = {
  signedOff: boolean;
  allPhasesPass: boolean;
  finalReadinessScore: number;
  state: SignoffStateKind;
};

export type FreezeState = {
  frozen: boolean;
  backwardCompatible: boolean;
  versionLockOk: boolean;
  state: FreezeStateKind;
};

export type DeliveryFreezeManifest = {
  version: typeof V70_DELIVERY_FREEZE_VERSION;
  freezeId: string;
  frozenAt: string;
  deploymentId: string;
  lockVersion: LockVersion;
  versionLockOk: boolean;
  deliveryCompliance: DeliveryComplianceReport;
  freezeChecklist: FreezeChecklist;
  rollbackSnapshot: RollbackSnapshot;
  freezeState: FreezeState;
  summary: string;
};

export type DeliverySignoffReport = {
  version: typeof V70_DELIVERY_SIGNOFF_VERSION;
  signoffId: string;
  signedOffAt: string;
  deploymentId: string;
  phases: DeliverySignoffPhase[];
  gateSummary: GateSummary;
  readiness: ReadinessReport;
  freeze: DeliveryFreezeManifest;
  signoffState: SignoffState;
  closingSummary: string;
  summary: string;
};
