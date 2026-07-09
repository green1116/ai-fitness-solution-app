/**
 * V70 P1 — Release catalog types (read-only)
 */

export const V70_RELEASE_VERSION = "v70-release-catalog-1" as const;
export const V70_RELEASE_FREEZE_VERSION = "v70-release-catalog-freeze-1" as const;

export type ReleaseChannel = "stable" | "beta" | "canary" | "internal";

export type ReleaseStage = "planning" | "build" | "staging" | "production" | "archived";

export type ReleaseStatus = "draft" | "active" | "deprecated" | "retired";

export type ReleaseCompatibility =
  | "backward-compatible"
  | "breaking"
  | "patch-only"
  | "none";

export type ReleaseCatalogEntry = {
  id: string;
  release: string;
  version: string;
  channel: ReleaseChannel;
  stage: ReleaseStage;
  artifact: string;
  owner: string;
  status: ReleaseStatus;
  compatibility: ReleaseCompatibility;
  supportWindow: string;
  rollbackTarget: string;
  required: boolean;
  description: string;
};

export type ReleaseCatalogManifest = {
  version: typeof V70_RELEASE_VERSION;
  entryCount: number;
  channelCount: number;
  stageCount: number;
  catalogComplete: boolean;
  releases: ReleaseCatalogEntry[];
  summary: string;
};

export type ReleaseCatalogSignals = {
  catalogComplete?: boolean;
  freezeVersionDeclared?: boolean;
};

export type ReleaseCatalogReport = {
  version: typeof V70_RELEASE_VERSION;
  freezeVersion: typeof V70_RELEASE_FREEZE_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  manifest: ReleaseCatalogManifest;
  catalogReady: boolean;
  readinessScore: number;
  summary: string;
};
