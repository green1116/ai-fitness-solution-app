/**
 * V77 P6 — Planning simulation catalog types (read-only)
 */

export const V77_PLANNING_SIMULATION_VERSION = "v77-planning-simulation-catalog-1" as const;
export const V77_PLANNING_SIMULATION_FREEZE_VERSION =
  "v77-planning-simulation-catalog-freeze-1" as const;

export type PlanningSimulationKind =
  | "shared"
  | "role"
  | "topology"
  | "scope"
  | "dependency"
  | "governance"
  | "workspace"
  | "boundary";

export type PlanningSimulationPriority = "low" | "medium" | "high" | "critical";

export type PlanningSimulationValidation = {
  id: string;
  simulationRef: string;
  validationKind: string;
  passCondition: string;
  required: boolean;
  description: string;
};

export type PlanningSimulationCatalogEntry = {
  id: string;
  kind: PlanningSimulationKind;
  scenario: string;
  purpose: string;
  roleRef: string;
  topologyRef: string;
  dependencyRef: string;
  branches: string[];
  assumptions: string[];
  expectedResult: string;
  priority: PlanningSimulationPriority;
  validation: string;
  evaluationRef: string;
  contextRef: string;
  required: boolean;
  description: string;
};

export type PlanningSimulationCatalogManifest = {
  version: typeof V77_PLANNING_SIMULATION_VERSION;
  entryCount: number;
  kindCount: number;
  catalogComplete: boolean;
  simulations: PlanningSimulationCatalogEntry[];
  summary: string;
};

export type PlanningSimulationValidationManifest = {
  version: typeof V77_PLANNING_SIMULATION_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  validations: PlanningSimulationValidation[];
  summary: string;
};

export type PlanningSimulationCatalogSignals = {
  planningEvaluationCatalogReady?: boolean;
  catalogComplete?: boolean;
  validationsComplete?: boolean;
  refsAligned?: boolean;
  freezeVersionDeclared?: boolean;
};

export type PlanningSimulationCatalogReport = {
  version: typeof V77_PLANNING_SIMULATION_VERSION;
  freezeVersion: typeof V77_PLANNING_SIMULATION_FREEZE_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  planningEvaluationCatalogVersion: string;
  planningEvaluationCatalogReady: boolean;
  catalog: PlanningSimulationCatalogManifest;
  validations: PlanningSimulationValidationManifest;
  catalogReady: boolean;
  readinessScore: number;
  summary: string;
};
