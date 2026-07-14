/**
 * E04-P3 — Business Process Executor
 * Orchestrates process nodes by reusing E04 workflow executor
 */

import { executeWorkflow } from "../workflow/workflow.executor";
import { getWorkflowById } from "../workflow/workflow.registry";
import { buildProcessGraph } from "./process.graph";
import {
  advanceProcessPhase,
  createReadyProcessState,
  updateNodeState,
} from "./process.lifecycle";
import { assertProcessDefinition } from "./process.registry";
import type {
  ProcessDefinition,
  ProcessExecutionResult,
  ProcessInstance,
  ProcessInstanceState,
} from "./process.types";

export type ProcessExecuteBundle = {
  result: ProcessExecutionResult;
  instance: ProcessInstance;
  state: ProcessInstanceState;
  graphOrder: string[];
};

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

export function createProcessInstance(input: {
  process: ProcessDefinition;
  taskId?: string;
  input?: Readonly<Record<string, unknown>>;
  metadata?: Readonly<Record<string, string>>;
  instanceId?: string;
}): ProcessInstance {
  assertProcessDefinition(input.process);

  return {
    instanceId: input.instanceId?.trim() || createId("proc-inst"),
    processId: input.process.id,
    taskId: input.taskId?.trim() || createId("proc-task"),
    input: Object.freeze({ ...(input.input ?? {}) }),
    metadata: Object.freeze({ ...(input.metadata ?? {}) }),
    state: createReadyProcessState(input.process),
    createdAt: nowIso(),
    readOnly: true,
  };
}

export function executeProcess(
  process: ProcessDefinition,
  options?: {
    taskId?: string;
    input?: Readonly<Record<string, unknown>>;
    metadata?: Readonly<Record<string, string>>;
    instanceId?: string;
  },
): ProcessExecuteBundle {
  assertProcessDefinition(process);

  const graph = buildProcessGraph(process);
  if (!graph.acyclic) {
    throw new Error(`process graph not acyclic: ${process.id}`);
  }

  const startedAt = Date.now();
  let instance = createProcessInstance({
    process,
    taskId: options?.taskId,
    input: options?.input,
    metadata: options?.metadata,
    instanceId: options?.instanceId,
  });
  let state = instance.state;

  const nodeOutputs: Array<{
    nodeId: string;
    workflowId: string;
    workflowInstanceId: string;
    output: Readonly<Record<string, unknown>>;
  }> = [];

  const nodeById = new Map(process.nodes.map((n) => [n.id, n]));

  try {
    state = advanceProcessPhase(state, "RUNNING", "process started");

    for (const nodeId of graph.order) {
      const node = nodeById.get(nodeId);
      if (!node) throw new Error(`node missing: ${nodeId}`);

      const started = nowIso();
      state = updateNodeState(state, nodeId, {
        status: "running",
        startedAt: started,
      });

      const workflow = getWorkflowById(node.workflowId);
      if (!workflow) {
        throw new Error(`workflow missing: ${node.workflowId}`);
      }

      const bundle = executeWorkflow(workflow, {
        taskId: `${instance.taskId}:${nodeId}`,
        input: {
          ...instance.input,
          processId: process.id,
          processInstanceId: instance.instanceId,
          nodeId,
          goal:
            typeof instance.input.goal === "string"
              ? instance.input.goal
              : `process:${process.id}:${nodeId}`,
        },
        metadata: {
          ...instance.metadata,
          layer: "e04-process",
          processId: process.id,
          nodeId,
        },
      });

      if (!bundle.result.success) {
        const finishedAt = nowIso();
        state = updateNodeState(state, nodeId, {
          status: "failed",
          finishedAt,
          workflowInstanceId: bundle.instance.instanceId,
          errorMessage: bundle.result.errorMessage ?? "node failed",
        });
        throw new Error(
          `node ${nodeId} failed: ${bundle.result.errorMessage ?? "unknown"}`,
        );
      }

      const finishedAt = nowIso();
      state = updateNodeState(state, nodeId, {
        status: "completed",
        finishedAt,
        workflowInstanceId: bundle.instance.instanceId,
        output: bundle.result.output,
      });

      nodeOutputs.push({
        nodeId,
        workflowId: node.workflowId,
        workflowInstanceId: bundle.instance.instanceId,
        output: bundle.result.output,
      });
    }

    state = advanceProcessPhase(state, "COMPLETED", "all nodes completed");
    state = advanceProcessPhase(state, "RESULT", "result sealed");
    const duration = Date.now() - startedAt;

    const result: ProcessExecutionResult = {
      success: true,
      processId: process.id,
      instanceId: instance.instanceId,
      taskId: instance.taskId,
      output: Object.freeze({
        processId: process.id,
        nodeCount: nodeOutputs.length,
        order: graph.order,
        lastNodeId: nodeOutputs[nodeOutputs.length - 1]?.nodeId ?? null,
      }),
      nodeOutputs: Object.freeze([...nodeOutputs]),
      duration,
      status: "result",
      readOnly: true,
    };

    instance = {
      ...instance,
      state,
      readOnly: true,
    };

    return { result, instance, state, graphOrder: graph.order };
  } catch (error) {
    const message = error instanceof Error ? error.message : "process failed";
    const duration = Date.now() - startedAt;

    const result: ProcessExecutionResult = {
      success: false,
      processId: process.id,
      instanceId: instance.instanceId,
      taskId: instance.taskId,
      output: {},
      nodeOutputs: Object.freeze([...nodeOutputs]),
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

    return { result, instance, state, graphOrder: graph.order };
  }
}

export function executeProcessOrThrow(
  process: ProcessDefinition,
  options?: {
    taskId?: string;
    input?: Readonly<Record<string, unknown>>;
    metadata?: Readonly<Record<string, string>>;
    instanceId?: string;
  },
): ProcessExecuteBundle & {
  result: ProcessExecutionResult & { success: true; status: "result" };
} {
  const bundle = executeProcess(process, options);
  if (!bundle.result.success || bundle.result.status !== "result") {
    throw new Error(
      `E04 process execution failed: ${bundle.result.errorMessage ?? bundle.result.status}`,
    );
  }
  return bundle as ProcessExecuteBundle & {
    result: ProcessExecutionResult & { success: true; status: "result" };
  };
}
