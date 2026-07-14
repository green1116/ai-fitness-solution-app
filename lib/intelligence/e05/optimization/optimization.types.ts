/**
 * E05-P5 — Optimization Engine types
 * Optimization layer above forecasting
 */

import {
  E05_OPTIMIZATION_BASE,
  E05_OPTIMIZATION_ENGINE_ID,
  E05_OPTIMIZATION_FREEZE_VERSION,
  E05_OPTIMIZATION_VERSION,
  OPTIMIZATION_OBJECTIVE_KINDS,
  OPTIMIZATION_OPTION_ACTIONS,
} from "./optimization.constants";

export type OptimizationObjectiveKind =
  (typeof OPTIMIZATION_OBJECTIVE_KINDS)[number];
export type OptimizationOptionAction =
  (typeof OPTIMIZATION_OPTION_ACTIONS)[number];

export type OptimizationOption = {
  id: string;
  action: OptimizationOptionAction;
  label: string;
  /** Relative score bias applied during evaluation */
  bias: number;
  cost: number;
  readOnly: true;
};

export type OptimizationDefinition = {
  id: string;
  name: string;
  description: string;
  /** Bound E05 forecast id */
  forecastId: string;
  objective: OptimizationObjectiveKind;
  options: OptimizationOption[];
  optional: boolean;
  readOnly: true;
};

export type OptimizationOptionScore = {
  optionId: string;
  action: OptimizationOptionAction;
  score: number;
  rationale: string;
  readOnly: true;
};

export type OptimizationRecommendation = {
  optimizationId: string;
  forecastId: string;
  selectedOptionId: string;
  selectedAction: OptimizationOptionAction;
  scores: OptimizationOptionScore[];
  summary: string;
  readOnly: true;
};

export type OptimizationExecutionResult = {
  success: boolean;
  optimizationId: string;
  forecastId: string;
  instanceId: string;
  taskId: string;
  traceId: string;
  recommendation: OptimizationRecommendation;
  forecastOutput: Readonly<Record<string, unknown>>;
  output: Readonly<Record<string, unknown>>;
  duration: number;
  status: "result" | "failed";
  errorMessage?: string;
  readOnly: true;
};

export type OptimizationRegistryManifest = {
  engineId: typeof E05_OPTIMIZATION_ENGINE_ID;
  version: typeof E05_OPTIMIZATION_VERSION;
  freezeVersion: typeof E05_OPTIMIZATION_FREEZE_VERSION;
  base: typeof E05_OPTIMIZATION_BASE;
  optimizationCount: number;
  optimizations: OptimizationDefinition[];
  catalogComplete: boolean;
  readOnly: true;
};
