/**
 * V72 P4 — Intelligence compatibility types (read-only)
 */

export const V72_INTELLIGENCE_COMPATIBILITY_VERSION =
  "v72-intelligence-compatibility-1" as const;
export const V72_INTELLIGENCE_COMPATIBILITY_FREEZE_VERSION =
  "v72-intelligence-compatibility-freeze-1" as const;

export type CompatibilityConstraintKind =
  | "intelligence-version"
  | "policy-gate"
  | "dependency-order"
  | "confidence-threshold"
  | "severity-gate"
  | "signal-order"
  | "anomaly-gate"
  | "verify-pass";

export type VersionPair = {
  id: string;
  sourceIntelligenceRef: string;
  targetIntelligenceRef: string;
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
  version: typeof V72_INTELLIGENCE_COMPATIBILITY_VERSION;
  pairCount: number;
  catalogComplete: boolean;
  pairs: VersionPair[];
  summary: string;
};

export type Constraint = {
  id: string;
  kind: CompatibilityConstraintKind;
  minimum: string;
  maximum: string;
  fallback: string;
  required: boolean;
  description: string;
};

export type ConstraintManifest = {
  version: typeof V72_INTELLIGENCE_COMPATIBILITY_VERSION;
  entryCount: number;
  kindCount: number;
  catalogComplete: boolean;
  constraints: Constraint[];
  summary: string;
};

export type Matrix = {
  version: typeof V72_INTELLIGENCE_COMPATIBILITY_VERSION;
  rowCount: number;
  compatibleCount: number;
  incompatibleCount: number;
  deprecatedCount: number;
  supportedCount: number;
  matrixComplete: boolean;
  pairs: VersionPair[];
  summary: string;
};

export type IntelligenceCompatibilitySignals = {
  intelligencePolicyReady?: boolean;
  pairsComplete?: boolean;
  constraintsComplete?: boolean;
  matrixComplete?: boolean;
  refsAligned?: boolean;
  freezeVersionDeclared?: boolean;
};

export type IntelligenceCompatibilityReport = {
  version: typeof V72_INTELLIGENCE_COMPATIBILITY_VERSION;
  freezeVersion: typeof V72_INTELLIGENCE_COMPATIBILITY_FREEZE_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  intelligencePolicyVersion: string;
  intelligencePolicyReady: boolean;
  pairs: VersionPairManifest;
  constraints: ConstraintManifest;
  matrix: Matrix;
  compatibilityReady: boolean;
  readinessScore: number;
  summary: string;
};
