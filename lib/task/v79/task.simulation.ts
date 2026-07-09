/**
 * V79 P6 — Task simulation catalog types (read-only)
 */

export const V79_TASK_SIMULATION_VERSION = "v79-task-simulation-catalog-1" as const;
export const V79_TASK_SIMULATION_FREEZE_VERSION =
  "v79-task-simulation-catalog-freeze-1" as const;

export type TaskSimulationKind =
  | "shared"
  | "role"
  | "state"
  | "topology"
  | "scope"
  | "dependency"
  | "governance"
  | "boundary";

export type TaskSimulationPriority = "low" | "medium" | "high" | "critical";

export type TaskSimulationValidation = {
  id: string;
  simulationRef: string;
  validationKind: string;
  passCondition: string;
  required: boolean;
  description: string;
};

export type TaskSimulationCatalogEntry = {
  id: string;
  kind: TaskSimulationKind;
  scenario: string;
  purpose: string;
  roleRef: string;
  stateRef: string;
  topologyRef: string;
  dependencyRef: string;
  branches: string[];
  assumptions: string[];
  expectedResult: string;
  priority: TaskSimulationPriority;
  validation: string;
  evaluationRef: string;
  contextRef: string;
  required: boolean;
  description: string;
};

export type TaskSimulationCatalogManifest = {
  version: typeof V79_TASK_SIMULATION_VERSION;
  entryCount: number;
  kindCount: number;
  catalogComplete: boolean;
  simulations: TaskSimulationCatalogEntry[];
  summary: string;
};

export type TaskSimulationValidationManifest = {
  version: typeof V79_TASK_SIMULATION_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  validations: TaskSimulationValidation[];
  summary: string;
};

export type TaskSimulationCatalogSignals = {
  taskEvaluationCatalogReady?: boolean;
  catalogComplete?: boolean;
  validationsComplete?: boolean;
  refsAligned?: boolean;
  freezeVersionDeclared?: boolean;
};

export type TaskSimulationCatalogReport = {
  version: typeof V79_TASK_SIMULATION_VERSION;
  freezeVersion: typeof V79_TASK_SIMULATION_FREEZE_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  taskEvaluationCatalogVersion: string;
  taskEvaluationCatalogReady: boolean;
  catalog: TaskSimulationCatalogManifest;
  validations: TaskSimulationValidationManifest;
  catalogReady: boolean;
  readinessScore: number;
  summary: string;
};
