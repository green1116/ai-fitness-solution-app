/**
 * E05-P6 — Simulation Engine
 * Runs scenario simulation via E05 optimization engine
 */

import { executeOptimization } from "../optimization/optimization.engine";
import { getOptimizationById } from "../optimization/optimization.registry";
import { assertSimulationDefinition } from "./simulation.registry";
import {
  compareScenarioResults,
  mergeScenarioInput,
} from "./simulation.scenario";
import {
  appendSimulationTraceEvent,
  createSimulationRuntimeTrace,
  type SimulationRuntimeTrace,
} from "./simulation.trace";
import type {
  SimulationDefinition,
  SimulationExecutionResult,
  SimulationScenarioResult,
} from "./simulation.types";

export type SimulationExecuteBundle = {
  result: SimulationExecutionResult;
  trace: SimulationRuntimeTrace;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

export function executeSimulation(
  simulation: SimulationDefinition,
  options?: {
    taskId?: string;
    input?: Readonly<Record<string, unknown>>;
    metadata?: Readonly<Record<string, string>>;
    instanceId?: string;
  },
): SimulationExecuteBundle {
  assertSimulationDefinition(simulation);

  const startedAt = Date.now();
  const instanceId = options?.instanceId?.trim() || createId("sim-inst");
  const taskId = options?.taskId?.trim() || createId("sim-task");
  const baseInput = Object.freeze({ ...(options?.input ?? {}) });

  let trace = createSimulationRuntimeTrace({
    instanceId,
    simulationId: simulation.id,
    taskId,
  });

  trace = appendSimulationTraceEvent(
    trace,
    "ready",
    `simulation ${simulation.id} ready`,
    { optimizationId: simulation.optimizationId },
  );

  try {
    const optimization = getOptimizationById(simulation.optimizationId);
    if (!optimization) {
      throw new Error(`optimization missing: ${simulation.optimizationId}`);
    }

    const scenarioResults: SimulationScenarioResult[] = [];

    for (const scenario of simulation.scenarios) {
      trace = appendSimulationTraceEvent(
        trace,
        "scenario",
        `running scenario ${scenario.id}`,
        { kind: scenario.kind },
      );

      const scenarioInput = mergeScenarioInput(baseInput, scenario);

      trace = appendSimulationTraceEvent(
        trace,
        "optimize",
        `optimize under ${scenario.id}`,
      );

      const optRun = executeOptimization(optimization, {
        taskId: `${taskId}:${scenario.id}`,
        input: scenarioInput,
        metadata: {
          ...(options?.metadata ?? {}),
          layer: "e05-simulation",
          simulationId: simulation.id,
          scenarioId: scenario.id,
        },
        instanceId: `${instanceId}:${scenario.id}`,
      });

      if (!optRun.result.success) {
        throw new Error(
          `scenario ${scenario.id} failed: ${optRun.result.errorMessage ?? "unknown"}`,
        );
      }

      const topScore =
        optRun.result.recommendation.scores[0]?.score ??
        0;

      scenarioResults.push({
        scenarioId: scenario.id,
        kind: scenario.kind,
        selectedAction: optRun.result.recommendation.selectedAction,
        selectedOptionId: optRun.result.recommendation.selectedOptionId,
        score: topScore,
        optimizationSummary: optRun.result.recommendation.summary,
        input: scenarioInput,
        readOnly: true,
      });
    }

    trace = appendSimulationTraceEvent(
      trace,
      "compare",
      `comparing ${scenarioResults.length} scenarios`,
    );

    const comparison = compareScenarioResults(simulation, scenarioResults);
    const duration = Date.now() - startedAt;

    const result: SimulationExecutionResult = {
      success: true,
      simulationId: simulation.id,
      optimizationId: simulation.optimizationId,
      instanceId,
      taskId,
      traceId: trace.traceId,
      comparison,
      output: Object.freeze({
        simulationId: simulation.id,
        bestScenarioId: comparison.bestScenarioId,
        worstScenarioId: comparison.worstScenarioId,
        spread: comparison.spread,
        verdict: comparison.verdict,
      }),
      duration,
      status: "result",
      readOnly: true,
    };

    trace = appendSimulationTraceEvent(
      trace,
      "result",
      `result ready durationMs=${duration}`,
      {
        success: "true",
        best: comparison.bestScenarioId,
      },
    );

    return { result, trace };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "simulation failed";
    const duration = Date.now() - startedAt;

    trace = appendSimulationTraceEvent(trace, "error", message);

    const result: SimulationExecutionResult = {
      success: false,
      simulationId: simulation.id,
      optimizationId: simulation.optimizationId,
      instanceId,
      taskId,
      traceId: trace.traceId,
      comparison: {
        simulationId: simulation.id,
        bestScenarioId: "",
        worstScenarioId: "",
        spread: 0,
        verdict: message,
        results: [],
        readOnly: true,
      },
      output: {},
      duration,
      status: "failed",
      errorMessage: message,
      readOnly: true,
    };

    return { result, trace };
  }
}

export function executeSimulationOrThrow(
  simulation: SimulationDefinition,
  options?: {
    taskId?: string;
    input?: Readonly<Record<string, unknown>>;
    metadata?: Readonly<Record<string, string>>;
    instanceId?: string;
  },
): SimulationExecuteBundle & {
  result: SimulationExecutionResult & { success: true; status: "result" };
} {
  const bundle = executeSimulation(simulation, options);
  if (!bundle.result.success || bundle.result.status !== "result") {
    throw new Error(
      `E05 simulation execution failed: ${bundle.result.errorMessage ?? bundle.result.status}`,
    );
  }
  return bundle as SimulationExecuteBundle & {
    result: SimulationExecutionResult & { success: true; status: "result" };
  };
}
