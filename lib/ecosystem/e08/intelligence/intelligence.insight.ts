/**
 * E08-P5 — Ecosystem Intelligence Insight
 * Analyzes workflows and synthesizes ecosystem insights
 */

import { getWorkflowById } from "../workflow/workflow.registry";
import { executeWorkflow } from "../workflow/workflow.executor";
import { analyzeWorkflowResult } from "./intelligence.analyzer";
import { assertIntelligenceDefinition } from "./intelligence.registry";
import {
  appendIntelligenceTraceEvent,
  createIntelligenceRuntimeTrace,
  type IntelligenceRuntimeTrace,
} from "./intelligence.trace";
import type {
  EcosystemInsight,
  IntelligenceAnalysis,
  IntelligenceDefinition,
  IntelligenceRunResult,
  IntelligenceSignal,
} from "./intelligence.types";

export type IntelligenceRunBundle = {
  result: IntelligenceRunResult;
  trace: IntelligenceRuntimeTrace;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function applySignals(
  input: Readonly<Record<string, unknown>>,
  signals: IntelligenceSignal[],
): Readonly<Record<string, unknown>> {
  const next: Record<string, unknown> = { ...input };
  for (const signal of signals) {
    next[signal.field] = signal.value;
  }
  return Object.freeze(next);
}

export function buildEcosystemInsight(
  definition: IntelligenceDefinition,
  analysis: IntelligenceAnalysis,
): EcosystemInsight {
  const recommendations: string[] = [];

  if (analysis.needsInsight) {
    for (const signal of definition.signals) {
      recommendations.push(
        `reinforce ${signal.field}=${String(signal.value)} (${signal.reason})`,
      );
    }
    for (const finding of analysis.findings) {
      recommendations.push(`address finding: ${finding}`);
    }
  } else {
    recommendations.push(
      `retain ${definition.kind} posture — workflow score=${analysis.score}`,
    );
    if (analysis.exchangedListings.length > 0) {
      recommendations.push(
        `continue partner exchanges: ${analysis.exchangedListings.join(", ")}`,
      );
    }
  }

  const confidence = Math.max(
    0,
    Math.min(100, analysis.score - analysis.findings.length * 5),
  );

  const headline = analysis.needsInsight
    ? `${definition.name}: reinforcement required`
    : `${definition.name}: healthy coverage`;

  const summary = [
    `workflow=${analysis.workflowId}`,
    `score=${analysis.score}/${definition.targetScore}`,
    `steps=${analysis.completedSteps}/${analysis.stepCount}`,
    `status=${analysis.status}`,
  ].join(" ");

  return {
    kind: definition.kind,
    headline,
    summary,
    recommendations: Object.freeze([...recommendations]) as string[],
    confidence,
    readOnly: true,
  };
}

export function runEcosystemIntelligence(
  definition: IntelligenceDefinition,
  options?: {
    taskId?: string;
    input?: Readonly<Record<string, unknown>>;
    metadata?: Readonly<Record<string, string>>;
    instanceId?: string;
  },
): IntelligenceRunBundle {
  assertIntelligenceDefinition(definition);

  const startedAt = Date.now();
  const instanceId = options?.instanceId?.trim() || createId("intel-inst");
  const taskId = options?.taskId?.trim() || createId("intel-task");
  const input = Object.freeze({ ...(options?.input ?? {}) });

  let trace = createIntelligenceRuntimeTrace({
    instanceId,
    intelligenceId: definition.id,
    taskId,
  });

  trace = appendIntelligenceTraceEvent(
    trace,
    "ready",
    `intelligence ${definition.id} ready`,
    { workflowId: definition.workflowId, kind: definition.kind },
  );

  const emptyAnalysis: IntelligenceAnalysis = {
    workflowId: definition.workflowId,
    score: 0,
    completedSteps: 0,
    stepCount: 0,
    exchangedListings: [],
    status: "none",
    findings: [],
    needsInsight: true,
    readOnly: true,
  };

  try {
    const workflow = getWorkflowById(definition.workflowId);
    if (!workflow) {
      throw new Error(`workflow missing: ${definition.workflowId}`);
    }

    const metadata = {
      ...(options?.metadata ?? {}),
      layer: "e08-intelligence",
      intelligenceId: definition.id,
    };

    // First pass — analyze current ecosystem workflow posture
    const baselineRun = executeWorkflow(workflow, {
      taskId: `${taskId}:analyze`,
      input,
      metadata,
    });
    let analysis = analyzeWorkflowResult(
      baselineRun.result,
      definition.workflowId,
      definition.targetScore,
    );
    let workflowResult = baselineRun.result;
    let appliedSignals: IntelligenceSignal[] = [];

    trace = appendIntelligenceTraceEvent(
      trace,
      "analyze",
      `analysis score=${analysis.score} status=${analysis.status}`,
      {
        needsInsight: String(analysis.needsInsight),
        completedSteps: String(analysis.completedSteps),
      },
    );

    // Reinforce with signals when analysis needs insight
    if (analysis.needsInsight) {
      appliedSignals = definition.signals;
      const reinforcedInput = applySignals(input, appliedSignals);
      const reinforcedRun = executeWorkflow(workflow, {
        taskId: `${taskId}:reinforce`,
        input: reinforcedInput,
        metadata,
      });
      analysis = analyzeWorkflowResult(
        reinforcedRun.result,
        definition.workflowId,
        definition.targetScore,
      );
      workflowResult = reinforcedRun.result;
    }

    const insight = buildEcosystemInsight(definition, analysis);
    trace = appendIntelligenceTraceEvent(
      trace,
      "insight",
      insight.headline,
      {
        confidence: String(insight.confidence),
        recommendations: String(insight.recommendations.length),
      },
    );

    const duration = Date.now() - startedAt;
    const success =
      analysis.score >= definition.targetScore && !analysis.needsInsight;

    if (!success && workflowResult.status === "blocked") {
      trace = appendIntelligenceTraceEvent(
        trace,
        "error",
        analysis.findings.join("; ") || "blocked",
      );
      return {
        trace,
        result: {
          success: false,
          intelligenceId: definition.id,
          kind: definition.kind,
          workflowId: definition.workflowId,
          instanceId,
          taskId,
          traceId: trace.traceId,
          analysis,
          insight,
          appliedSignals: [...appliedSignals],
          workflow: workflowResult,
          output: {},
          duration,
          status: "blocked",
          errorMessage: workflowResult.errorMessage ?? insight.summary,
          readOnly: true,
        },
      };
    }

    const result: IntelligenceRunResult = {
      success,
      intelligenceId: definition.id,
      kind: definition.kind,
      workflowId: definition.workflowId,
      instanceId,
      taskId,
      traceId: trace.traceId,
      analysis,
      insight,
      appliedSignals: [...appliedSignals],
      workflow: workflowResult,
      output: Object.freeze({
        intelligenceId: definition.id,
        kind: definition.kind,
        workflowId: definition.workflowId,
        score: analysis.score,
        confidence: insight.confidence,
        headline: insight.headline,
        recommendations: [...insight.recommendations],
        signalsApplied: appliedSignals.map((s) => s.field),
      }),
      duration,
      status: success ? "result" : "failed",
      errorMessage: success ? undefined : insight.summary,
      readOnly: true,
    };

    trace = appendIntelligenceTraceEvent(
      trace,
      success ? "result" : "error",
      `intelligence ${result.status} durationMs=${duration}`,
      { success: String(success) },
    );

    return { result, trace };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "intelligence failed";
    const duration = Date.now() - startedAt;
    const insight = buildEcosystemInsight(definition, emptyAnalysis);

    trace = appendIntelligenceTraceEvent(trace, "error", message);

    return {
      trace,
      result: {
        success: false,
        intelligenceId: definition.id,
        kind: definition.kind,
        workflowId: definition.workflowId,
        instanceId,
        taskId,
        traceId: trace.traceId,
        analysis: emptyAnalysis,
        insight,
        appliedSignals: [],
        output: {},
        duration,
        status: "failed",
        errorMessage: message,
        readOnly: true,
      },
    };
  }
}

export function runEcosystemIntelligenceOrThrow(
  definition: IntelligenceDefinition,
  options?: {
    taskId?: string;
    input?: Readonly<Record<string, unknown>>;
    metadata?: Readonly<Record<string, string>>;
    instanceId?: string;
  },
): IntelligenceRunBundle & {
  result: IntelligenceRunResult & { success: true; status: "result" };
} {
  const bundle = runEcosystemIntelligence(definition, options);
  if (!bundle.result.success || bundle.result.status !== "result") {
    throw new Error(
      `E08 ecosystem intelligence failed: ${bundle.result.errorMessage ?? bundle.result.status}`,
    );
  }
  return bundle as IntelligenceRunBundle & {
    result: IntelligenceRunResult & { success: true; status: "result" };
  };
}
