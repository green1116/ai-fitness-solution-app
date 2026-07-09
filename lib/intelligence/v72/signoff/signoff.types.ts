/**
 * V72 P8 — Intelligence sign-off & freeze types (read-only)
 */
import type { IntelligenceComplianceReport } from "../intelligence.compliance";

export const V72_INTELLIGENCE_SIGNOFF_VERSION = "v72-intelligence-signoff-1" as const;
export const V72_INTELLIGENCE_FREEZE_VERSION = "v72-intelligence-freeze-1" as const;

export type SignoffStateKind = "pass" | "fail" | "ready" | "blocked";

export type FreezeStateKind = "frozen" | "unfrozen" | "blocked";

export type FreezeChecklistStatus = "pass" | "fail" | "warn" | "na";

export type IntelligenceSignoffPhase = {
  id: string;
  label: string;
  state: SignoffStateKind;
  ok: boolean;
};

export type IntelligenceSignoffSignals = {
  intelligenceReady?: boolean;
  freezeChecklistPass?: boolean;
  intelligenceGatesPass?: boolean;
  rollbackSnapshotComplete?: boolean;
  versionLockIntact?: boolean;
};

export type LockVersion = {
  intelligenceCatalog: string;
  signalDependency: string;
  intelligencePolicy: string;
  intelligenceCompatibility: string;
  intelligenceGovernance: string;
  intelligenceLifecycle: string;
  intelligenceCompliance: string;
  signoff: typeof V72_INTELLIGENCE_SIGNOFF_VERSION;
  freeze: typeof V72_INTELLIGENCE_FREEZE_VERSION;
  upstreamV71WorkflowSignoff: string;
  upstreamV71WorkflowFreeze: string;
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
  version: typeof V72_INTELLIGENCE_FREEZE_VERSION;
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
  version: typeof V72_INTELLIGENCE_SIGNOFF_VERSION;
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
  version: typeof V72_INTELLIGENCE_FREEZE_VERSION;
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

export type IntelligenceFreezeManifest = {
  version: typeof V72_INTELLIGENCE_FREEZE_VERSION;
  freezeId: string;
  frozenAt: string;
  deploymentId: string;
  lockVersion: LockVersion;
  versionLockOk: boolean;
  intelligenceCompliance: IntelligenceComplianceReport;
  freezeChecklist: FreezeChecklist;
  rollbackSnapshot: RollbackSnapshot;
  freezeState: FreezeState;
  summary: string;
};

export type IntelligenceSignoffReport = {
  version: typeof V72_INTELLIGENCE_SIGNOFF_VERSION;
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
