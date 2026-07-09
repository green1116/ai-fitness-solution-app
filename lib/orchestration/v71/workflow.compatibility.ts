/**
 * V71 P4 — Workflow compatibility types (read-only)
 */

export const V71_WORKFLOW_COMPATIBILITY_VERSION = "v71-workflow-compatibility-1" as const;
export const V71_WORKFLOW_COMPATIBILITY_FREEZE_VERSION =
  "v71-workflow-compatibility-freeze-1" as const;

export type CompatibilityConstraintKind =
  | "orchestration-version"
  | "policy-gate"
  | "dependency-order"
  | "trigger-gate"
  | "timeout-range"
  | "retry-bound";

export type WorkflowVersionPair = {
  id: string;
  sourceOrchestrationRef: string;
  targetOrchestrationRef: string;
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

export type WorkflowVersionPairManifest = {
  version: typeof V71_WORKFLOW_COMPATIBILITY_VERSION;
  pairCount: number;
  catalogComplete: boolean;
  pairs: WorkflowVersionPair[];
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
  version: typeof V71_WORKFLOW_COMPATIBILITY_VERSION;
  entryCount: number;
  kindCount: number;
  catalogComplete: boolean;
  constraints: CompatibilityConstraint[];
  summary: string;
};

export type CompatibilityMatrix = {
  version: typeof V71_WORKFLOW_COMPATIBILITY_VERSION;
  rowCount: number;
  compatibleCount: number;
  incompatibleCount: number;
  deprecatedCount: number;
  supportedCount: number;
  matrixComplete: boolean;
  pairs: WorkflowVersionPair[];
  summary: string;
};

export type WorkflowCompatibilitySignals = {
  workflowPolicyReady?: boolean;
  pairsComplete?: boolean;
  constraintsComplete?: boolean;
  matrixComplete?: boolean;
  refsAligned?: boolean;
  freezeVersionDeclared?: boolean;
};

export type WorkflowCompatibilityReport = {
  version: typeof V71_WORKFLOW_COMPATIBILITY_VERSION;
  freezeVersion: typeof V71_WORKFLOW_COMPATIBILITY_FREEZE_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  workflowPolicyVersion: string;
  workflowPolicyReady: boolean;
  pairs: WorkflowVersionPairManifest;
  constraints: CompatibilityConstraintManifest;
  matrix: CompatibilityMatrix;
  compatibilityReady: boolean;
  readinessScore: number;
  summary: string;
};
