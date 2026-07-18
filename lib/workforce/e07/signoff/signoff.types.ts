/**
 * E07-P8 — Digital Workforce Governance Sign-off & Freeze types (read-only)
 */

export const E07_WORKFORCE_SIGNOFF_VERSION =
  "e07-workforce-signoff-1" as const;
export const E07_WORKFORCE_PLATFORM_FREEZE_VERSION =
  "e07-workforce-platform-freeze-1" as const;

export type SignoffStateKind = "pass" | "fail" | "ready" | "blocked";

export type Pass = Extract<SignoffStateKind, "pass">;
export type Fail = Extract<SignoffStateKind, "fail">;
export type Ready = Extract<SignoffStateKind, "ready">;
export type Blocked = Extract<SignoffStateKind, "blocked">;

export type FreezeStateKind = "frozen" | "unfrozen" | "blocked";

export type FreezeChecklistStatus = "pass" | "fail" | "warn" | "na";

export type WorkforceSignoffPhase = {
  id: string;
  label: string;
  state: SignoffStateKind;
  ok: boolean;
};

export type WorkforceSignoffSignals = {
  platformReady?: boolean;
  freezeChecklistPass?: boolean;
  platformGatesPass?: boolean;
  rollbackSnapshotComplete?: boolean;
  versionLockIntact?: boolean;
};

export type LockVersion = {
  workforce: string;
  employee: string;
  marketplace: string;
  orchestration: string;
  collaboration: string;
  learning: string;
  organization: string;
  workforceFreeze: string;
  employeeFreeze: string;
  marketplaceFreeze: string;
  orchestrationFreeze: string;
  collaborationFreeze: string;
  learningFreeze: string;
  organizationFreeze: string;
  signoff: typeof E07_WORKFORCE_SIGNOFF_VERSION;
  freeze: typeof E07_WORKFORCE_PLATFORM_FREEZE_VERSION;
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
  version: typeof E07_WORKFORCE_PLATFORM_FREEZE_VERSION;
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
  version: typeof E07_WORKFORCE_SIGNOFF_VERSION;
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
  version: typeof E07_WORKFORCE_PLATFORM_FREEZE_VERSION;
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

export type OrganizationBaselineSnapshot = {
  ready: boolean;
  organizationId: string;
  kind: string;
  mission: string;
  unitCount: number;
  completedUnits: number;
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

export type WorkforceFreezeManifest = {
  version: typeof E07_WORKFORCE_PLATFORM_FREEZE_VERSION;
  freezeId: string;
  frozenAt: string;
  deploymentId: string;
  lockVersion: LockVersion;
  versionLockOk: boolean;
  organizationBaseline: OrganizationBaselineSnapshot;
  freezeChecklist: FreezeChecklist;
  rollbackSnapshot: RollbackSnapshot;
  freezeState: FreezeState;
  summary: string;
};

export type WorkforceSignoffReport = {
  version: typeof E07_WORKFORCE_SIGNOFF_VERSION;
  signoffId: string;
  signedOffAt: string;
  deploymentId: string;
  phases: WorkforceSignoffPhase[];
  gateSummary: GateSummary;
  readiness: ReadinessReport;
  freeze: WorkforceFreezeManifest;
  signoffState: SignoffState;
  closingSummary: string;
  summary: string;
};
