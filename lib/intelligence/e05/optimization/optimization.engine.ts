/**
 * E05-P5 — Optimization Engine
 * Runs option evaluation via E05 forecast engine
 */

import { executeForecast } from "../forecast/forecast.engine";
import { getForecastById } from "../forecast/forecast.registry";
import { assertOptimizationDefinition } from "./optimization.registry";
import { solveOptimization } from "./optimization.solver";
import {
  appendOptimizationTraceEvent,
  createOptimizationRuntimeTrace,
  type OptimizationRuntimeTrace,
} from "./optimization.trace";
import type {
  OptimizationDefinition,
  OptimizationExecutionResult,
} from "./optimization.types";

export type OptimizationExecuteBundle = {
  result: OptimizationExecutionResult;
  trace: OptimizationRuntimeTrace;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

export function executeOptimization(
  optimization: OptimizationDefinition,
  options?: {
    taskId?: string;
    input?: Readonly<Record<string, unknown>>;
    metadata?: Readonly<Record<string, string>>;
    instanceId?: string;
  },
): OptimizationExecuteBundle {
  assertOptimizationDefinition(optimization);

  const startedAt = Date.now();
  const instanceId = options?.instanceId?.trim() || createId("opt-inst");
  const taskId = options?.taskId?.trim() || createId("opt-task");

  let trace = createOptimizationRuntimeTrace({
    instanceId,
    optimizationId: optimization.id,
    taskId,
  });

  trace = appendOptimizationTraceEvent(
    trace,
    "ready",
    `optimization ${optimization.id} ready`,
    { forecastId: optimization.forecastId },
  );

  try {
    const forecast = getForecastById(optimization.forecastId);
    if (!forecast) {
      throw new Error(`forecast missing: ${optimization.forecastId}`);
    }

    trace = appendOptimizationTraceEvent(
      trace,
      "forecast",
      `running forecast ${forecast.id}`,
    );

    const forecastRun = executeForecast(forecast, {
      taskId: `${taskId}:forecast`,
      input: options?.input,
      metadata: {
        ...(options?.metadata ?? {}),
        layer: "e05-optimization",
        optimizationId: optimization.id,
      },
      instanceId: `${instanceId}:forecast`,
    });

    if (!forecastRun.result.success) {
      throw new Error(
        `forecast failed: ${forecastRun.result.errorMessage ?? "unknown"}`,
      );
    }

    trace = appendOptimizationTraceEvent(
      trace,
      "evaluate",
      `scoring ${optimization.options.length} options`,
    );

    const recommendation = solveOptimization(
      optimization,
      forecastRun.result.projection,
    );

    trace = appendOptimizationTraceEvent(
      trace,
      "recommend",
      `selected ${recommendation.selectedOptionId}`,
      {
        action: recommendation.selectedAction,
        optionId: recommendation.selectedOptionId,
      },
    );

    const duration = Date.now() - startedAt;
    const result: OptimizationExecutionResult = {
      success: true,
      optimizationId: optimization.id,
      forecastId: optimization.forecastId,
      instanceId,
      taskId,
      traceId: trace.traceId,
      recommendation,
      forecastOutput: forecastRun.result.output,
      output: Object.freeze({
        optimizationId: optimization.id,
        selectedAction: recommendation.selectedAction,
        selectedOptionId: recommendation.selectedOptionId,
        summary: recommendation.summary,
      }),
      duration,
      status: "result",
      readOnly: true,
    };

    trace = appendOptimizationTraceEvent(
      trace,
      "result",
      `result ready durationMs=${duration}`,
      { success: "true", action: recommendation.selectedAction },
    );

    return { result, trace };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "optimization failed";
    const duration = Date.now() - startedAt;

    trace = appendOptimizationTraceEvent(trace, "error", message);

    const result: OptimizationExecutionResult = {
      success: false,
      optimizationId: optimization.id,
      forecastId: optimization.forecastId,
      instanceId,
      taskId,
      traceId: trace.traceId,
      recommendation: {
        optimizationId: optimization.id,
        forecastId: optimization.forecastId,
        selectedOptionId: "",
        selectedAction: "hold",
        scores: [],
        summary: message,
        readOnly: true,
      },
      forecastOutput: {},
      output: {},
      duration,
      status: "failed",
      errorMessage: message,
      readOnly: true,
    };

    return { result, trace };
  }
}

export function executeOptimizationOrThrow(
  optimization: OptimizationDefinition,
  options?: {
    taskId?: string;
    input?: Readonly<Record<string, unknown>>;
    metadata?: Readonly<Record<string, string>>;
    instanceId?: string;
  },
): OptimizationExecuteBundle & {
  result: OptimizationExecutionResult & { success: true; status: "result" };
} {
  const bundle = executeOptimization(optimization, options);
  if (!bundle.result.success || bundle.result.status !== "result") {
    throw new Error(
      `E05 optimization execution failed: ${bundle.result.errorMessage ?? bundle.result.status}`,
    );
  }
  return bundle as OptimizationExecuteBundle & {
    result: OptimizationExecutionResult & { success: true; status: "result" };
  };
}
