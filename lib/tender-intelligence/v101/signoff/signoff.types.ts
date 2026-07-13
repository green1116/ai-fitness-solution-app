/**
 * E01-P8 — Enterprise Tender Intelligence Sign-off & Freeze types (read-only)
 */

export const V101_TENDER_SIGNOFF_VERSION = "v101-tender-signoff-1" as const;
export const V101_TENDER_FREEZE_VERSION = "v101-tender-freeze-1" as const;

export type SignoffStateKind = "pass" | "fail" | "ready" | "blocked";

export type Pass = Extract<SignoffStateKind, "pass">;
export type Fail = Extract<SignoffStateKind, "fail">;
export type Ready = Extract<SignoffStateKind, "ready">;
export type Blocked = Extract<SignoffStateKind, "blocked">;

export type FreezeStateKind = "frozen" | "unfrozen" | "blocked";

export type FreezeChecklistStatus = "pass" | "fail" | "warn" | "na";

export type TenderSignoffPhase = {
  id: string;
  label: string;
  state: SignoffStateKind;
  ok: boolean;
};

export type TenderSignoffSignals = {
  tenderReady?: boolean;
  freezeChecklistPass?: boolean;
  tenderGatesPass?: boolean;
  rollbackSnapshotComplete?: boolean;
  versionLockIntact?: boolean;
};

export type LockVersion = {
  intake: string;
  understanding: string;
  intelligence: string;
  strategy: string;
  proposal: string;
  agent: string;
  delivery: string;
  intakeFreeze: string;
  understandingFreeze: string;
  intelligenceFreeze: string;
  strategyFreeze: string;
  proposalFreeze: string;
  agentFreeze: string;
  deliveryFreeze: string;
  signoff: typeof V101_TENDER_SIGNOFF_VERSION;
  freeze: typeof V101_TENDER_FREEZE_VERSION;
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
  version: typeof V101_TENDER_FREEZE_VERSION;
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
  version: typeof V101_TENDER_SIGNOFF_VERSION;
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
  version: typeof V101_TENDER_FREEZE_VERSION;
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

export type DeliveryBaselineSnapshot = {
  ready: boolean;
  reportId: string;
  packageId: string;
  packageStatus: string;
  sealHash: string | null;
  completenessRatio: number;
  readinessScore: number;
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

export type TenderFreezeManifest = {
  version: typeof V101_TENDER_FREEZE_VERSION;
  freezeId: string;
  frozenAt: string;
  deploymentId: string;
  lockVersion: LockVersion;
  versionLockOk: boolean;
  deliveryBaseline: DeliveryBaselineSnapshot;
  freezeChecklist: FreezeChecklist;
  rollbackSnapshot: RollbackSnapshot;
  freezeState: FreezeState;
  summary: string;
};

export type TenderSignoffReport = {
  version: typeof V101_TENDER_SIGNOFF_VERSION;
  signoffId: string;
  signedOffAt: string;
  deploymentId: string;
  phases: TenderSignoffPhase[];
  gateSummary: GateSummary;
  readiness: ReadinessReport;
  freeze: TenderFreezeManifest;
  signoffState: SignoffState;
  closingSummary: string;
  summary: string;
};
