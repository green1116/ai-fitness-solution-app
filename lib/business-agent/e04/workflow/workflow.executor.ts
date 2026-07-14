/**
 * E04-P2 — Business Workflow Executor
 * Runs workflow steps via E04 Business Agent execute bridge
 */

import { getBusinessAgentById } from "../core/business-agent.registry";
import { createBusinessAgentExecutionContext } from "../runtime/business-agent.context";
import { executeBusinessAgent } from "../runtime/business-agent.executor";
import {
  advanceWorkflowPhase,
  createReadyWorkflowState,
  updateStepState,
} from "./workflow.lifecycle";
import { assertWorkflowDefinition } from "./workflow.registry";
import {
  appendWorkflowTraceEvent,
  createWorkflowRuntimeTrace,
  type WorkflowRuntimeTrace,
} from "./workflow.trace";
import type {
  WorkflowDefinition,
  WorkflowExecutionResult,
  WorkflowInstance,
  WorkflowInstanceState,
} from "./workflow.types";

export type WorkflowExecuteBundle = {
  result: WorkflowExecutionResult;
  instance: WorkflowInstance;
  state: WorkflowInstanceState;
  trace: WorkflowRuntimeTrace;
};

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

export function createWorkflowInstance(input: {
  workflow: WorkflowDefinition;
  taskId?: string;
  input?: Readonly<Record<string, unknown>>;
  metadata?: Readonly<Record<string, string>>;
  instanceId?: string;
}): WorkflowInstance {
  assertWorkflowDefinition(input.workflow);

  return {
    instanceId: input.instanceId?.trim() || createId("wf-inst"),
    workflowId: input.workflow.id,
    taskId: input.taskId?.trim() || createId("wf-task"),
    input: Object.freeze({ ...(input.input ?? {}) }),
    metadata: Object.freeze({ ...(input.metadata ?? {}) }),
    state: createReadyWorkflowState(input.workflow),
    createdAt: nowIso(),
    readOnly: true,
  };
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
  assertWorkflowDefinition(workflow);

  const startedAt = Date.now();
  let instance = createWorkflowInstance({
    workflow,
    taskId: options?.taskId,
    input: options?.input,
    metadata: options?.metadata,
    instanceId: options?.instanceId,
  });
  let state = instance.state;
  let trace = createWorkflowRuntimeTrace({
    instanceId: instance.instanceId,
    workflowId: workflow.id,
    taskId: instance.taskId,
  });

  trace = appendWorkflowTraceEvent(
    trace,
    "ready",
    `workflow ${workflow.id} ready`,
    { steps: String(workflow.steps.length) },
  );

  const stepOutputs: Array<{
    stepId: string;
    businessAgentId: string;
    output: Readonly<Record<string, unknown>>;
  }> = [];

  try {
    state = advanceWorkflowPhase(state, "RUNNING", "workflow started");
    trace = appendWorkflowTraceEvent(
      trace,
      "running",
      `workflow ${workflow.id} running`,
    );

    for (const step of workflow.steps) {
      const started = nowIso();
      state = updateStepState(state, step.id, {
        status: "running",
        startedAt: started,
      });
      trace = appendWorkflowTraceEvent(
        trace,
        "step",
        `step ${step.id} running`,
        {
          businessAgentId: step.businessAgentId,
          capabilityId: step.capabilityId ?? "",
        },
      );

      const agent = getBusinessAgentById(step.businessAgentId);
      if (!agent) {
        throw new Error(`business agent missing: ${step.businessAgentId}`);
      }

      const context = createBusinessAgentExecutionContext({
        businessAgentId: agent.id,
        runtimeAgentId: agent.runtimeAgentId,
        capabilityId: step.capabilityId,
        taskId: `${instance.taskId}:${step.id}`,
        input: {
          ...instance.input,
          workflowId: workflow.id,
          workflowInstanceId: instance.instanceId,
          stepId: step.id,
          goal:
            typeof instance.input.goal === "string"
              ? instance.input.goal
              : `workflow:${workflow.id}:${step.id}`,
        },
        metadata: {
          ...instance.metadata,
          layer: "e04-workflow",
          workflowId: workflow.id,
          stepId: step.id,
        },
      });

      const bundle = executeBusinessAgent(agent, context);
      if (!bundle.result.success) {
        const finishedAt = nowIso();
        state = updateStepState(state, step.id, {
          status: "failed",
          finishedAt,
          errorMessage: bundle.result.errorMessage ?? "step failed",
        });
        throw new Error(
          `step ${step.id} failed: ${bundle.result.errorMessage ?? "unknown"}`,
        );
      }

      const finishedAt = nowIso();
      state = updateStepState(state, step.id, {
        status: "completed",
        finishedAt,
        output: bundle.result.output,
      });
      stepOutputs.push({
        stepId: step.id,
        businessAgentId: agent.id,
        output: bundle.result.output,
      });
      trace = appendWorkflowTraceEvent(
        trace,
        "step",
        `step ${step.id} completed`,
        { businessAgentId: agent.id },
      );
    }

    state = advanceWorkflowPhase(state, "COMPLETED", "all steps completed");
    trace = appendWorkflowTraceEvent(
      trace,
      "completed",
      `workflow ${workflow.id} completed`,
    );

    state = advanceWorkflowPhase(state, "RESULT", "result sealed");
    const duration = Date.now() - startedAt;

    const result: WorkflowExecutionResult = {
      success: true,
      workflowId: workflow.id,
      instanceId: instance.instanceId,
      taskId: instance.taskId,
      traceId: trace.traceId,
      output: Object.freeze({
        workflowId: workflow.id,
        stepCount: stepOutputs.length,
        lastStepId: stepOutputs[stepOutputs.length - 1]?.stepId ?? null,
      }),
      stepOutputs: Object.freeze([...stepOutputs]),
      duration,
      status: "result",
      readOnly: true,
    };

    trace = appendWorkflowTraceEvent(
      trace,
      "result",
      `result ready durationMs=${duration}`,
      { success: "true" },
    );

    instance = {
      ...instance,
      state,
      readOnly: true,
    };

    return { result, instance, state, trace };
  } catch (error) {
    const message = error instanceof Error ? error.message : "workflow failed";
    const duration = Date.now() - startedAt;

    trace = appendWorkflowTraceEvent(trace, "error", message, {
      phase: state.phase,
    });

    const result: WorkflowExecutionResult = {
      success: false,
      workflowId: workflow.id,
      instanceId: instance.instanceId,
      taskId: instance.taskId,
      traceId: trace.traceId,
      output: {},
      stepOutputs: Object.freeze([...stepOutputs]),
      duration,
      status: "failed",
      errorMessage: message,
      readOnly: true,
    };

    instance = {
      ...instance,
      state,
      readOnly: true,
    };

    return { result, instance, state, trace };
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
      `E04 workflow execution failed: ${bundle.result.errorMessage ?? bundle.result.status}`,
    );
  }
  return bundle as WorkflowExecuteBundle & {
    result: WorkflowExecutionResult & { success: true; status: "result" };
  };
}
