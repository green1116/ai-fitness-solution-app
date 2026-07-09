/**
 * V74 P8 — Decision sign-off & freeze types (read-only)
 */
import type { DecisionComplianceCatalogReport } from "../decision.compliance";

export const V74_DECISION_SIGNOFF_VERSION = "v74-decision-signoff-1" as const;
export const V74_DECISION_FREEZE_VERSION = "v74-decision-freeze-1" as const;

export type SignoffStateKind = "pass" | "fail" | "ready" | "blocked";

export type Pass = Extract<SignoffStateKind, "pass">;
export type Fail = Extract<SignoffStateKind, "fail">;
export type Ready = Extract<SignoffStateKind, "ready">;
export type Blocked = Extract<SignoffStateKind, "blocked">;

export type FreezeStateKind = "frozen" | "unfrozen" | "blocked";

export type FreezeChecklistStatus = "pass" | "fail" | "warn" | "na";

export type DecisionSignoffPhase = {
  id: string;
  label: string;
  state: SignoffStateKind;
  ok: boolean;
};

export type DecisionSignoffSignals = {
  decisionReady?: boolean;
  freezeChecklistPass?: boolean;
  decisionGatesPass?: boolean;
  rollbackSnapshotComplete?: boolean;
  versionLockIntact?: boolean;
};

export type LockVersion = {
  decisionInventory: string;
  decisionPolicy: string;
  decisionContext: string;
  decisionConstraint: string;
  decisionEvaluation: string;
  decisionSimulation: string;
  decisionCompliance: string;
  signoff: typeof V74_DECISION_SIGNOFF_VERSION;
  freeze: typeof V74_DECISION_FREEZE_VERSION;
  upstreamV73KnowledgeSignoff: string;
  upstreamV73KnowledgeFreeze: string;
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
  version: typeof V74_DECISION_FREEZE_VERSION;
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
  version: typeof V74_DECISION_SIGNOFF_VERSION;
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
  version: typeof V74_DECISION_FREEZE_VERSION;
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

export type DecisionFreezeManifest = {
  version: typeof V74_DECISION_FREEZE_VERSION;
  freezeId: string;
  frozenAt: string;
  deploymentId: string;
  lockVersion: LockVersion;
  versionLockOk: boolean;
  decisionCompliance: DecisionComplianceCatalogReport;
  freezeChecklist: FreezeChecklist;
  rollbackSnapshot: RollbackSnapshot;
  freezeState: FreezeState;
  summary: string;
};

export type DecisionSignoffReport = {
  version: typeof V74_DECISION_SIGNOFF_VERSION;
  signoffId: string;
  signedOffAt: string;
  deploymentId: string;
  phases: DecisionSignoffPhase[];
  gateSummary: GateSummary;
  readiness: ReadinessReport;
  freeze: DecisionFreezeManifest;
  signoffState: SignoffState;
  closingSummary: string;
  summary: string;
};
