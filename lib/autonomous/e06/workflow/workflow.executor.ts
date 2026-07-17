/**
 * E06-P3 — Autonomous Workflow Executor
 * Runs planned action sequences via E06 action executor
 */

import { getActionById } from "../action/action.registry";
import { executeBusinessAction } from "../action/action.executor";
import { planWorkflow } from "./workflow.planner";
import {
  appendWorkflowTraceEvent,
  createWorkflowRuntimeTrace,
  type WorkflowRuntimeTrace,
} from "./workflow.trace";
import type {
  WorkflowDefinition,
  WorkflowExecutionResult,
  WorkflowStepResult,
} from "./workflow.types";

export type WorkflowExecuteBundle = {
  result: WorkflowExecutionResult;
  trace: WorkflowRuntimeTrace;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

export function executeWorkflowAgent(
  workflow: WorkflowDefinition,
  options?: {
    taskId?: string;
    input?: Readonly<Record<string, unknown>>;
    metadata?: Readonly<Record<string, string>>;
    instanceId?: string;
  },
): WorkflowExecuteBundle {
  const startedAt = Date.now();
  const instanceId = options?.instanceId?.trim() || createId("wf-inst");
  const taskId = options?.taskId?.trim() || createId("wf-task");
  const input = Object.freeze({ ...(options?.input ?? {}) });

  let trace = createWorkflowRuntimeTrace({
    instanceId,
    workflowId: workflow.id,
    taskId,
  });

  trace = appendWorkflowTraceEvent(
    trace,
    "ready",
    `workflow ${workflow.id} ready`,
    { goalKind: workflow.goalKind },
  );

  const stepResults: WorkflowStepResult[] = [];
  const effects: string[] = [];

  const fail = (
    plan: WorkflowExecutionResult["plan"],
    status: "blocked" | "failed",
    message: string,
  ): WorkflowExecuteBundle => {
    trace = appendWorkflowTraceEvent(trace, "error", message);
    return {
      trace,
      result: {
        success: false,
        workflowId: workflow.id,
        goalKind: workflow.goalKind,
        goal: workflow.goal,
        instanceId,
        taskId,
        traceId: trace.traceId,
        plan,
        stepResults: [...stepResults],
        completedSteps: stepResults.filter((s) => s.success).length,
        effects: [...effects],
        output: {},
        duration: Date.now() - startedAt,
        status,
        errorMessage: message,
        readOnly: true,
      },
    };
  };

  try {
    const plan = planWorkflow(workflow);
    trace = appendWorkflowTraceEvent(trace, "plan", plan.narrative, {
      stepCount: String(plan.stepCount),
    });

    for (const step of plan.steps) {
      const action = getActionById(step.actionId);
      if (!action) {
        return fail(plan, "failed", `unknown action: ${step.actionId}`);
      }

      trace = appendWorkflowTraceEvent(
        trace,
        "step",
        `step ${step.order}/${plan.stepCount}: ${step.title}`,
        { actionId: step.actionId },
      );

      const run = executeBusinessAction(action, {
        taskId: `${taskId}:step-${step.order}`,
        input: {
          ...input,
          workflowId: workflow.id,
          workflowGoal: workflow.goal,
          stepOrder: step.order,
          goal:
            typeof input.goal === "string"
              ? input.goal
              : `workflow:${workflow.goalKind}`,
        },
        metadata: {
          ...(options?.metadata ?? {}),
          layer: "e06-workflow",
          workflowId: workflow.id,
        },
      });

      const stepResult: WorkflowStepResult = {
        stepId: step.id,
        order: step.order,
        actionId: step.actionId,
        success: run.result.success,
        status: run.result.status,
        effect: run.result.effect?.effect,
        durationMs: run.result.duration,
        errorMessage: run.result.errorMessage,
        readOnly: true,
      };
      stepResults.push(stepResult);

      trace = appendWorkflowTraceEvent(
        trace,
        "action",
        `action ${step.actionId} status=${run.result.status}`,
        { success: String(run.result.success) },
      );

      if (!run.result.success) {
        const status =
          run.result.status === "blocked" ? "blocked" : "failed";
        return fail(
          plan,
          status,
          `step ${step.order} ${status}: ${run.result.errorMessage ?? "unknown"}`,
        );
      }

      if (run.result.effect) {
        effects.push(run.result.effect.effect);
      }
    }

    const duration = Date.now() - startedAt;
    const result: WorkflowExecutionResult = {
      success: true,
      workflowId: workflow.id,
      goalKind: workflow.goalKind,
      goal: workflow.goal,
      instanceId,
      taskId,
      traceId: trace.traceId,
      plan,
      stepResults: [...stepResults],
      completedSteps: stepResults.length,
      effects: [...effects],
      output: Object.freeze({
        workflowId: workflow.id,
        goalKind: workflow.goalKind,
        stepCount: plan.stepCount,
        completedSteps: stepResults.length,
        effects: [...effects],
      }),
      duration,
      status: "result",
      readOnly: true,
    };

    trace = appendWorkflowTraceEvent(
      trace,
      "result",
      `result ready steps=${stepResults.length}/${plan.stepCount} durationMs=${duration}`,
      { success: "true" },
    );

    return { result, trace };
  } catch (error) {
    const message = error instanceof Error ? error.message : "workflow failed";
    return fail(
      {
        workflowId: workflow.id,
        goalKind: workflow.goalKind,
        goal: workflow.goal,
        stepCount: 0,
        steps: [],
        narrative: "plan unavailable",
        readOnly: true,
      },
      "failed",
      message,
    );
  }
}

export function executeWorkflowAgentOrThrow(
  workflow: WorkflowDefinition,
  options?: {
    taskId?: string;
    input?: Readonly<Record<string, unknown>>;
    metadata?: Readonly<Record<string, string>>;
    instanceId?: string;
  },
): WorkflowExecuteBundle & {
  result: WorkflowExecutionResult & { success: true; status: "result" };
} {
  const bundle = executeWorkflowAgent(workflow, options);
  if (!bundle.result.success || bundle.result.status !== "result") {
    throw new Error(
      `E06 workflow execution failed: ${bundle.result.errorMessage ?? bundle.result.status}`,
    );
  }
  return bundle as WorkflowExecuteBundle & {
    result: WorkflowExecutionResult & { success: true; status: "result" };
  };
}
