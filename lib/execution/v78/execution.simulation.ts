/**
 * V78 P6 — Execution simulation catalog types (read-only)
 */

export const V78_EXECUTION_SIMULATION_VERSION = "v78-execution-simulation-catalog-1" as const;
export const V78_EXECUTION_SIMULATION_FREEZE_VERSION =
  "v78-execution-simulation-catalog-freeze-1" as const;

export type ExecutionSimulationKind =
  | "shared"
  | "role"
  | "topology"
  | "scope"
  | "dependency"
  | "governance"
  | "workspace"
  | "boundary";

export type ExecutionSimulationPriority = "low" | "medium" | "high" | "critical";

export type ExecutionSimulationValidation = {
  id: string;
  simulationRef: string;
  validationKind: string;
  passCondition: string;
  required: boolean;
  description: string;
};

export type ExecutionSimulationCatalogEntry = {
  id: string;
  kind: ExecutionSimulationKind;
  scenario: string;
  purpose: string;
  roleRef: string;
  topologyRef: string;
  dependencyRef: string;
  branches: string[];
  assumptions: string[];
  expectedResult: string;
  priority: ExecutionSimulationPriority;
  validation: string;
  evaluationRef: string;
  contextRef: string;
  required: boolean;
  description: string;
};

export type ExecutionSimulationCatalogManifest = {
  version: typeof V78_EXECUTION_SIMULATION_VERSION;
  entryCount: number;
  kindCount: number;
  catalogComplete: boolean;
  simulations: ExecutionSimulationCatalogEntry[];
  summary: string;
};

export type ExecutionSimulationValidationManifest = {
  version: typeof V78_EXECUTION_SIMULATION_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  validations: ExecutionSimulationValidation[];
  summary: string;
};

export type ExecutionSimulationCatalogSignals = {
  executionEvaluationCatalogReady?: boolean;
  catalogComplete?: boolean;
  validationsComplete?: boolean;
  refsAligned?: boolean;
  freezeVersionDeclared?: boolean;
};

export type ExecutionSimulationCatalogReport = {
  version: typeof V78_EXECUTION_SIMULATION_VERSION;
  freezeVersion: typeof V78_EXECUTION_SIMULATION_FREEZE_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  executionEvaluationCatalogVersion: string;
  executionEvaluationCatalogReady: boolean;
  catalog: ExecutionSimulationCatalogManifest;
  validations: ExecutionSimulationValidationManifest;
  catalogReady: boolean;
  readinessScore: number;
  summary: string;
};
