/**
 * V78 P4 — Execution constraint catalog types (read-only)
 */

export const V78_EXECUTION_CONSTRAINT_VERSION = "v78-execution-constraint-catalog-1" as const;
export const V78_EXECUTION_CONSTRAINT_FREEZE_VERSION =
  "v78-execution-constraint-catalog-freeze-1" as const;

export type ExecutionConstraintKind =
  | "shared"
  | "role"
  | "topology"
  | "scope"
  | "dependency"
  | "governance"
  | "workspace"
  | "boundary";

export type ExecutionConstraintLevel = "L1" | "L2" | "L3" | "critical";

export type ExecutionConstraintPriority = "low" | "medium" | "high" | "critical";

export type ExecutionConstraintValidation = {
  id: string;
  constraintRef: string;
  validationKind: string;
  passCondition: string;
  required: boolean;
  description: string;
};

export type ExecutionConstraintCatalogEntry = {
  id: string;
  kind: ExecutionConstraintKind;
  purpose: string;
  scopeRef: string;
  level: ExecutionConstraintLevel;
  trigger: string;
  condition: string;
  resolution: string;
  priority: ExecutionConstraintPriority;
  validation: string;
  inventoryGovernanceRef: string;
  contextRef: string;
  policyRef: string;
  required: boolean;
  description: string;
};

export type ExecutionConstraintCatalogManifest = {
  version: typeof V78_EXECUTION_CONSTRAINT_VERSION;
  entryCount: number;
  kindCount: number;
  catalogComplete: boolean;
  constraints: ExecutionConstraintCatalogEntry[];
  summary: string;
};

export type ExecutionConstraintValidationManifest = {
  version: typeof V78_EXECUTION_CONSTRAINT_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  validations: ExecutionConstraintValidation[];
  summary: string;
};

export type ExecutionConstraintCatalogSignals = {
  executionContextCatalogReady?: boolean;
  catalogComplete?: boolean;
  validationsComplete?: boolean;
  refsAligned?: boolean;
  freezeVersionDeclared?: boolean;
};

export type ExecutionConstraintCatalogReport = {
  version: typeof V78_EXECUTION_CONSTRAINT_VERSION;
  freezeVersion: typeof V78_EXECUTION_CONSTRAINT_FREEZE_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  executionContextCatalogVersion: string;
  executionContextCatalogReady: boolean;
  catalog: ExecutionConstraintCatalogManifest;
  validations: ExecutionConstraintValidationManifest;
  catalogReady: boolean;
  readinessScore: number;
  summary: string;
};
