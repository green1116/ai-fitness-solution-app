/**
 * V79 P5 — Task evaluation catalog types (read-only)
 */

export const V79_TASK_EVALUATION_VERSION = "v79-task-evaluation-catalog-1" as const;
export const V79_TASK_EVALUATION_FREEZE_VERSION =
  "v79-task-evaluation-catalog-freeze-1" as const;

export type TaskEvaluationKind =
  | "shared"
  | "role"
  | "state"
  | "topology"
  | "scope"
  | "dependency"
  | "governance"
  | "boundary";

export type TaskEvaluationPriority = "low" | "medium" | "high" | "critical";

export type TaskEvaluationValidation = {
  id: string;
  evaluationRef: string;
  validationKind: string;
  passCondition: string;
  required: boolean;
  description: string;
};

export type TaskEvaluationCatalogEntry = {
  id: string;
  kind: TaskEvaluationKind;
  purpose: string;
  roleRef: string;
  stateRef: string;
  topologyRef: string;
  dependencyRef: string;
  metrics: string[];
  threshold: string;
  passRule: string;
  priority: TaskEvaluationPriority;
  validation: string;
  constraintRef: string;
  contextRef: string;
  required: boolean;
  description: string;
};

export type TaskEvaluationCatalogManifest = {
  version: typeof V79_TASK_EVALUATION_VERSION;
  entryCount: number;
  kindCount: number;
  catalogComplete: boolean;
  evaluations: TaskEvaluationCatalogEntry[];
  summary: string;
};

export type TaskEvaluationValidationManifest = {
  version: typeof V79_TASK_EVALUATION_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  validations: TaskEvaluationValidation[];
  summary: string;
};

export type TaskEvaluationCatalogSignals = {
  taskConstraintCatalogReady?: boolean;
  catalogComplete?: boolean;
  validationsComplete?: boolean;
  refsAligned?: boolean;
  freezeVersionDeclared?: boolean;
};

export type TaskEvaluationCatalogReport = {
  version: typeof V79_TASK_EVALUATION_VERSION;
  freezeVersion: typeof V79_TASK_EVALUATION_FREEZE_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  taskConstraintCatalogVersion: string;
  taskConstraintCatalogReady: boolean;
  catalog: TaskEvaluationCatalogManifest;
  validations: TaskEvaluationValidationManifest;
  catalogReady: boolean;
  readinessScore: number;
  summary: string;
};
