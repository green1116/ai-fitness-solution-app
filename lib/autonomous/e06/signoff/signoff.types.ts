/**
 * E06-P8 — Autonomous Enterprise OS Governance Sign-off & Freeze types (read-only)
 */

export const E06_AUTONOMOUS_SIGNOFF_VERSION =
  "e06-autonomous-signoff-1" as const;
export const E06_AUTONOMOUS_OS_FREEZE_VERSION =
  "e06-autonomous-os-freeze-1" as const;

export type SignoffStateKind = "pass" | "fail" | "ready" | "blocked";

export type Pass = Extract<SignoffStateKind, "pass">;
export type Fail = Extract<SignoffStateKind, "fail">;
export type Ready = Extract<SignoffStateKind, "ready">;
export type Blocked = Extract<SignoffStateKind, "blocked">;

export type FreezeStateKind = "frozen" | "unfrozen" | "blocked";

export type FreezeChecklistStatus = "pass" | "fail" | "warn" | "na";

export type AutonomousSignoffPhase = {
  id: string;
  label: string;
  state: SignoffStateKind;
  ok: boolean;
};

export type AutonomousSignoffSignals = {
  platformReady?: boolean;
  freezeChecklistPass?: boolean;
  platformGatesPass?: boolean;
  rollbackSnapshotComplete?: boolean;
  versionLockIntact?: boolean;
};

export type LockVersion = {
  operation: string;
  action: string;
  workflow: string;
  control: string;
  optimization: string;
  twin: string;
  agent: string;
  operationFreeze: string;
  actionFreeze: string;
  workflowFreeze: string;
  controlFreeze: string;
  optimizationFreeze: string;
  twinFreeze: string;
  agentFreeze: string;
  signoff: typeof E06_AUTONOMOUS_SIGNOFF_VERSION;
  freeze: typeof E06_AUTONOMOUS_OS_FREEZE_VERSION;
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
  version: typeof E06_AUTONOMOUS_OS_FREEZE_VERSION;
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
  version: typeof E06_AUTONOMOUS_SIGNOFF_VERSION;
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
  version: typeof E06_AUTONOMOUS_OS_FREEZE_VERSION;
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

export type AgentBaselineSnapshot = {
  ready: boolean;
  agentId: string;
  twinId: string;
  mission: string;
  posture: string;
  directiveCount: number;
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

export type AutonomousFreezeManifest = {
  version: typeof E06_AUTONOMOUS_OS_FREEZE_VERSION;
  freezeId: string;
  frozenAt: string;
  deploymentId: string;
  lockVersion: LockVersion;
  versionLockOk: boolean;
  agentBaseline: AgentBaselineSnapshot;
  freezeChecklist: FreezeChecklist;
  rollbackSnapshot: RollbackSnapshot;
  freezeState: FreezeState;
  summary: string;
};

export type AutonomousSignoffReport = {
  version: typeof E06_AUTONOMOUS_SIGNOFF_VERSION;
  signoffId: string;
  signedOffAt: string;
  deploymentId: string;
  phases: AutonomousSignoffPhase[];
  gateSummary: GateSummary;
  readiness: ReadinessReport;
  freeze: AutonomousFreezeManifest;
  signoffState: SignoffState;
  closingSummary: string;
  summary: string;
};
