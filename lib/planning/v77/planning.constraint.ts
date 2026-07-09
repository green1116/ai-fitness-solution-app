/**
 * V77 P4 — Planning constraint catalog types (read-only)
 */

export const V77_PLANNING_CONSTRAINT_VERSION = "v77-planning-constraint-catalog-1" as const;
export const V77_PLANNING_CONSTRAINT_FREEZE_VERSION =
  "v77-planning-constraint-catalog-freeze-1" as const;

export type PlanningConstraintKind =
  | "shared"
  | "role"
  | "topology"
  | "scope"
  | "dependency"
  | "governance"
  | "workspace"
  | "boundary";

export type PlanningConstraintLevel = "L1" | "L2" | "L3" | "critical";

export type PlanningConstraintPriority = "low" | "medium" | "high" | "critical";

export type PlanningConstraintValidation = {
  id: string;
  constraintRef: string;
  validationKind: string;
  passCondition: string;
  required: boolean;
  description: string;
};

export type PlanningConstraintCatalogEntry = {
  id: string;
  kind: PlanningConstraintKind;
  purpose: string;
  scopeRef: string;
  level: PlanningConstraintLevel;
  trigger: string;
  condition: string;
  resolution: string;
  priority: PlanningConstraintPriority;
  validation: string;
  inventoryGovernanceRef: string;
  contextRef: string;
  policyRef: string;
  required: boolean;
  description: string;
};

export type PlanningConstraintCatalogManifest = {
  version: typeof V77_PLANNING_CONSTRAINT_VERSION;
  entryCount: number;
  kindCount: number;
  catalogComplete: boolean;
  constraints: PlanningConstraintCatalogEntry[];
  summary: string;
};

export type PlanningConstraintValidationManifest = {
  version: typeof V77_PLANNING_CONSTRAINT_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  validations: PlanningConstraintValidation[];
  summary: string;
};

export type PlanningConstraintCatalogSignals = {
  planningContextCatalogReady?: boolean;
  catalogComplete?: boolean;
  validationsComplete?: boolean;
  refsAligned?: boolean;
  freezeVersionDeclared?: boolean;
};

export type PlanningConstraintCatalogReport = {
  version: typeof V77_PLANNING_CONSTRAINT_VERSION;
  freezeVersion: typeof V77_PLANNING_CONSTRAINT_FREEZE_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  planningContextCatalogVersion: string;
  planningContextCatalogReady: boolean;
  catalog: PlanningConstraintCatalogManifest;
  validations: PlanningConstraintValidationManifest;
  catalogReady: boolean;
  readinessScore: number;
  summary: string;
};
