/**
 * V100 — Pilot final sign-off & baseline freeze types
 */

import type { ReadinessSummary } from "@/lib/pilot/v99";

export const V100_PILOT_SIGNOFF_VERSION = "v100-pilot-signoff-1";
export const PILOT_BASELINE_VERSION = "pilot-baseline-1.0.0";

export type PilotReleaseStatus =
  | "draft"
  | "ready_for_signoff"
  | "signed_off"
  | "frozen"
  | "released";

export type ChecklistStatus = "pass" | "warning" | "blocked";

export type CapabilityEntry = {
  version: string;
  versionConstant: string;
  capability: string;
  modulePath: string;
  route?: string;
  apiRoute?: string;
  verifyScript: string;
  readOnly: true;
};

export type LayerReadinessEntry = {
  version: string;
  capability: string;
  included: boolean;
  verifyScript: string;
  readOnly: true;
};

export type PilotSignoffReport = {
  collectedLayers: LayerReadinessEntry[];
  layerCount: number;
  readinessSummary: ReadinessSummary;
  overallPilotScore: number;
  overallReleaseStatus: PilotReleaseStatus;
  certificationStatus: string;
  signedOffAt?: string;
  signedOffBy?: string;
  readOnly: true;
};

export type FreezeManifest = {
  baselineVersion: string;
  frozen: boolean;
  frozenAt?: string;
  frozenBy?: string;
  versionLock: Record<string, string>;
  dependencyLock: string[];
  releaseLock: boolean;
  readOnly: true;
};

export type ReleaseManifest = {
  baselineVersion: string;
  generatedAt: string;
  capabilityInventory: CapabilityEntry[];
  moduleIndex: string[];
  apiIndex: string[];
  uiIndex: string[];
  verifyIndex: string[];
  artifactIndex: Array<{ label: string; href: string; layer: string }>;
  readOnly: true;
};

export type RollbackIndex = {
  baselineVersion: string;
  snapshotIndex: Array<{ version: string; capability: string; modulePath: string }>;
  dependencyGraph: Array<{ version: string; dependsOn: string[] }>;
  restoreEntryPoints: Array<{ version: string; entryPoint: string }>;
  readOnly: true;
};

export type GovernanceChecklistItem = {
  id: string;
  label: string;
  status: ChecklistStatus;
  detail: string;
  readOnly: true;
};

export type PilotGovernance = {
  releaseChecklist: GovernanceChecklistItem[];
  productionChecklist: GovernanceChecklistItem[];
  certificationSummary: string;
  finalApproval: {
    approved: boolean;
    approvedAt?: string;
    approvedBy?: string;
  };
  readOnly: true;
};

export type PilotSignoffActionType =
  | "collect_readiness"
  | "final_signoff"
  | "freeze_baseline"
  | "release_baseline";

export type PilotSignoffActionEntry = {
  id: string;
  organizationId: string;
  actorId: string;
  action: PilotSignoffActionType;
  timestamp: string;
  note?: string;
  meta?: Record<string, unknown>;
};

export type PilotSignoffState = {
  organizationId: string;
  releaseStatus: PilotReleaseStatus;
  signedOffAt?: string;
  signedOffBy?: string;
  frozenAt?: string;
  frozenBy?: string;
  releasedAt?: string;
  releasedBy?: string;
};

export type PilotSignoffDashboard = {
  version: string;
  organizationId: string;
  generatedAt: string;
  baselineVersion: string;
  releaseStatus: PilotReleaseStatus;
  signoffReport: PilotSignoffReport;
  freezeManifest: FreezeManifest;
  releaseManifest: ReleaseManifest;
  rollbackIndex: RollbackIndex;
  governance: PilotGovernance;
  recentActions: PilotSignoffActionEntry[];
  readOnly: true;
};
