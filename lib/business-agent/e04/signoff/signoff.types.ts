/**
 * E04-P8 — Business Agent Governance Sign-off & Freeze types (read-only)
 */

export const E04_BUSINESS_AGENT_SIGNOFF_VERSION =
  "e04-business-agent-signoff-1" as const;
export const E04_BUSINESS_AGENT_PLATFORM_FREEZE_VERSION =
  "e04-business-agent-platform-freeze-1" as const;

export type SignoffStateKind = "pass" | "fail" | "ready" | "blocked";

export type Pass = Extract<SignoffStateKind, "pass">;
export type Fail = Extract<SignoffStateKind, "fail">;
export type Ready = Extract<SignoffStateKind, "ready">;
export type Blocked = Extract<SignoffStateKind, "blocked">;

export type FreezeStateKind = "frozen" | "unfrozen" | "blocked";

export type FreezeChecklistStatus = "pass" | "fail" | "warn" | "na";

export type BusinessAgentSignoffPhase = {
  id: string;
  label: string;
  state: SignoffStateKind;
  ok: boolean;
};

export type BusinessAgentSignoffSignals = {
  platformReady?: boolean;
  freezeChecklistPass?: boolean;
  platformGatesPass?: boolean;
  rollbackSnapshotComplete?: boolean;
  versionLockIntact?: boolean;
};

export type LockVersion = {
  foundation: string;
  workflow: string;
  process: string;
  decision: string;
  memory: string;
  knowledge: string;
  collaboration: string;
  foundationFreeze: string;
  workflowFreeze: string;
  processFreeze: string;
  decisionFreeze: string;
  memoryFreeze: string;
  knowledgeFreeze: string;
  collaborationFreeze: string;
  signoff: typeof E04_BUSINESS_AGENT_SIGNOFF_VERSION;
  freeze: typeof E04_BUSINESS_AGENT_PLATFORM_FREEZE_VERSION;
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
  version: typeof E04_BUSINESS_AGENT_PLATFORM_FREEZE_VERSION;
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
  version: typeof E04_BUSINESS_AGENT_SIGNOFF_VERSION;
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
  version: typeof E04_BUSINESS_AGENT_PLATFORM_FREEZE_VERSION;
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

export type CollaborationBaselineSnapshot = {
  ready: boolean;
  collaborationId: string;
  sessionId: string;
  phase: string;
  turnCount: number;
  messageCount: number;
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

export type BusinessAgentFreezeManifest = {
  version: typeof E04_BUSINESS_AGENT_PLATFORM_FREEZE_VERSION;
  freezeId: string;
  frozenAt: string;
  deploymentId: string;
  lockVersion: LockVersion;
  versionLockOk: boolean;
  collaborationBaseline: CollaborationBaselineSnapshot;
  freezeChecklist: FreezeChecklist;
  rollbackSnapshot: RollbackSnapshot;
  freezeState: FreezeState;
  summary: string;
};

export type BusinessAgentSignoffReport = {
  version: typeof E04_BUSINESS_AGENT_SIGNOFF_VERSION;
  signoffId: string;
  signedOffAt: string;
  deploymentId: string;
  phases: BusinessAgentSignoffPhase[];
  gateSummary: GateSummary;
  readiness: ReadinessReport;
  freeze: BusinessAgentFreezeManifest;
  signoffState: SignoffState;
  closingSummary: string;
  summary: string;
};
