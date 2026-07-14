/**
 * E05-P7 — Autonomous Strategy Agent types
 * Strategy agent layer above simulation
 */

import {
  E05_STRATEGY_AGENT_ID,
  E05_STRATEGY_BASE,
  E05_STRATEGY_FREEZE_VERSION,
  E05_STRATEGY_VERSION,
  STRATEGY_PLAN_STEP_KINDS,
  STRATEGY_STANCES,
} from "./strategy.constants";

export type StrategyStance = (typeof STRATEGY_STANCES)[number];
export type StrategyPlanStepKind =
  (typeof STRATEGY_PLAN_STEP_KINDS)[number];

export type StrategyDefinition = {
  id: string;
  name: string;
  description: string;
  /** Bound E05 simulation id */
  simulationId: string;
  preferredStance: StrategyStance;
  optional: boolean;
  readOnly: true;
};

export type StrategyPlanStep = {
  id: string;
  kind: StrategyPlanStepKind;
  title: string;
  detail: string;
  order: number;
  readOnly: true;
};

export type StrategyPlan = {
  strategyId: string;
  simulationId: string;
  stance: StrategyStance;
  preferredScenarioId: string;
  preferredAction: string;
  steps: StrategyPlanStep[];
  narrative: string;
  confidence: number;
  readOnly: true;
};

export type StrategyExecutionResult = {
  success: boolean;
  strategyId: string;
  simulationId: string;
  instanceId: string;
  taskId: string;
  traceId: string;
  plan: StrategyPlan;
  simulationOutput: Readonly<Record<string, unknown>>;
  output: Readonly<Record<string, unknown>>;
  duration: number;
  status: "result" | "failed";
  errorMessage?: string;
  readOnly: true;
};

export type StrategyRegistryManifest = {
  agentId: typeof E05_STRATEGY_AGENT_ID;
  version: typeof E05_STRATEGY_VERSION;
  freezeVersion: typeof E05_STRATEGY_FREEZE_VERSION;
  base: typeof E05_STRATEGY_BASE;
  strategyCount: number;
  strategies: StrategyDefinition[];
  catalogComplete: boolean;
  readOnly: true;
};
