/**
 * E07-P6 — Workforce Learning Updater
 * EVALUATE -> IMPROVE -> UPDATE -> MEASURE over E07 collaboration
 */

import { getCollaborationById } from "../collaboration/collaboration.registry";
import { executeCollaboration } from "../collaboration/collaboration.executor";
import type { HumanDecision } from "../collaboration/collaboration.types";
import { E07_LEARNING_LOOP_ID } from "./learning.constants";
import {
  evaluateCollaborationResult,
  measureLearning,
} from "./learning.evaluator";
import { assertLearningDefinition } from "./learning.registry";
import {
  appendLearningTraceEvent,
  createLearningRuntimeTrace,
  type LearningRuntimeTrace,
} from "./learning.trace";
import type {
  LearningAdjustment,
  LearningDefinition,
  LearningEvaluation,
  LearningLoopResult,
} from "./learning.types";

export type LearningLoopBundle = {
  result: LearningLoopResult;
  trace: LearningRuntimeTrace;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function applyAdjustments(
  input: Readonly<Record<string, unknown>>,
  adjustments: LearningAdjustment[],
): Readonly<Record<string, unknown>> {
  const next: Record<string, unknown> = { ...input };
  for (const adjustment of adjustments) {
    next[adjustment.field] = adjustment.value;
  }
  return Object.freeze(next);
}

function extractHumanDecision(
  input: Readonly<Record<string, unknown>>,
): HumanDecision | undefined {
  const raw = input.humanDecision;
  if (raw === "approve" || raw === "reject" || raw === "defer") {
    return raw;
  }
  return undefined;
}

export function runWorkforceLearningLoop(
  learning: LearningDefinition,
  options?: {
    taskId?: string;
    input?: Readonly<Record<string, unknown>>;
    metadata?: Readonly<Record<string, string>>;
    instanceId?: string;
  },
): LearningLoopBundle {
  assertLearningDefinition(learning);

  const startedAt = Date.now();
  const instanceId = options?.instanceId?.trim() || createId("learn-inst");
  const taskId = options?.taskId?.trim() || createId("learn-task");
  const input = Object.freeze({ ...(options?.input ?? {}) });

  let trace = createLearningRuntimeTrace({
    instanceId,
    learningId: learning.id,
    taskId,
  });

  trace = appendLearningTraceEvent(
    trace,
    "ready",
    `learning ${learning.id} ready`,
    { collaborationId: learning.collaborationId, kind: learning.kind },
  );

  const emptyEvaluation: LearningEvaluation = {
    collaborationId: learning.collaborationId,
    score: 0,
    completedSteps: 0,
    stepCount: 0,
    status: "none",
    findings: [],
    needsImprovement: true,
    readOnly: true,
  };

  try {
    const collaboration = getCollaborationById(learning.collaborationId);
    if (!collaboration) {
      throw new Error(`collaboration missing: ${learning.collaborationId}`);
    }

    const metadata = {
      ...(options?.metadata ?? {}),
      layer: "e07-learning",
      learningId: learning.id,
    };

    // EVALUATE — baseline collaboration run
    const baselineRun = executeCollaboration(collaboration, {
      taskId: `${taskId}:baseline`,
      input,
      metadata,
      humanDecision: extractHumanDecision(input),
    });
    const baseline = evaluateCollaborationResult(
      baselineRun.result,
      learning.collaborationId,
      learning.targetScore,
    );
    trace = appendLearningTraceEvent(
      trace,
      "evaluate",
      `baseline score=${baseline.score} status=${baseline.status}`,
      { needsImprovement: String(baseline.needsImprovement) },
    );

    // IMPROVE — select adjustments when needed
    const appliedAdjustments = baseline.needsImprovement
      ? learning.adjustments
      : [];
    trace = appendLearningTraceEvent(
      trace,
      "improve",
      appliedAdjustments.length > 0
        ? `applying ${appliedAdjustments.length} adjustments: ${appliedAdjustments.map((a) => a.field).join(", ")}`
        : "baseline healthy — no adjustments required",
      { adjustmentCount: String(appliedAdjustments.length) },
    );

    // UPDATE — re-run collaboration with adjusted input
    const updatedInput =
      appliedAdjustments.length > 0
        ? applyAdjustments(input, appliedAdjustments)
        : input;
    const updatedRun = executeCollaboration(collaboration, {
      taskId: `${taskId}:updated`,
      input: updatedInput,
      metadata,
      humanDecision: extractHumanDecision(updatedInput),
    });
    const updated = evaluateCollaborationResult(
      updatedRun.result,
      learning.collaborationId,
      learning.targetScore,
    );
    trace = appendLearningTraceEvent(
      trace,
      "update",
      `updated score=${updated.score} status=${updated.status}`,
      { collaborationId: learning.collaborationId },
    );

    // MEASURE — compare baseline vs updated
    const measurement = measureLearning(
      baseline,
      updated,
      learning.targetScore,
    );
    trace = appendLearningTraceEvent(trace, "measure", measurement.verdict, {
      improved: String(measurement.improved),
      reachedTarget: String(measurement.reachedTarget),
    });

    const duration = Date.now() - startedAt;
    const success = measurement.reachedTarget;

    const result: LearningLoopResult = {
      success,
      loopId: E07_LEARNING_LOOP_ID,
      learningId: learning.id,
      kind: learning.kind,
      collaborationId: learning.collaborationId,
      instanceId,
      taskId,
      traceId: trace.traceId,
      baseline,
      appliedAdjustments: [...appliedAdjustments],
      updated,
      measurement,
      output: Object.freeze({
        learningId: learning.id,
        kind: learning.kind,
        baselineScore: baseline.score,
        updatedScore: updated.score,
        delta: measurement.delta,
        adjustmentsApplied: appliedAdjustments.map((a) => a.field),
        reachedTarget: measurement.reachedTarget,
      }),
      duration,
      status: success ? "result" : "failed",
      errorMessage: success ? undefined : measurement.verdict,
      readOnly: true,
    };

    trace = appendLearningTraceEvent(
      trace,
      success ? "result" : "error",
      `loop ${result.status} durationMs=${duration}`,
      { success: String(success) },
    );

    return { result, trace };
  } catch (error) {
    const message = error instanceof Error ? error.message : "learning failed";
    const duration = Date.now() - startedAt;

    trace = appendLearningTraceEvent(trace, "error", message);

    return {
      trace,
      result: {
        success: false,
        loopId: E07_LEARNING_LOOP_ID,
        learningId: learning.id,
        kind: learning.kind,
        collaborationId: learning.collaborationId,
        instanceId,
        taskId,
        traceId: trace.traceId,
        baseline: emptyEvaluation,
        appliedAdjustments: [],
        updated: emptyEvaluation,
        measurement: measureLearning(
          emptyEvaluation,
          emptyEvaluation,
          learning.targetScore,
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

export function runWorkforceLearningLoopOrThrow(
  learning: LearningDefinition,
  options?: {
    taskId?: string;
    input?: Readonly<Record<string, unknown>>;
    metadata?: Readonly<Record<string, string>>;
    instanceId?: string;
  },
): LearningLoopBundle & {
  result: LearningLoopResult & { success: true; status: "result" };
} {
  const bundle = runWorkforceLearningLoop(learning, options);
  if (!bundle.result.success || bundle.result.status !== "result") {
    throw new Error(
      `E07 learning loop failed: ${bundle.result.errorMessage ?? bundle.result.status}`,
    );
  }
  return bundle as LearningLoopBundle & {
    result: LearningLoopResult & { success: true; status: "result" };
  };
}
