/**
 * E06-P5 — Self Optimization Loop
 * EVALUATE -> OPTIMIZE -> APPLY -> MEASURE over the E06 control plane
 */

import { getControlById } from "../control/control.registry";
import { executeControlPlan } from "../control/control.scheduler";
import { E06_OPTIMIZATION_LOOP_ID } from "./optimization.constants";
import {
  evaluateControlPlan,
  measureOptimization,
} from "./optimization.evaluator";
import { assertOptimizationDefinition } from "./optimization.registry";
import {
  appendOptimizationTraceEvent,
  createOptimizationRuntimeTrace,
  type OptimizationRuntimeTrace,
} from "./optimization.trace";
import type {
  OptimizationDefinition,
  OptimizationEvaluation,
  OptimizationKnob,
  OptimizationLoopResult,
} from "./optimization.types";

export type OptimizationLoopBundle = {
  result: OptimizationLoopResult;
  trace: OptimizationRuntimeTrace;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function applyKnobs(
  input: Readonly<Record<string, unknown>>,
  knobs: OptimizationKnob[],
): Readonly<Record<string, unknown>> {
  const next: Record<string, unknown> = { ...input };
  for (const knob of knobs) {
    next[knob.field] = knob.value;
  }
  return Object.freeze(next);
}

export function runSelfOptimizationLoop(
  optimization: OptimizationDefinition,
  options?: {
    taskId?: string;
    input?: Readonly<Record<string, unknown>>;
    metadata?: Readonly<Record<string, string>>;
    instanceId?: string;
  },
): OptimizationLoopBundle {
  assertOptimizationDefinition(optimization);

  const startedAt = Date.now();
  const instanceId = options?.instanceId?.trim() || createId("opt-inst");
  const taskId = options?.taskId?.trim() || createId("opt-task");
  const input = Object.freeze({ ...(options?.input ?? {}) });

  let trace = createOptimizationRuntimeTrace({
    instanceId,
    optimizationId: optimization.id,
    taskId,
  });

  trace = appendOptimizationTraceEvent(
    trace,
    "ready",
    `optimization ${optimization.id} ready`,
    { controlId: optimization.controlId, kind: optimization.kind },
  );

  const emptyEvaluation: OptimizationEvaluation = {
    planId: "none",
    healthStatus: "red",
    score: 0,
    completedSteps: 0,
    stepCount: 0,
    findings: [],
    needsOptimization: true,
    readOnly: true,
  };

  try {
    const control = getControlById(optimization.controlId);
    if (!control) {
      throw new Error(`control missing: ${optimization.controlId}`);
    }

    const metadata = {
      ...(options?.metadata ?? {}),
      layer: "e06-optimization",
      optimizationId: optimization.id,
    };

    // EVALUATE — baseline run with unmodified input
    const baselineRun = executeControlPlan([control], {
      taskId: `${taskId}:baseline`,
      input,
      metadata,
    });
    const baseline = evaluateControlPlan(
      baselineRun.result,
      optimization.targetScore,
    );
    trace = appendOptimizationTraceEvent(
      trace,
      "evaluate",
      `baseline score=${baseline.score} health=${baseline.healthStatus}`,
      { needsOptimization: String(baseline.needsOptimization) },
    );

    // OPTIMIZE — select knobs to apply
    const appliedKnobs = baseline.needsOptimization ? optimization.knobs : [];
    trace = appendOptimizationTraceEvent(
      trace,
      "optimize",
      appliedKnobs.length > 0
        ? `applying ${appliedKnobs.length} knobs: ${appliedKnobs.map((k) => k.field).join(", ")}`
        : "baseline healthy — no knobs required",
      { knobCount: String(appliedKnobs.length) },
    );

    // APPLY — re-run with adjusted input
    const optimizedInput =
      appliedKnobs.length > 0 ? applyKnobs(input, appliedKnobs) : input;
    const optimizedRun = executeControlPlan([control], {
      taskId: `${taskId}:optimized`,
      input: optimizedInput,
      metadata,
    });
    const optimized = evaluateControlPlan(
      optimizedRun.result,
      optimization.targetScore,
    );
    trace = appendOptimizationTraceEvent(
      trace,
      "apply",
      `optimized score=${optimized.score} health=${optimized.healthStatus}`,
      { planId: optimized.planId },
    );

    // MEASURE — compare baseline vs optimized
    const measurement = measureOptimization(
      baseline,
      optimized,
      optimization.targetScore,
    );
    trace = appendOptimizationTraceEvent(trace, "measure", measurement.verdict, {
      improved: String(measurement.improved),
      reachedTarget: String(measurement.reachedTarget),
    });

    const duration = Date.now() - startedAt;
    const success = measurement.reachedTarget;

    const result: OptimizationLoopResult = {
      success,
      loopId: E06_OPTIMIZATION_LOOP_ID,
      optimizationId: optimization.id,
      kind: optimization.kind,
      controlId: optimization.controlId,
      instanceId,
      taskId,
      traceId: trace.traceId,
      baseline,
      appliedKnobs: [...appliedKnobs],
      optimized,
      measurement,
      output: Object.freeze({
        optimizationId: optimization.id,
        kind: optimization.kind,
        baselineScore: baseline.score,
        optimizedScore: optimized.score,
        delta: measurement.delta,
        knobsApplied: appliedKnobs.map((k) => k.field),
        reachedTarget: measurement.reachedTarget,
      }),
      duration,
      status: success ? "result" : "failed",
      errorMessage: success ? undefined : measurement.verdict,
      readOnly: true,
    };

    trace = appendOptimizationTraceEvent(
      trace,
      success ? "result" : "error",
      `loop ${result.status} durationMs=${duration}`,
      { success: String(success) },
    );

    return { result, trace };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "optimization failed";
    const duration = Date.now() - startedAt;

    trace = appendOptimizationTraceEvent(trace, "error", message);

    return {
      trace,
      result: {
        success: false,
        loopId: E06_OPTIMIZATION_LOOP_ID,
        optimizationId: optimization.id,
        kind: optimization.kind,
        controlId: optimization.controlId,
        instanceId,
        taskId,
        traceId: trace.traceId,
        baseline: emptyEvaluation,
        appliedKnobs: [],
        optimized: emptyEvaluation,
        measurement: measureOptimization(
          emptyEvaluation,
          emptyEvaluation,
          optimization.targetScore,
        ),
        output: {},
        duration,
        status: "failed",
        errorMessage: message,
        readOnly: true,
      },
    };
  }
}

export function runSelfOptimizationLoopOrThrow(
  optimization: OptimizationDefinition,
  options?: {
    taskId?: string;
    input?: Readonly<Record<string, unknown>>;
    metadata?: Readonly<Record<string, string>>;
    instanceId?: string;
  },
): OptimizationLoopBundle & {
  result: OptimizationLoopResult & { success: true; status: "result" };
} {
  const bundle = runSelfOptimizationLoop(optimization, options);
  if (!bundle.result.success || bundle.result.status !== "result") {
    throw new Error(
      `E06 optimization loop failed: ${bundle.result.errorMessage ?? bundle.result.status}`,
    );
  }
  return bundle as OptimizationLoopBundle & {
    result: OptimizationLoopResult & { success: true; status: "result" };
  };
}
