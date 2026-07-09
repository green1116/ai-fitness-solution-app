/**
 * V73 P4 — Knowledge compatibility types (read-only)
 */

export const V73_KNOWLEDGE_COMPATIBILITY_VERSION = "v73-knowledge-compatibility-1" as const;
export const V73_KNOWLEDGE_COMPATIBILITY_FREEZE_VERSION =
  "v73-knowledge-compatibility-freeze-1" as const;

export type CompatibilityConstraintKind =
  | "knowledge-version"
  | "policy-gate"
  | "dependency-order"
  | "confidence-threshold"
  | "access-gate"
  | "document-order"
  | "version-match"
  | "verify-pass";

export type VersionPair = {
  id: string;
  sourceKnowledgeRef: string;
  targetKnowledgeRef: string;
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
  version: typeof V73_KNOWLEDGE_COMPATIBILITY_VERSION;
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
  version: typeof V73_KNOWLEDGE_COMPATIBILITY_VERSION;
  entryCount: number;
  kindCount: number;
  catalogComplete: boolean;
  constraints: Constraint[];
  summary: string;
};

export type Matrix = {
  version: typeof V73_KNOWLEDGE_COMPATIBILITY_VERSION;
  rowCount: number;
  compatibleCount: number;
  incompatibleCount: number;
  deprecatedCount: number;
  supportedCount: number;
  matrixComplete: boolean;
  pairs: VersionPair[];
  summary: string;
};

export type KnowledgeCompatibilitySignals = {
  knowledgePolicyReady?: boolean;
  pairsComplete?: boolean;
  constraintsComplete?: boolean;
  matrixComplete?: boolean;
  refsAligned?: boolean;
  freezeVersionDeclared?: boolean;
};

export type KnowledgeCompatibilityReport = {
  version: typeof V73_KNOWLEDGE_COMPATIBILITY_VERSION;
  freezeVersion: typeof V73_KNOWLEDGE_COMPATIBILITY_FREEZE_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  knowledgePolicyVersion: string;
  knowledgePolicyReady: boolean;
  pairs: VersionPairManifest;
  constraints: ConstraintManifest;
  matrix: Matrix;
  compatibilityReady: boolean;
  readinessScore: number;
  summary: string;
};
