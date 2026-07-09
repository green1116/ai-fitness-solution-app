/**
 * V78 P5 — Execution evaluation catalog types (read-only)
 */

export const V78_EXECUTION_EVALUATION_VERSION = "v78-execution-evaluation-catalog-1" as const;
export const V78_EXECUTION_EVALUATION_FREEZE_VERSION =
  "v78-execution-evaluation-catalog-freeze-1" as const;

export type ExecutionEvaluationKind =
  | "shared"
  | "role"
  | "topology"
  | "scope"
  | "dependency"
  | "governance"
  | "workspace"
  | "boundary";

export type ExecutionEvaluationPriority = "low" | "medium" | "high" | "critical";

export type ExecutionEvaluationValidation = {
  id: string;
  evaluationRef: string;
  validationKind: string;
  passCondition: string;
  required: boolean;
  description: string;
};

export type ExecutionEvaluationCatalogEntry = {
  id: string;
  kind: ExecutionEvaluationKind;
  purpose: string;
  roleRef: string;
  topologyRef: string;
  dependencyRef: string;
  metrics: string[];
  threshold: string;
  passRule: string;
  priority: ExecutionEvaluationPriority;
  validation: string;
  constraintRef: string;
  contextRef: string;
  required: boolean;
  description: string;
};

export type ExecutionEvaluationCatalogManifest = {
  version: typeof V78_EXECUTION_EVALUATION_VERSION;
  entryCount: number;
  kindCount: number;
  catalogComplete: boolean;
  evaluations: ExecutionEvaluationCatalogEntry[];
  summary: string;
};

export type ExecutionEvaluationValidationManifest = {
  version: typeof V78_EXECUTION_EVALUATION_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  validations: ExecutionEvaluationValidation[];
  summary: string;
};

export type ExecutionEvaluationCatalogSignals = {
  executionConstraintCatalogReady?: boolean;
  catalogComplete?: boolean;
  validationsComplete?: boolean;
  refsAligned?: boolean;
  freezeVersionDeclared?: boolean;
};

export type ExecutionEvaluationCatalogReport = {
  version: typeof V78_EXECUTION_EVALUATION_VERSION;
  freezeVersion: typeof V78_EXECUTION_EVALUATION_FREEZE_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  executionConstraintCatalogVersion: string;
  executionConstraintCatalogReady: boolean;
  catalog: ExecutionEvaluationCatalogManifest;
  validations: ExecutionEvaluationValidationManifest;
  catalogReady: boolean;
  readinessScore: number;
  summary: string;
};
