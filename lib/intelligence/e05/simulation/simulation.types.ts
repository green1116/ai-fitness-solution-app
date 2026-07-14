/**
 * E05-P6 — Enterprise Simulation Runtime types
 * Scenario simulation layer above optimization
 */

import {
  E05_SIMULATION_BASE,
  E05_SIMULATION_FREEZE_VERSION,
  E05_SIMULATION_RUNTIME_ID,
  E05_SIMULATION_VERSION,
  SIMULATION_SCENARIO_KINDS,
} from "./simulation.constants";

export type SimulationScenarioKind =
  (typeof SIMULATION_SCENARIO_KINDS)[number];

export type SimulationScenarioDefinition = {
  id: string;
  kind: SimulationScenarioKind;
  name: string;
  description: string;
  /** Additive overrides applied to optimization input */
  inputDelta: Readonly<Record<string, number>>;
  weight: number;
  readOnly: true;
};

export type SimulationDefinition = {
  id: string;
  name: string;
  description: string;
  /** Bound E05 optimization id */
  optimizationId: string;
  scenarios: SimulationScenarioDefinition[];
  optional: boolean;
  readOnly: true;
};

export type SimulationScenarioResult = {
  scenarioId: string;
  kind: SimulationScenarioKind;
  selectedAction: string;
  selectedOptionId: string;
  score: number;
  optimizationSummary: string;
  input: Readonly<Record<string, unknown>>;
  readOnly: true;
};

export type SimulationComparison = {
  simulationId: string;
  bestScenarioId: string;
  worstScenarioId: string;
  spread: number;
  verdict: string;
  results: SimulationScenarioResult[];
  readOnly: true;
};

export type SimulationExecutionResult = {
  success: boolean;
  simulationId: string;
  optimizationId: string;
  instanceId: string;
  taskId: string;
  traceId: string;
  comparison: SimulationComparison;
  output: Readonly<Record<string, unknown>>;
  duration: number;
  status: "result" | "failed";
  errorMessage?: string;
  readOnly: true;
};

export type SimulationRegistryManifest = {
  runtimeId: typeof E05_SIMULATION_RUNTIME_ID;
  version: typeof E05_SIMULATION_VERSION;
  freezeVersion: typeof E05_SIMULATION_FREEZE_VERSION;
  base: typeof E05_SIMULATION_BASE;
  simulationCount: number;
  simulations: SimulationDefinition[];
  catalogComplete: boolean;
  readOnly: true;
};
