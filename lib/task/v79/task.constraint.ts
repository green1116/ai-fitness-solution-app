/**
 * V79 P4 — Task constraint catalog types (read-only)
 */

export const V79_TASK_CONSTRAINT_VERSION = "v79-task-constraint-catalog-1" as const;
export const V79_TASK_CONSTRAINT_FREEZE_VERSION =
  "v79-task-constraint-catalog-freeze-1" as const;

export type TaskConstraintKind =
  | "shared"
  | "role"
  | "state"
  | "topology"
  | "scope"
  | "dependency"
  | "governance"
  | "boundary";

export type TaskConstraintLevel = "L1" | "L2" | "L3" | "critical";

export type TaskConstraintPriority = "low" | "medium" | "high" | "critical";

export type TaskConstraintValidation = {
  id: string;
  constraintRef: string;
  validationKind: string;
  passCondition: string;
  required: boolean;
  description: string;
};

export type TaskConstraintCatalogEntry = {
  id: string;
  kind: TaskConstraintKind;
  purpose: string;
  scopeRef: string;
  level: TaskConstraintLevel;
  trigger: string;
  condition: string;
  resolution: string;
  priority: TaskConstraintPriority;
  validation: string;
  inventoryGovernanceRef: string;
  contextRef: string;
  policyRef: string;
  required: boolean;
  description: string;
};

export type TaskConstraintCatalogManifest = {
  version: typeof V79_TASK_CONSTRAINT_VERSION;
  entryCount: number;
  kindCount: number;
  catalogComplete: boolean;
  constraints: TaskConstraintCatalogEntry[];
  summary: string;
};

export type TaskConstraintValidationManifest = {
  version: typeof V79_TASK_CONSTRAINT_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  validations: TaskConstraintValidation[];
  summary: string;
};

export type TaskConstraintCatalogSignals = {
  taskContextCatalogReady?: boolean;
  catalogComplete?: boolean;
  validationsComplete?: boolean;
  refsAligned?: boolean;
  freezeVersionDeclared?: boolean;
};

export type TaskConstraintCatalogReport = {
  version: typeof V79_TASK_CONSTRAINT_VERSION;
  freezeVersion: typeof V79_TASK_CONSTRAINT_FREEZE_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  taskContextCatalogVersion: string;
  taskContextCatalogReady: boolean;
  catalog: TaskConstraintCatalogManifest;
  validations: TaskConstraintValidationManifest;
  catalogReady: boolean;
  readinessScore: number;
  summary: string;
};
