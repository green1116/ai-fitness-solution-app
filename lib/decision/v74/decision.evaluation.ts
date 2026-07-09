/**
 * V74 P5 — Decision evaluation catalog types (read-only)
 */

export const V74_DECISION_EVALUATION_VERSION = "v74-decision-evaluation-catalog-1" as const;
export const V74_DECISION_EVALUATION_FREEZE_VERSION =
  "v74-decision-evaluation-catalog-freeze-1" as const;

export type EvaluationDimensionKind =
  | "score"
  | "confidence"
  | "risk"
  | "quality"
  | "cost"
  | "benefit"
  | "impact"
  | "explainability";

export type EvaluationPriority = "low" | "medium" | "high" | "critical";

export type EvaluationValidation = {
  id: string;
  evaluationRef: string;
  validationKind: string;
  passCondition: string;
  required: boolean;
  description: string;
};

export type EvaluationCatalogEntry = {
  id: string;
  dimension: EvaluationDimensionKind;
  purpose: string;
  inputs: string[];
  outputs: string[];
  metrics: string[];
  threshold: string;
  priority: EvaluationPriority;
  validation: string;
  constraintRef: string;
  contextRef: string;
  required: boolean;
  description: string;
};

export type EvaluationCatalogManifest = {
  version: typeof V74_DECISION_EVALUATION_VERSION;
  entryCount: number;
  dimensionCount: number;
  catalogComplete: boolean;
  evaluations: EvaluationCatalogEntry[];
  summary: string;
};

export type EvaluationValidationManifest = {
  version: typeof V74_DECISION_EVALUATION_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  validations: EvaluationValidation[];
  summary: string;
};

export type DecisionEvaluationCatalogSignals = {
  decisionConstraintCatalogReady?: boolean;
  catalogComplete?: boolean;
  validationsComplete?: boolean;
  refsAligned?: boolean;
  freezeVersionDeclared?: boolean;
};

export type DecisionEvaluationCatalogReport = {
  version: typeof V74_DECISION_EVALUATION_VERSION;
  freezeVersion: typeof V74_DECISION_EVALUATION_FREEZE_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  decisionConstraintCatalogVersion: string;
  decisionConstraintCatalogReady: boolean;
  catalog: EvaluationCatalogManifest;
  validations: EvaluationValidationManifest;
  catalogReady: boolean;
  readinessScore: number;
  summary: string;
};
