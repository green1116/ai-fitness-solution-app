/**
 * E05-P7 — Strategy Engine
 * Runs autonomous strategy planning via E05 simulation engine
 */

import { executeSimulation } from "../simulation/simulation.engine";
import { getSimulationById } from "../simulation/simulation.registry";
import { planStrategy } from "./strategy.planner";
import { assertStrategyDefinition } from "./strategy.registry";
import {
  appendStrategyTraceEvent,
  createStrategyRuntimeTrace,
  type StrategyRuntimeTrace,
} from "./strategy.trace";
import type {
  StrategyDefinition,
  StrategyExecutionResult,
} from "./strategy.types";

export type StrategyExecuteBundle = {
  result: StrategyExecutionResult;
  trace: StrategyRuntimeTrace;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

export function executeStrategy(
  strategy: StrategyDefinition,
  options?: {
    taskId?: string;
    input?: Readonly<Record<string, unknown>>;
    metadata?: Readonly<Record<string, string>>;
    instanceId?: string;
  },
): StrategyExecuteBundle {
  assertStrategyDefinition(strategy);

  const startedAt = Date.now();
  const instanceId = options?.instanceId?.trim() || createId("str-inst");
  const taskId = options?.taskId?.trim() || createId("str-task");

  let trace = createStrategyRuntimeTrace({
    instanceId,
    strategyId: strategy.id,
    taskId,
  });

  trace = appendStrategyTraceEvent(
    trace,
    "ready",
    `strategy ${strategy.id} ready`,
    { simulationId: strategy.simulationId },
  );

  try {
    const simulation = getSimulationById(strategy.simulationId);
    if (!simulation) {
      throw new Error(`simulation missing: ${strategy.simulationId}`);
    }

    trace = appendStrategyTraceEvent(
      trace,
      "simulate",
      `running simulation ${simulation.id}`,
    );

    const simRun = executeSimulation(simulation, {
      taskId: `${taskId}:simulation`,
      input: options?.input,
      metadata: {
        ...(options?.metadata ?? {}),
        layer: "e05-strategy",
        strategyId: strategy.id,
      },
      instanceId: `${instanceId}:simulation`,
    });

    if (!simRun.result.success) {
      throw new Error(
        `simulation failed: ${simRun.result.errorMessage ?? "unknown"}`,
      );
    }

    trace = appendStrategyTraceEvent(
      trace,
      "plan",
      `planning from best=${simRun.result.comparison.bestScenarioId}`,
    );

    const plan = planStrategy(strategy, simRun.result.comparison);

    trace = appendStrategyTraceEvent(
      trace,
      "compose",
      `composed stance=${plan.stance}`,
      {
        stance: plan.stance,
        action: plan.preferredAction,
        scenarioId: plan.preferredScenarioId,
      },
    );

    const duration = Date.now() - startedAt;
    const result: StrategyExecutionResult = {
      success: true,
      strategyId: strategy.id,
      simulationId: strategy.simulationId,
      instanceId,
      taskId,
      traceId: trace.traceId,
      plan,
      simulationOutput: simRun.result.output,
      output: Object.freeze({
        strategyId: strategy.id,
        stance: plan.stance,
        preferredAction: plan.preferredAction,
        preferredScenarioId: plan.preferredScenarioId,
        stepCount: plan.steps.length,
        narrative: plan.narrative,
      }),
      duration,
      status: "result",
      readOnly: true,
    };

    trace = appendStrategyTraceEvent(
      trace,
      "result",
      `result ready durationMs=${duration}`,
      { success: "true", stance: plan.stance },
    );

    return { result, trace };
  } catch (error) {
    const message = error instanceof Error ? error.message : "strategy failed";
    const duration = Date.now() - startedAt;

    trace = appendStrategyTraceEvent(trace, "error", message);

    const result: StrategyExecutionResult = {
      success: false,
      strategyId: strategy.id,
      simulationId: strategy.simulationId,
      instanceId,
      taskId,
      traceId: trace.traceId,
      plan: {
        strategyId: strategy.id,
        simulationId: strategy.simulationId,
        stance: strategy.preferredStance,
        preferredScenarioId: "",
        preferredAction: "",
        steps: [],
        narrative: message,
        confidence: 0,
        readOnly: true,
      },
      simulationOutput: {},
      output: {},
      duration,
      status: "failed",
      errorMessage: message,
      readOnly: true,
    };

    return { result, trace };
  }
}

export function executeStrategyOrThrow(
  strategy: StrategyDefinition,
  options?: {
    taskId?: string;
    input?: Readonly<Record<string, unknown>>;
    metadata?: Readonly<Record<string, string>>;
    instanceId?: string;
  },
): StrategyExecuteBundle & {
  result: StrategyExecutionResult & { success: true; status: "result" };
} {
  const bundle = executeStrategy(strategy, options);
  if (!bundle.result.success || bundle.result.status !== "result") {
    throw new Error(
      `E05 strategy execution failed: ${bundle.result.errorMessage ?? bundle.result.status}`,
    );
  }
  return bundle as StrategyExecuteBundle & {
    result: StrategyExecutionResult & { success: true; status: "result" };
  };
}
