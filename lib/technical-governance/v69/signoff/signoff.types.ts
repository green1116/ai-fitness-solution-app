/**
 * V69 P8 — Technical governance sign-off & freeze types (read-only)
 */
import type { ArchitectureComplianceReport } from "../architecture-compliance/compliance.types";

export const V69_TECHNICAL_GOVERNANCE_SIGNOFF_VERSION =
  "v69-technical-governance-signoff-1" as const;
export const V69_TECHNICAL_GOVERNANCE_FREEZE_VERSION =
  "v69-technical-governance-freeze-1" as const;

export type FreezeChecklistStatus = "pass" | "fail" | "warn" | "na";

export type TechnicalSignoffPhase = {
  id: string;
  label: string;
  ok: boolean;
};

export type TechnicalSignoffSignals = {
  governanceReady?: boolean;
  freezeChecklistPass?: boolean;
  releaseGatesPass?: boolean;
  rollbackSnapshotComplete?: boolean;
  versionLockIntact?: boolean;
};

export type TechnicalLayerVersionLock = {
  architectureCatalog: string;
  architectureDependency: string;
  codeGovernance: string;
  technicalStandards: string;
  securityGovernance: string;
  qualityGovernance: string;
  architectureCompliance: string;
  signoff: typeof V69_TECHNICAL_GOVERNANCE_SIGNOFF_VERSION;
  freeze: typeof V69_TECHNICAL_GOVERNANCE_FREEZE_VERSION;
  upstreamV68PlatformSignoff: string;
  upstreamV68PlatformFreeze: string;
};

export type FreezeChecklistItem = {
  id: string;
  label: string;
  status: FreezeChecklistStatus;
  required: boolean;
  notes?: string;
};

export type FreezeChecklistManifest = {
  version: typeof V69_TECHNICAL_GOVERNANCE_FREEZE_VERSION;
  itemCount: number;
  passCount: number;
  checklistPass: boolean;
  items: FreezeChecklistItem[];
  summary: string;
};

export type ReleaseGateEntry = {
  id: string;
  phase: string;
  label: string;
  ok: boolean;
  verifyScript: string;
};

export type ReleaseGateSummary = {
  version: typeof V69_TECHNICAL_GOVERNANCE_SIGNOFF_VERSION;
  gateCount: number;
  passCount: number;
  allGatesPass: boolean;
  gates: ReleaseGateEntry[];
  summary: string;
};

export type RollbackSnapshotEntry = {
  id: string;
  layer: string;
  snapshotPath: string;
  rollbackAction: string;
  required: boolean;
};

export type RollbackSnapshotIndex = {
  version: typeof V69_TECHNICAL_GOVERNANCE_FREEZE_VERSION;
  entryCount: number;
  indexComplete: boolean;
  entries: RollbackSnapshotEntry[];
  summary: string;
};

export type TechnicalPhaseReadiness = {
  p1: boolean;
  p2: boolean;
  p3: boolean;
  p4: boolean;
  p5: boolean;
  p6: boolean;
  p7: boolean;
};

export type TechnicalFreezeManifest = {
  version: typeof V69_TECHNICAL_GOVERNANCE_FREEZE_VERSION;
  freezeId: string;
  frozenAt: string;
  deploymentId: string;
  layerVersionLock: TechnicalLayerVersionLock;
  versionLockOk: boolean;
  architectureCompliance: ArchitectureComplianceReport;
  freezeChecklist: FreezeChecklistManifest;
  rollbackSnapshot: RollbackSnapshotIndex;
  backwardCompatible: boolean;
  frozen: boolean;
  summary: string;
};

export type TechnicalSignoffReport = {
  version: typeof V69_TECHNICAL_GOVERNANCE_SIGNOFF_VERSION;
  signoffId: string;
  signedOffAt: string;
  deploymentId: string;
  phases: TechnicalSignoffPhase[];
  releaseGates: ReleaseGateSummary;
  freeze: TechnicalFreezeManifest;
  finalReadinessScore: number;
  allPhasesPass: boolean;
  signedOff: boolean;
  closingSummary: string;
  summary: string;
};
