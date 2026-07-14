/**
 * E02-P8 — Tender Knowledge Graph Sign-off & Freeze types (read-only)
 */

export const V102_KNOWLEDGE_SIGNOFF_VERSION = "v102-knowledge-signoff-1" as const;
export const V102_KNOWLEDGE_FREEZE_VERSION = "v102-knowledge-freeze-1" as const;

export type SignoffStateKind = "pass" | "fail" | "ready" | "blocked";

export type Pass = Extract<SignoffStateKind, "pass">;
export type Fail = Extract<SignoffStateKind, "fail">;
export type Ready = Extract<SignoffStateKind, "ready">;
export type Blocked = Extract<SignoffStateKind, "blocked">;

export type FreezeStateKind = "frozen" | "unfrozen" | "blocked";

export type FreezeChecklistStatus = "pass" | "fail" | "warn" | "na";

export type KnowledgeSignoffPhase = {
  id: string;
  label: string;
  state: SignoffStateKind;
  ok: boolean;
};

export type KnowledgeSignoffSignals = {
  knowledgeReady?: boolean;
  freezeChecklistPass?: boolean;
  knowledgeGatesPass?: boolean;
  rollbackSnapshotComplete?: boolean;
  versionLockIntact?: boolean;
};

export type LockVersion = {
  knowledge: string;
  extraction: string;
  relationship: string;
  retrieval: string;
  similarity: string;
  memoryAgent: string;
  knowledgeDelivery: string;
  knowledgeFreeze: string;
  extractionFreeze: string;
  relationshipFreeze: string;
  retrievalFreeze: string;
  similarityFreeze: string;
  memoryAgentFreeze: string;
  knowledgeDeliveryFreeze: string;
  signoff: typeof V102_KNOWLEDGE_SIGNOFF_VERSION;
  freeze: typeof V102_KNOWLEDGE_FREEZE_VERSION;
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
  version: typeof V102_KNOWLEDGE_FREEZE_VERSION;
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
  version: typeof V102_KNOWLEDGE_SIGNOFF_VERSION;
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
  version: typeof V102_KNOWLEDGE_FREEZE_VERSION;
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

export type KnowledgeDeliveryBaselineSnapshot = {
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

export type KnowledgeFreezeManifest = {
  version: typeof V102_KNOWLEDGE_FREEZE_VERSION;
  freezeId: string;
  frozenAt: string;
  deploymentId: string;
  lockVersion: LockVersion;
  versionLockOk: boolean;
  deliveryBaseline: KnowledgeDeliveryBaselineSnapshot;
  freezeChecklist: FreezeChecklist;
  rollbackSnapshot: RollbackSnapshot;
  freezeState: FreezeState;
  summary: string;
};

export type KnowledgeSignoffReport = {
  version: typeof V102_KNOWLEDGE_SIGNOFF_VERSION;
  signoffId: string;
  signedOffAt: string;
  deploymentId: string;
  phases: KnowledgeSignoffPhase[];
  gateSummary: GateSummary;
  readiness: ReadinessReport;
  freeze: KnowledgeFreezeManifest;
  signoffState: SignoffState;
  closingSummary: string;
  summary: string;
};
