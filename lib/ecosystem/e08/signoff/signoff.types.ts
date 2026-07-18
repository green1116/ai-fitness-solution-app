/**
 * E08-P8 — Autonomous Enterprise Ecosystem Governance Sign-off & Freeze types (read-only)
 * BASE: enterprise-e08-p7-enterprise-network-os-v1
 */

export const E08_ECOSYSTEM_SIGNOFF_VERSION =
  "e08-ecosystem-signoff-1" as const;
export const E08_ECOSYSTEM_PLATFORM_FREEZE_VERSION =
  "e08-ecosystem-platform-freeze-1" as const;

export type SignoffStateKind = "pass" | "fail" | "ready" | "blocked";

export type Pass = Extract<SignoffStateKind, "pass">;
export type Fail = Extract<SignoffStateKind, "fail">;
export type Ready = Extract<SignoffStateKind, "ready">;
export type Blocked = Extract<SignoffStateKind, "blocked">;

export type FreezeStateKind = "frozen" | "unfrozen" | "blocked";

export type FreezeChecklistStatus = "pass" | "fail" | "warn" | "na";

export type EcosystemSignoffPhase = {
  id: string;
  label: string;
  state: SignoffStateKind;
  ok: boolean;
};

export type EcosystemSignoffSignals = {
  platformReady?: boolean;
  freezeChecklistPass?: boolean;
  platformGatesPass?: boolean;
  rollbackSnapshotComplete?: boolean;
  versionLockIntact?: boolean;
};

export type LockVersion = {
  ecosystem: string;
  network: string;
  exchange: string;
  workflow: string;
  intelligence: string;
  market: string;
  networkOs: string;
  ecosystemFreeze: string;
  networkFreeze: string;
  exchangeFreeze: string;
  workflowFreeze: string;
  intelligenceFreeze: string;
  marketFreeze: string;
  networkOsFreeze: string;
  signoff: typeof E08_ECOSYSTEM_SIGNOFF_VERSION;
  freeze: typeof E08_ECOSYSTEM_PLATFORM_FREEZE_VERSION;
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
  version: typeof E08_ECOSYSTEM_PLATFORM_FREEZE_VERSION;
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
  version: typeof E08_ECOSYSTEM_SIGNOFF_VERSION;
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
  version: typeof E08_ECOSYSTEM_PLATFORM_FREEZE_VERSION;
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

export type NetworkOsBaselineSnapshot = {
  ready: boolean;
  networkOsId: string;
  kind: string;
  mission: string;
  slotCount: number;
  completedSlots: number;
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

export type EcosystemFreezeManifest = {
  version: typeof E08_ECOSYSTEM_PLATFORM_FREEZE_VERSION;
  freezeId: string;
  frozenAt: string;
  deploymentId: string;
  lockVersion: LockVersion;
  versionLockOk: boolean;
  networkOsBaseline: NetworkOsBaselineSnapshot;
  freezeChecklist: FreezeChecklist;
  rollbackSnapshot: RollbackSnapshot;
  freezeState: FreezeState;
  summary: string;
};

export type EcosystemSignoffReport = {
  version: typeof E08_ECOSYSTEM_SIGNOFF_VERSION;
  signoffId: string;
  signedOffAt: string;
  deploymentId: string;
  phases: EcosystemSignoffPhase[];
  gateSummary: GateSummary;
  readiness: ReadinessReport;
  freeze: EcosystemFreezeManifest;
  signoffState: SignoffState;
  closingSummary: string;
  summary: string;
};
