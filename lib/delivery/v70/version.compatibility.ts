/**
 * V70 P4 — Version compatibility types (read-only)
 */

export const V70_VERSION_COMPATIBILITY_VERSION = "v70-version-compatibility-1" as const;
export const V70_VERSION_COMPATIBILITY_FREEZE_VERSION =
  "v70-version-compatibility-freeze-1" as const;

export type CompatibilityConstraintKind =
  | "semver-range"
  | "governance-freeze"
  | "api-contract"
  | "dependency-order"
  | "channel-gate";

export type VersionPair = {
  id: string;
  sourceReleaseRef: string;
  targetReleaseRef: string;
  sourceVersion: string;
  targetVersion: string;
  compatible: boolean;
  incompatible: boolean;
  deprecated: boolean;
  supported: boolean;
  minimum: string;
  maximum: string;
  constraint: string;
  fallback: string;
  required: boolean;
  description: string;
};

export type VersionPairManifest = {
  version: typeof V70_VERSION_COMPATIBILITY_VERSION;
  pairCount: number;
  catalogComplete: boolean;
  pairs: VersionPair[];
  summary: string;
};

export type CompatibilityConstraint = {
  id: string;
  kind: CompatibilityConstraintKind;
  minimum: string;
  maximum: string;
  fallback: string;
  required: boolean;
  description: string;
};

export type CompatibilityConstraintManifest = {
  version: typeof V70_VERSION_COMPATIBILITY_VERSION;
  entryCount: number;
  kindCount: number;
  catalogComplete: boolean;
  constraints: CompatibilityConstraint[];
  summary: string;
};

export type CompatibilityMatrix = {
  version: typeof V70_VERSION_COMPATIBILITY_VERSION;
  rowCount: number;
  compatibleCount: number;
  incompatibleCount: number;
  deprecatedCount: number;
  supportedCount: number;
  matrixComplete: boolean;
  pairs: VersionPair[];
  summary: string;
};

export type VersionCompatibilitySignals = {
  releasePolicyReady?: boolean;
  pairsComplete?: boolean;
  constraintsComplete?: boolean;
  matrixComplete?: boolean;
  refsAligned?: boolean;
  freezeVersionDeclared?: boolean;
};

export type VersionCompatibilityReport = {
  version: typeof V70_VERSION_COMPATIBILITY_VERSION;
  freezeVersion: typeof V70_VERSION_COMPATIBILITY_FREEZE_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  releasePolicyVersion: string;
  releasePolicyReady: boolean;
  pairs: VersionPairManifest;
  constraints: CompatibilityConstraintManifest;
  matrix: CompatibilityMatrix;
  compatibilityReady: boolean;
  readinessScore: number;
  summary: string;
};
