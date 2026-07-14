/**
 * E05-P4 — Forecast Engine
 * Runs forecasting via E05 KPI engine
 */

import { executeKpi } from "../kpi/kpi.engine";
import { getKpiById } from "../kpi/kpi.registry";
import { projectForecast } from "./forecast.model";
import { assertForecastDefinition } from "./forecast.registry";
import {
  appendForecastTraceEvent,
  createForecastRuntimeTrace,
  type ForecastRuntimeTrace,
} from "./forecast.trace";
import type {
  ForecastDefinition,
  ForecastExecutionResult,
} from "./forecast.types";

export type ForecastExecuteBundle = {
  result: ForecastExecutionResult;
  trace: ForecastRuntimeTrace;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

export function executeForecast(
  forecast: ForecastDefinition,
  options?: {
    taskId?: string;
    input?: Readonly<Record<string, unknown>>;
    metadata?: Readonly<Record<string, string>>;
    instanceId?: string;
  },
): ForecastExecuteBundle {
  assertForecastDefinition(forecast);

  const startedAt = Date.now();
  const instanceId = options?.instanceId?.trim() || createId("fc-inst");
  const taskId = options?.taskId?.trim() || createId("fc-task");

  let trace = createForecastRuntimeTrace({
    instanceId,
    forecastId: forecast.id,
    taskId,
  });

  trace = appendForecastTraceEvent(
    trace,
    "ready",
    `forecast ${forecast.id} ready`,
    { kpiId: forecast.kpiId },
  );

  try {
    const kpi = getKpiById(forecast.kpiId);
    if (!kpi) {
      throw new Error(`kpi missing: ${forecast.kpiId}`);
    }

    trace = appendForecastTraceEvent(
      trace,
      "kpi",
      `running kpi ${kpi.id}`,
    );

    const kpiRun = executeKpi(kpi, {
      taskId: `${taskId}:kpi`,
      input: options?.input,
      metadata: {
        ...(options?.metadata ?? {}),
        layer: "e05-forecast",
        forecastId: forecast.id,
      },
      instanceId: `${instanceId}:kpi`,
    });

    if (!kpiRun.result.success) {
      throw new Error(
        `kpi failed: ${kpiRun.result.errorMessage ?? "unknown"}`,
      );
    }

    trace = appendForecastTraceEvent(
      trace,
      "model",
      `applying model ${forecast.modelKind}`,
      { horizon: forecast.horizon },
    );

    const projection = projectForecast(forecast, kpiRun.result.evaluation);

    trace = appendForecastTraceEvent(
      trace,
      "project",
      `projected=${projection.projected.toFixed(2)} direction=${projection.direction}`,
      {
        direction: projection.direction,
        confidence: String(projection.confidence),
      },
    );

    const duration = Date.now() - startedAt;
    const result: ForecastExecutionResult = {
      success: true,
      forecastId: forecast.id,
      kpiId: forecast.kpiId,
      instanceId,
      taskId,
      traceId: trace.traceId,
      projection,
      kpiOutput: kpiRun.result.output,
      output: Object.freeze({
        forecastId: forecast.id,
        direction: projection.direction,
        projected: projection.projected,
        confidence: projection.confidence,
        narrative: projection.narrative,
      }),
      duration,
      status: "result",
      readOnly: true,
    };

    trace = appendForecastTraceEvent(
      trace,
      "result",
      `result ready durationMs=${duration}`,
      { success: "true", direction: projection.direction },
    );

    return { result, trace };
  } catch (error) {
    const message = error instanceof Error ? error.message : "forecast failed";
    const duration = Date.now() - startedAt;

    trace = appendForecastTraceEvent(trace, "error", message);

    const result: ForecastExecutionResult = {
      success: false,
      forecastId: forecast.id,
      kpiId: forecast.kpiId,
      instanceId,
      taskId,
      traceId: trace.traceId,
      projection: {
        forecastId: forecast.id,
        kpiId: forecast.kpiId,
        modelKind: forecast.modelKind,
        horizon: forecast.horizon,
        baseline: 0,
        projected: 0,
        direction: "flat",
        confidence: 0,
        points: [],
        narrative: message,
        readOnly: true,
      },
      kpiOutput: {},
      output: {},
      duration,
      status: "failed",
      errorMessage: message,
      readOnly: true,
    };

    return { result, trace };
  }
}

export function executeForecastOrThrow(
  forecast: ForecastDefinition,
  options?: {
    taskId?: string;
    input?: Readonly<Record<string, unknown>>;
    metadata?: Readonly<Record<string, string>>;
    instanceId?: string;
  },
): ForecastExecuteBundle & {
  result: ForecastExecutionResult & { success: true; status: "result" };
} {
  const bundle = executeForecast(forecast, options);
  if (!bundle.result.success || bundle.result.status !== "result") {
    throw new Error(
      `E05 forecast execution failed: ${bundle.result.errorMessage ?? bundle.result.status}`,
    );
  }
  return bundle as ForecastExecuteBundle & {
    result: ForecastExecutionResult & { success: true; status: "result" };
  };
}
