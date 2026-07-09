/**
 * V71 P8 — Workflow sign-off & freeze types (read-only)
 */
import type { WorkflowComplianceReport } from "../workflow.compliance";

export const V71_WORKFLOW_SIGNOFF_VERSION = "v71-workflow-signoff-1" as const;
export const V71_WORKFLOW_FREEZE_VERSION = "v71-workflow-freeze-1" as const;

export type SignoffStateKind = "pass" | "fail" | "ready" | "blocked";

export type FreezeStateKind = "frozen" | "unfrozen" | "blocked";

export type FreezeChecklistStatus = "pass" | "fail" | "warn" | "na";

export type WorkflowSignoffPhase = {
  id: string;
  label: string;
  state: SignoffStateKind;
  ok: boolean;
};

export type WorkflowSignoffSignals = {
  workflowReady?: boolean;
  freezeChecklistPass?: boolean;
  workflowGatesPass?: boolean;
  rollbackSnapshotComplete?: boolean;
  versionLockIntact?: boolean;
};

export type LockVersion = {
  orchestrationCatalog: string;
  workflowDependency: string;
  workflowPolicy: string;
  workflowCompatibility: string;
  workflowGovernance: string;
  workflowLifecycle: string;
  workflowCompliance: string;
  signoff: typeof V71_WORKFLOW_SIGNOFF_VERSION;
  freeze: typeof V71_WORKFLOW_FREEZE_VERSION;
  upstreamV70DeliverySignoff: string;
  upstreamV70DeliveryFreeze: string;
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
  version: typeof V71_WORKFLOW_FREEZE_VERSION;
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
  version: typeof V71_WORKFLOW_SIGNOFF_VERSION;
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
  version: typeof V71_WORKFLOW_FREEZE_VERSION;
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

export type WorkflowFreezeManifest = {
  version: typeof V71_WORKFLOW_FREEZE_VERSION;
  freezeId: string;
  frozenAt: string;
  deploymentId: string;
  lockVersion: LockVersion;
  versionLockOk: boolean;
  workflowCompliance: WorkflowComplianceReport;
  freezeChecklist: FreezeChecklist;
  rollbackSnapshot: RollbackSnapshot;
  freezeState: FreezeState;
  summary: string;
};

export type WorkflowSignoffReport = {
  version: typeof V71_WORKFLOW_SIGNOFF_VERSION;
  signoffId: string;
  signedOffAt: string;
  deploymentId: string;
  phases: WorkflowSignoffPhase[];
  gateSummary: GateSummary;
  readiness: ReadinessReport;
  freeze: WorkflowFreezeManifest;
  signoffState: SignoffState;
  closingSummary: string;
  summary: string;
};
