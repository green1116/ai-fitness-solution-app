/**
 * V74 P6 — Decision simulation catalog types (read-only)
 */

export const V74_DECISION_SIMULATION_VERSION = "v74-decision-simulation-catalog-1" as const;
export const V74_DECISION_SIMULATION_FREEZE_VERSION =
  "v74-decision-simulation-catalog-freeze-1" as const;

export type SimulationTypeKind =
  | "dryRun"
  | "scenario"
  | "alternative"
  | "comparison"
  | "ranking"
  | "forecast"
  | "sensitivity"
  | "rollbackPreview";

export type SimulationPriority = "low" | "medium" | "high" | "critical";

export type SimulationValidation = {
  id: string;
  simulationRef: string;
  validationKind: string;
  passCondition: string;
  required: boolean;
  description: string;
};

export type SimulationCatalogEntry = {
  id: string;
  type: SimulationTypeKind;
  purpose: string;
  inputs: string[];
  outputs: string[];
  assumptions: string[];
  expectedResult: string;
  priority: SimulationPriority;
  validation: string;
  evaluationRef: string;
  contextRef: string;
  required: boolean;
  description: string;
};

export type SimulationCatalogManifest = {
  version: typeof V74_DECISION_SIMULATION_VERSION;
  entryCount: number;
  typeCount: number;
  catalogComplete: boolean;
  simulations: SimulationCatalogEntry[];
  summary: string;
};

export type SimulationValidationManifest = {
  version: typeof V74_DECISION_SIMULATION_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  validations: SimulationValidation[];
  summary: string;
};

export type DecisionSimulationCatalogSignals = {
  decisionEvaluationCatalogReady?: boolean;
  catalogComplete?: boolean;
  validationsComplete?: boolean;
  refsAligned?: boolean;
  freezeVersionDeclared?: boolean;
};

export type DecisionSimulationCatalogReport = {
  version: typeof V74_DECISION_SIMULATION_VERSION;
  freezeVersion: typeof V74_DECISION_SIMULATION_FREEZE_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  decisionEvaluationCatalogVersion: string;
  decisionEvaluationCatalogReady: boolean;
  catalog: SimulationCatalogManifest;
  validations: SimulationValidationManifest;
  catalogReady: boolean;
  readinessScore: number;
  summary: string;
};
