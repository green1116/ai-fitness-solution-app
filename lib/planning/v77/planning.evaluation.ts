/**
 * V77 P5 — Planning evaluation catalog types (read-only)
 */

export const V77_PLANNING_EVALUATION_VERSION = "v77-planning-evaluation-catalog-1" as const;
export const V77_PLANNING_EVALUATION_FREEZE_VERSION =
  "v77-planning-evaluation-catalog-freeze-1" as const;

export type PlanningEvaluationKind =
  | "shared"
  | "role"
  | "topology"
  | "scope"
  | "dependency"
  | "governance"
  | "workspace"
  | "boundary";

export type PlanningEvaluationPriority = "low" | "medium" | "high" | "critical";

export type PlanningEvaluationValidation = {
  id: string;
  evaluationRef: string;
  validationKind: string;
  passCondition: string;
  required: boolean;
  description: string;
};

export type PlanningEvaluationCatalogEntry = {
  id: string;
  kind: PlanningEvaluationKind;
  purpose: string;
  roleRef: string;
  topologyRef: string;
  dependencyRef: string;
  metrics: string[];
  threshold: string;
  passRule: string;
  priority: PlanningEvaluationPriority;
  validation: string;
  constraintRef: string;
  contextRef: string;
  required: boolean;
  description: string;
};

export type PlanningEvaluationCatalogManifest = {
  version: typeof V77_PLANNING_EVALUATION_VERSION;
  entryCount: number;
  kindCount: number;
  catalogComplete: boolean;
  evaluations: PlanningEvaluationCatalogEntry[];
  summary: string;
};

export type PlanningEvaluationValidationManifest = {
  version: typeof V77_PLANNING_EVALUATION_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  validations: PlanningEvaluationValidation[];
  summary: string;
};

export type PlanningEvaluationCatalogSignals = {
  planningConstraintCatalogReady?: boolean;
  catalogComplete?: boolean;
  validationsComplete?: boolean;
  refsAligned?: boolean;
  freezeVersionDeclared?: boolean;
};

export type PlanningEvaluationCatalogReport = {
  version: typeof V77_PLANNING_EVALUATION_VERSION;
  freezeVersion: typeof V77_PLANNING_EVALUATION_FREEZE_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  planningConstraintCatalogVersion: string;
  planningConstraintCatalogReady: boolean;
  catalog: PlanningEvaluationCatalogManifest;
  validations: PlanningEvaluationValidationManifest;
  catalogReady: boolean;
  readinessScore: number;
  summary: string;
};
