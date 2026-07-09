/**
 * V78 P8 — Execution sign-off & freeze types (read-only)
 */
import type { ExecutionComplianceCatalogReport } from "../execution.compliance";

export const V78_EXECUTION_SIGNOFF_VERSION = "v78-execution-signoff-1" as const;
export const V78_EXECUTION_FREEZE_VERSION = "v78-execution-freeze-1" as const;

export type SignoffStateKind = "pass" | "fail" | "ready" | "blocked";

export type Pass = Extract<SignoffStateKind, "pass">;
export type Fail = Extract<SignoffStateKind, "fail">;
export type Ready = Extract<SignoffStateKind, "ready">;
export type Blocked = Extract<SignoffStateKind, "blocked">;

export type FreezeStateKind = "frozen" | "unfrozen" | "blocked";

export type FreezeChecklistStatus = "pass" | "fail" | "warn" | "na";

export type ExecutionSignoffPhase = {
  id: string;
  label: string;
  state: SignoffStateKind;
  ok: boolean;
};

export type ExecutionSignoffSignals = {
  executionReady?: boolean;
  freezeChecklistPass?: boolean;
  executionGatesPass?: boolean;
  rollbackSnapshotComplete?: boolean;
  versionLockIntact?: boolean;
};

export type LockVersion = {
  executionInventory: string;
  executionPolicy: string;
  executionContext: string;
  executionConstraint: string;
  executionEvaluation: string;
  executionSimulation: string;
  executionCompliance: string;
  signoff: typeof V78_EXECUTION_SIGNOFF_VERSION;
  freeze: typeof V78_EXECUTION_FREEZE_VERSION;
  upstreamV77PlanningSignoff: string;
  upstreamV77PlanningFreeze: string;
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
  version: typeof V78_EXECUTION_FREEZE_VERSION;
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
  version: typeof V78_EXECUTION_SIGNOFF_VERSION;
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
  version: typeof V78_EXECUTION_FREEZE_VERSION;
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

export type ExecutionFreezeManifest = {
  version: typeof V78_EXECUTION_FREEZE_VERSION;
  freezeId: string;
  frozenAt: string;
  deploymentId: string;
  lockVersion: LockVersion;
  versionLockOk: boolean;
  executionCompliance: ExecutionComplianceCatalogReport;
  freezeChecklist: FreezeChecklist;
  rollbackSnapshot: RollbackSnapshot;
  freezeState: FreezeState;
  summary: string;
};

export type ExecutionSignoffReport = {
  version: typeof V78_EXECUTION_SIGNOFF_VERSION;
  signoffId: string;
  signedOffAt: string;
  deploymentId: string;
  phases: ExecutionSignoffPhase[];
  gateSummary: GateSummary;
  readiness: ReadinessReport;
  freeze: ExecutionFreezeManifest;
  signoffState: SignoffState;
  closingSummary: string;
  summary: string;
};
