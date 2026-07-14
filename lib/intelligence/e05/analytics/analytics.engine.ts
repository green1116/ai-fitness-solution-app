/**
 * E05-P2 — Business Analytics Engine
 * Runs analytics via E05 intelligence executor
 */

import { getIntelligenceById } from "../core/intelligence.registry";
import { createIntelligenceExecutionContext } from "../runtime/intelligence.context";
import { executeIntelligence } from "../runtime/intelligence.executor";
import { calculateMetrics } from "./analytics.metric";
import { assertAnalyticsDefinition } from "./analytics.registry";
import {
  appendAnalyticsTraceEvent,
  createAnalyticsRuntimeTrace,
  type AnalyticsRuntimeTrace,
} from "./analytics.trace";
import type {
  AnalyticsDefinition,
  AnalyticsExecutionResult,
} from "./analytics.types";

export type AnalyticsExecuteBundle = {
  result: AnalyticsExecutionResult;
  trace: AnalyticsRuntimeTrace;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

export function executeAnalytics(
  analytics: AnalyticsDefinition,
  options?: {
    taskId?: string;
    input?: Readonly<Record<string, unknown>>;
    metadata?: Readonly<Record<string, string>>;
    instanceId?: string;
  },
): AnalyticsExecuteBundle {
  assertAnalyticsDefinition(analytics);

  const startedAt = Date.now();
  const instanceId = options?.instanceId?.trim() || createId("ana-inst");
  const taskId = options?.taskId?.trim() || createId("ana-task");
  const input = Object.freeze({ ...(options?.input ?? {}) });

  let trace = createAnalyticsRuntimeTrace({
    instanceId,
    analyticsId: analytics.id,
    taskId,
  });

  trace = appendAnalyticsTraceEvent(
    trace,
    "ready",
    `analytics ${analytics.id} ready`,
    { intelligenceId: analytics.intelligenceId },
  );

  try {
    trace = appendAnalyticsTraceEvent(
      trace,
      "metric",
      `computing ${analytics.metricIds.length} metrics`,
    );

    const metrics = calculateMetrics(analytics.metricIds, input);
    for (const metric of metrics) {
      trace = appendAnalyticsTraceEvent(
        trace,
        "calculate",
        `metric ${metric.metricId}=${metric.value}`,
        { kind: metric.kind },
      );
    }

    const intel = getIntelligenceById(analytics.intelligenceId);
    if (!intel) {
      throw new Error(`intelligence missing: ${analytics.intelligenceId}`);
    }

    trace = appendAnalyticsTraceEvent(
      trace,
      "insight",
      `running intelligence ${intel.id}`,
    );

    const context = createIntelligenceExecutionContext({
      intelligenceId: intel.id,
      businessAgentId: intel.businessAgentId,
      insightId: analytics.insightId,
      taskId: `${taskId}:intel`,
      input: {
        ...input,
        analyticsId: analytics.id,
        metrics: metrics.map((m) => ({
          id: m.metricId,
          kind: m.kind,
          value: m.value,
        })),
        goal:
          typeof input.goal === "string"
            ? input.goal
            : `analytics:${analytics.id}`,
      },
      metadata: {
        ...(options?.metadata ?? {}),
        layer: "e05-analytics",
        analyticsId: analytics.id,
      },
    });

    const intelRun = executeIntelligence(intel, context);
    if (!intelRun.result.success) {
      throw new Error(
        `intelligence failed: ${intelRun.result.errorMessage ?? "unknown"}`,
      );
    }

    const duration = Date.now() - startedAt;
    const insightOutput = Object.freeze({
      intelligenceId: intel.id,
      insightId: analytics.insightId ?? null,
      intelligenceOutput: intelRun.result.output,
    });

    const result: AnalyticsExecutionResult = {
      success: true,
      analyticsId: analytics.id,
      intelligenceId: analytics.intelligenceId,
      instanceId,
      taskId,
      traceId: trace.traceId,
      metrics: Object.freeze([...metrics]) as typeof metrics,
      insightOutput,
      output: Object.freeze({
        analyticsId: analytics.id,
        metricCount: metrics.length,
        primaryMetric: metrics[0]?.value ?? null,
        insightGenerated: true,
      }),
      duration,
      status: "result",
      readOnly: true,
    };

    trace = appendAnalyticsTraceEvent(
      trace,
      "result",
      `result ready durationMs=${duration}`,
      { success: "true" },
    );

    return { result, trace };
  } catch (error) {
    const message = error instanceof Error ? error.message : "analytics failed";
    const duration = Date.now() - startedAt;

    trace = appendAnalyticsTraceEvent(trace, "error", message);

    const result: AnalyticsExecutionResult = {
      success: false,
      analyticsId: analytics.id,
      intelligenceId: analytics.intelligenceId,
      instanceId,
      taskId,
      traceId: trace.traceId,
      metrics: [],
      insightOutput: {},
      output: {},
      duration,
      status: "failed",
      errorMessage: message,
      readOnly: true,
    };

    return { result, trace };
  }
}

export function executeAnalyticsOrThrow(
  analytics: AnalyticsDefinition,
  options?: {
    taskId?: string;
    input?: Readonly<Record<string, unknown>>;
    metadata?: Readonly<Record<string, string>>;
    instanceId?: string;
  },
): AnalyticsExecuteBundle & {
  result: AnalyticsExecutionResult & { success: true; status: "result" };
} {
  const bundle = executeAnalytics(analytics, options);
  if (!bundle.result.success || bundle.result.status !== "result") {
    throw new Error(
      `E05 analytics execution failed: ${bundle.result.errorMessage ?? bundle.result.status}`,
    );
  }
  return bundle as AnalyticsExecuteBundle & {
    result: AnalyticsExecutionResult & { success: true; status: "result" };
  };
}
