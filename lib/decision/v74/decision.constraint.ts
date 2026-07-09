/**
 * V74 P4 — Decision constraint catalog types (read-only)
 */

export const V74_DECISION_CONSTRAINT_VERSION = "v74-decision-constraint-catalog-1" as const;
export const V74_DECISION_CONSTRAINT_FREEZE_VERSION =
  "v74-decision-constraint-catalog-freeze-1" as const;

export type ConstraintTypeKind =
  | "hardRule"
  | "softRule"
  | "priority"
  | "conflict"
  | "dependency"
  | "limit"
  | "precondition"
  | "postcondition";

export type ConstraintLevel = "L1" | "L2" | "L3" | "critical";

export type ConstraintPriority = "low" | "medium" | "high" | "critical";

export type ConstraintValidation = {
  id: string;
  constraintRef: string;
  validationKind: string;
  passCondition: string;
  required: boolean;
  description: string;
};

export type ConstraintCatalogEntry = {
  id: string;
  type: ConstraintTypeKind;
  purpose: string;
  level: ConstraintLevel;
  trigger: string;
  condition: string;
  resolution: string;
  priority: ConstraintPriority;
  validation: string;
  inventoryConstraintRef: string;
  contextRef: string;
  policyRef: string;
  required: boolean;
  description: string;
};

export type ConstraintCatalogManifest = {
  version: typeof V74_DECISION_CONSTRAINT_VERSION;
  entryCount: number;
  typeCount: number;
  catalogComplete: boolean;
  constraints: ConstraintCatalogEntry[];
  summary: string;
};

export type ConstraintValidationManifest = {
  version: typeof V74_DECISION_CONSTRAINT_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  validations: ConstraintValidation[];
  summary: string;
};

export type DecisionConstraintCatalogSignals = {
  decisionContextCatalogReady?: boolean;
  catalogComplete?: boolean;
  validationsComplete?: boolean;
  refsAligned?: boolean;
  freezeVersionDeclared?: boolean;
};

export type DecisionConstraintCatalogReport = {
  version: typeof V74_DECISION_CONSTRAINT_VERSION;
  freezeVersion: typeof V74_DECISION_CONSTRAINT_FREEZE_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  decisionContextCatalogVersion: string;
  decisionContextCatalogReady: boolean;
  catalog: ConstraintCatalogManifest;
  validations: ConstraintValidationManifest;
  catalogReady: boolean;
  readinessScore: number;
  summary: string;
};
