/**
 * V75 P6 — Agent simulation catalog types (read-only)
 */

export const V75_AGENT_SIMULATION_VERSION = "v75-agent-simulation-catalog-1" as const;
export const V75_AGENT_SIMULATION_FREEZE_VERSION =
  "v75-agent-simulation-catalog-freeze-1" as const;

export type AgentSimulationTypeKind =
  | "dryRun"
  | "scenario"
  | "alternative"
  | "comparison"
  | "ranking"
  | "forecast"
  | "sensitivity"
  | "rollbackPreview";

export type AgentSimulationPriority = "low" | "medium" | "high" | "critical";

export type AgentSimulationValidation = {
  id: string;
  simulationRef: string;
  validationKind: string;
  passCondition: string;
  required: boolean;
  description: string;
};

export type AgentSimulationCatalogEntry = {
  id: string;
  type: AgentSimulationTypeKind;
  scenario: string;
  purpose: string;
  inputs: string[];
  outputs: string[];
  branches: string[];
  assumptions: string[];
  expectedResult: string;
  priority: AgentSimulationPriority;
  validation: string;
  evaluationRef: string;
  contextRef: string;
  required: boolean;
  description: string;
};

export type AgentSimulationCatalogManifest = {
  version: typeof V75_AGENT_SIMULATION_VERSION;
  entryCount: number;
  typeCount: number;
  catalogComplete: boolean;
  simulations: AgentSimulationCatalogEntry[];
  summary: string;
};

export type AgentSimulationValidationManifest = {
  version: typeof V75_AGENT_SIMULATION_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  validations: AgentSimulationValidation[];
  summary: string;
};

export type AgentSimulationCatalogSignals = {
  agentEvaluationCatalogReady?: boolean;
  catalogComplete?: boolean;
  validationsComplete?: boolean;
  refsAligned?: boolean;
  freezeVersionDeclared?: boolean;
};

export type AgentSimulationCatalogReport = {
  version: typeof V75_AGENT_SIMULATION_VERSION;
  freezeVersion: typeof V75_AGENT_SIMULATION_FREEZE_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  agentEvaluationCatalogVersion: string;
  agentEvaluationCatalogReady: boolean;
  catalog: AgentSimulationCatalogManifest;
  validations: AgentSimulationValidationManifest;
  catalogReady: boolean;
  readinessScore: number;
  summary: string;
};
