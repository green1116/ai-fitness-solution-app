/**
 * E06-P4 — Enterprise Control Scheduler
 * Schedules controls by priority and dispatches workflows
 */

import { getWorkflowById } from "../workflow/workflow.registry";
import { executeWorkflowAgent } from "../workflow/workflow.executor";
import {
  assertControlDefinition,
  CONTROL_CATALOG,
} from "./control.registry";
import { buildControlHealthReport } from "./control.monitor";
import {
  appendControlTraceEvent,
  createControlRuntimeTrace,
  type ControlRuntimeTrace,
} from "./control.trace";
import { E06_CONTROL_PLANE_ID } from "./control.constants";
import type {
  ControlDefinition,
  ControlPlanResult,
  ControlRunResult,
  ControlSchedule,
  ControlScheduleSlot,
} from "./control.types";

export type ControlPlanBundle = {
  result: ControlPlanResult;
  trace: ControlRuntimeTrace;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

export function buildControlSchedule(
  controls: ControlDefinition[] = CONTROL_CATALOG,
  planId?: string,
): ControlSchedule {
  for (const control of controls) {
    assertControlDefinition(control);
  }

  const sorted = [...controls].sort((a, b) => b.priority - a.priority);
  const slots: ControlScheduleSlot[] = sorted.map((control, index) => ({
    id: `slot-${index + 1}`,
    order: index + 1,
    controlId: control.id,
    workflowId: control.workflowId,
    mode: control.mode,
    priority: control.priority,
    readOnly: true,
  }));

  return {
    planId: planId?.trim() || createId("ctl-plan"),
    slotCount: slots.length,
    slots: Object.freeze([...slots]) as ControlScheduleSlot[],
    narrative: [
      `control plane schedules ${slots.length} slots`,
      `(${slots.map((s) => `${s.mode}:${s.workflowId}`).join(" → ")})`,
    ].join(" "),
    readOnly: true,
  };
}

export function executeControlPlan(
  controls: ControlDefinition[] = CONTROL_CATALOG,
  options?: {
    taskId?: string;
    input?: Readonly<Record<string, unknown>>;
    metadata?: Readonly<Record<string, string>>;
    planId?: string;
  },
): ControlPlanBundle {
  const startedAt = Date.now();
  const taskId = options?.taskId?.trim() || createId("ctl-task");
  const input = Object.freeze({ ...(options?.input ?? {}) });

  const schedule = buildControlSchedule(controls, options?.planId);

  let trace = createControlRuntimeTrace({
    planId: schedule.planId,
    taskId,
  });

  trace = appendControlTraceEvent(
    trace,
    "ready",
    `control plan ${schedule.planId} ready`,
    { planeId: E06_CONTROL_PLANE_ID },
  );
  trace = appendControlTraceEvent(trace, "schedule", schedule.narrative, {
    slotCount: String(schedule.slotCount),
  });

  const runs: ControlRunResult[] = [];

  try {
    for (const slot of schedule.slots) {
      const workflow = getWorkflowById(slot.workflowId);
      if (!workflow) {
        throw new Error(`workflow missing: ${slot.workflowId}`);
      }

      trace = appendControlTraceEvent(
        trace,
        "dispatch",
        `dispatch slot ${slot.order}/${schedule.slotCount}: ${slot.controlId}`,
        { workflowId: slot.workflowId, mode: slot.mode },
      );

      const run = executeWorkflowAgent(workflow, {
        taskId: `${taskId}:slot-${slot.order}`,
        input: {
          ...input,
          controlId: slot.controlId,
          controlMode: slot.mode,
          goal:
            typeof input.goal === "string"
              ? input.goal
              : `control:${slot.mode}`,
        },
        metadata: {
          ...(options?.metadata ?? {}),
          layer: "e06-control",
          controlId: slot.controlId,
        },
      });

      runs.push({
        slotId: slot.id,
        controlId: slot.controlId,
        workflowId: slot.workflowId,
        mode: slot.mode,
        success: run.result.success,
        status: run.result.status,
        completedSteps: run.result.completedSteps,
        stepCount: run.result.plan.stepCount,
        effects: [...run.result.effects],
        durationMs: run.result.duration,
        errorMessage: run.result.errorMessage,
        readOnly: true,
      });
    }

    const health = buildControlHealthReport(schedule.planId, runs);
    trace = appendControlTraceEvent(trace, "health", health.summary, {
      status: health.status,
    });

    const duration = Date.now() - startedAt;
    const status =
      health.status === "green"
        ? "result"
        : health.status === "amber"
          ? "degraded"
          : "failed";
    const success = status === "result";

    const result: ControlPlanResult = {
      success,
      planeId: E06_CONTROL_PLANE_ID,
      planId: schedule.planId,
      taskId,
      traceId: trace.traceId,
      schedule,
      runs: [...runs],
      health,
      duration,
      status,
      errorMessage: success ? undefined : health.summary,
      readOnly: true,
    };

    trace = appendControlTraceEvent(
      trace,
      success ? "result" : "error",
      `plan ${status} durationMs=${duration}`,
      { success: String(success) },
    );

    return { result, trace };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "control plan failed";
    const duration = Date.now() - startedAt;

    trace = appendControlTraceEvent(trace, "error", message);

    return {
      trace,
      result: {
        success: false,
        planeId: E06_CONTROL_PLANE_ID,
        planId: schedule.planId,
        taskId,
        traceId: trace.traceId,
        schedule,
        runs: [...runs],
        health: buildControlHealthReport(schedule.planId, runs),
        duration,
        status: "failed",
        errorMessage: message,
        readOnly: true,
      },
    };
  }
}

export function executeControlPlanOrThrow(
  controls: ControlDefinition[] = CONTROL_CATALOG,
  options?: {
    taskId?: string;
    input?: Readonly<Record<string, unknown>>;
    metadata?: Readonly<Record<string, string>>;
    planId?: string;
  },
): ControlPlanBundle & {
  result: ControlPlanResult & { success: true; status: "result" };
} {
  const bundle = executeControlPlan(controls, options);
  if (!bundle.result.success || bundle.result.status !== "result") {
    throw new Error(
      `E06 control plan failed: ${bundle.result.errorMessage ?? bundle.result.status}`,
    );
  }
  return bundle as ControlPlanBundle & {
    result: ControlPlanResult & { success: true; status: "result" };
  };
}
