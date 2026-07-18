/**
 * E08-P4 — Cross Enterprise Workflow Executor
 * Runs planned exchange sequences via E08 partner exchange matcher
 */

import { getListingById } from "../exchange/exchange.registry";
import { exchangePartnerCapability } from "../exchange/exchange.matcher";
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

export function executeWorkflow(
  workflow: WorkflowDefinition,
  options?: {
    taskId?: string;
    input?: Readonly<Record<string, unknown>>;
    metadata?: Readonly<Record<string, string>>;
    instanceId?: string;
  },
): WorkflowExecuteBundle {
  const startedAt = Date.now();
  const instanceId = options?.instanceId?.trim() || createId("xwf-inst");
  const taskId = options?.taskId?.trim() || createId("xwf-task");
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
    { kind: workflow.kind },
  );

  const stepResults: WorkflowStepResult[] = [];
  const exchangedListings: string[] = [];

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
        kind: workflow.kind,
        goal: workflow.goal,
        instanceId,
        taskId,
        traceId: trace.traceId,
        plan,
        stepResults: [...stepResults],
        completedSteps: stepResults.filter((s) => s.success).length,
        exchangedListings: [...exchangedListings],
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
      const listing = getListingById(step.listingId);
      if (!listing) {
        return fail(plan, "failed", `unknown listing: ${step.listingId}`);
      }

      trace = appendWorkflowTraceEvent(
        trace,
        "step",
        `step ${step.order}/${plan.stepCount}: ${step.title}`,
        { listingId: step.listingId, networkId: step.networkId },
      );

      const run = exchangePartnerCapability(listing, {
        taskId: `${taskId}:step-${step.order}`,
        input: {
          ...input,
          workflowId: workflow.id,
          workflowKind: workflow.kind,
          workflowGoal: workflow.goal,
          stepOrder: step.order,
          goal:
            typeof input.goal === "string"
              ? input.goal
              : `workflow:${workflow.kind}`,
        },
        metadata: {
          ...(options?.metadata ?? {}),
          layer: "e08-workflow",
          workflowId: workflow.id,
        },
      });

      const completedNodes =
        typeof run.result.network?.completedNodes === "number"
          ? run.result.network.completedNodes
          : 0;

      const stepResult: WorkflowStepResult = {
        stepId: step.id,
        order: step.order,
        listingId: step.listingId,
        success: run.result.success,
        status: run.result.status,
        completedNodes,
        durationMs: run.result.duration,
        errorMessage: run.result.errorMessage,
        readOnly: true,
      };
      stepResults.push(stepResult);

      trace = appendWorkflowTraceEvent(
        trace,
        "exchange",
        `exchange ${step.listingId} status=${run.result.status}`,
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

      exchangedListings.push(step.listingId);
    }

    const duration = Date.now() - startedAt;
    const result: WorkflowExecutionResult = {
      success: true,
      workflowId: workflow.id,
      kind: workflow.kind,
      goal: workflow.goal,
      instanceId,
      taskId,
      traceId: trace.traceId,
      plan,
      stepResults: [...stepResults],
      completedSteps: stepResults.length,
      exchangedListings: [...exchangedListings],
      output: Object.freeze({
        workflowId: workflow.id,
        kind: workflow.kind,
        stepCount: plan.stepCount,
        completedSteps: stepResults.length,
        exchangedListings: [...exchangedListings],
        categories: plan.steps.map((s) => s.exchangeCategory),
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
        kind: workflow.kind,
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

export function executeWorkflowOrThrow(
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
  const bundle = executeWorkflow(workflow, options);
  if (!bundle.result.success || bundle.result.status !== "result") {
    throw new Error(
      `E08 workflow execution failed: ${bundle.result.errorMessage ?? bundle.result.status}`,
    );
  }
  return bundle as WorkflowExecuteBundle & {
    result: WorkflowExecutionResult & { success: true; status: "result" };
  };
}
