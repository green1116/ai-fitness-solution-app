/**
 * E05-P3 — KPI Engine
 * Runs KPI interpretation via E05 analytics engine
 */

import { executeAnalytics } from "../analytics/analytics.engine";
import { getAnalyticsById } from "../analytics/analytics.registry";
import { evaluateKpi } from "./kpi.evaluator";
import { assertKpiDefinition } from "./kpi.registry";
import {
  appendKpiTraceEvent,
  createKpiRuntimeTrace,
  type KpiRuntimeTrace,
} from "./kpi.trace";
import type { KpiDefinition, KpiExecutionResult } from "./kpi.types";

export type KpiExecuteBundle = {
  result: KpiExecutionResult;
  trace: KpiRuntimeTrace;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

export function executeKpi(
  kpi: KpiDefinition,
  options?: {
    taskId?: string;
    input?: Readonly<Record<string, unknown>>;
    metadata?: Readonly<Record<string, string>>;
    instanceId?: string;
  },
): KpiExecuteBundle {
  assertKpiDefinition(kpi);

  const startedAt = Date.now();
  const instanceId = options?.instanceId?.trim() || createId("kpi-inst");
  const taskId = options?.taskId?.trim() || createId("kpi-task");

  let trace = createKpiRuntimeTrace({
    instanceId,
    kpiId: kpi.id,
    taskId,
  });

  trace = appendKpiTraceEvent(trace, "ready", `kpi ${kpi.id} ready`, {
    analyticsId: kpi.analyticsId,
  });

  try {
    const analytics = getAnalyticsById(kpi.analyticsId);
    if (!analytics) {
      throw new Error(`analytics missing: ${kpi.analyticsId}`);
    }

    trace = appendKpiTraceEvent(
      trace,
      "analytics",
      `running analytics ${analytics.id}`,
    );

    const analyticsRun = executeAnalytics(analytics, {
      taskId: `${taskId}:analytics`,
      input: options?.input,
      metadata: {
        ...(options?.metadata ?? {}),
        layer: "e05-kpi",
        kpiId: kpi.id,
      },
      instanceId: `${instanceId}:analytics`,
    });

    if (!analyticsRun.result.success) {
      throw new Error(
        `analytics failed: ${analyticsRun.result.errorMessage ?? "unknown"}`,
      );
    }

    const metric = analyticsRun.result.metrics.find(
      (m) => m.metricId === kpi.metricId,
    );
    if (!metric) {
      throw new Error(`metric ${kpi.metricId} missing from analytics output`);
    }

    trace = appendKpiTraceEvent(
      trace,
      "evaluate",
      `evaluating metric value=${metric.value}`,
    );

    const evaluation = evaluateKpi(kpi, metric);

    trace = appendKpiTraceEvent(
      trace,
      "interpret",
      `status=${evaluation.status}`,
      { status: evaluation.status },
    );

    const duration = Date.now() - startedAt;
    const result: KpiExecutionResult = {
      success: true,
      kpiId: kpi.id,
      analyticsId: kpi.analyticsId,
      instanceId,
      taskId,
      traceId: trace.traceId,
      evaluation,
      analyticsOutput: analyticsRun.result.output,
      output: Object.freeze({
        kpiId: kpi.id,
        status: evaluation.status,
        value: evaluation.value,
        interpretation: evaluation.interpretation,
      }),
      duration,
      status: "result",
      readOnly: true,
    };

    trace = appendKpiTraceEvent(
      trace,
      "result",
      `result ready durationMs=${duration}`,
      { success: "true", status: evaluation.status },
    );

    return { result, trace };
  } catch (error) {
    const message = error instanceof Error ? error.message : "kpi failed";
    const duration = Date.now() - startedAt;

    trace = appendKpiTraceEvent(trace, "error", message);

    const result: KpiExecutionResult = {
      success: false,
      kpiId: kpi.id,
      analyticsId: kpi.analyticsId,
      instanceId,
      taskId,
      traceId: trace.traceId,
      evaluation: {
        kpiId: kpi.id,
        metricId: kpi.metricId,
        value: 0,
        status: "unknown",
        interpretation: message,
        readOnly: true,
      },
      analyticsOutput: {},
      output: {},
      duration,
      status: "failed",
      errorMessage: message,
      readOnly: true,
    };

    return { result, trace };
  }
}

export function executeKpiOrThrow(
  kpi: KpiDefinition,
  options?: {
    taskId?: string;
    input?: Readonly<Record<string, unknown>>;
    metadata?: Readonly<Record<string, string>>;
    instanceId?: string;
  },
): KpiExecuteBundle & {
  result: KpiExecutionResult & { success: true; status: "result" };
} {
  const bundle = executeKpi(kpi, options);
  if (!bundle.result.success || bundle.result.status !== "result") {
    throw new Error(
      `E05 kpi execution failed: ${bundle.result.errorMessage ?? bundle.result.status}`,
    );
  }
  return bundle as KpiExecuteBundle & {
    result: KpiExecutionResult & { success: true; status: "result" };
  };
}
