/**
 * E05-P8 — Intelligence Governance Sign-off & Freeze types (read-only)
 */

export const E05_INTELLIGENCE_SIGNOFF_VERSION =
  "e05-intelligence-signoff-1" as const;
export const E05_INTELLIGENCE_PLATFORM_FREEZE_VERSION =
  "e05-intelligence-platform-freeze-1" as const;

export type SignoffStateKind = "pass" | "fail" | "ready" | "blocked";

export type Pass = Extract<SignoffStateKind, "pass">;
export type Fail = Extract<SignoffStateKind, "fail">;
export type Ready = Extract<SignoffStateKind, "ready">;
export type Blocked = Extract<SignoffStateKind, "blocked">;

export type FreezeStateKind = "frozen" | "unfrozen" | "blocked";

export type FreezeChecklistStatus = "pass" | "fail" | "warn" | "na";

export type IntelligenceSignoffPhase = {
  id: string;
  label: string;
  state: SignoffStateKind;
  ok: boolean;
};

export type IntelligenceSignoffSignals = {
  platformReady?: boolean;
  freezeChecklistPass?: boolean;
  platformGatesPass?: boolean;
  rollbackSnapshotComplete?: boolean;
  versionLockIntact?: boolean;
};

export type LockVersion = {
  foundation: string;
  analytics: string;
  kpi: string;
  forecast: string;
  optimization: string;
  simulation: string;
  strategy: string;
  foundationFreeze: string;
  analyticsFreeze: string;
  kpiFreeze: string;
  forecastFreeze: string;
  optimizationFreeze: string;
  simulationFreeze: string;
  strategyFreeze: string;
  signoff: typeof E05_INTELLIGENCE_SIGNOFF_VERSION;
  freeze: typeof E05_INTELLIGENCE_PLATFORM_FREEZE_VERSION;
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
  version: typeof E05_INTELLIGENCE_PLATFORM_FREEZE_VERSION;
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
  version: typeof E05_INTELLIGENCE_SIGNOFF_VERSION;
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
  version: typeof E05_INTELLIGENCE_PLATFORM_FREEZE_VERSION;
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

export type StrategyBaselineSnapshot = {
  ready: boolean;
  strategyId: string;
  simulationId: string;
  stance: string;
  preferredAction: string;
  stepCount: number;
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

export type IntelligenceFreezeManifest = {
  version: typeof E05_INTELLIGENCE_PLATFORM_FREEZE_VERSION;
  freezeId: string;
  frozenAt: string;
  deploymentId: string;
  lockVersion: LockVersion;
  versionLockOk: boolean;
  strategyBaseline: StrategyBaselineSnapshot;
  freezeChecklist: FreezeChecklist;
  rollbackSnapshot: RollbackSnapshot;
  freezeState: FreezeState;
  summary: string;
};

export type IntelligenceSignoffReport = {
  version: typeof E05_INTELLIGENCE_SIGNOFF_VERSION;
  signoffId: string;
  signedOffAt: string;
  deploymentId: string;
  phases: IntelligenceSignoffPhase[];
  gateSummary: GateSummary;
  readiness: ReadinessReport;
  freeze: IntelligenceFreezeManifest;
  signoffState: SignoffState;
  closingSummary: string;
  summary: string;
};
