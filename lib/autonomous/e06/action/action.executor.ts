/**
 * E06-P2 — Business Action Executor
 * Runs actions via E06 operation executor
 */

import { getOperationById } from "../core/operation.registry";
import { createOperationExecutionContext } from "../runtime/operation.context";
import { executeOperation } from "../runtime/operation.executor";
import { assertActionDefinition } from "./action.registry";
import { createActionEffectRecord } from "./action.result";
import {
  appendActionTraceEvent,
  createActionRuntimeTrace,
  type ActionRuntimeTrace,
} from "./action.trace";
import type {
  ActionDefinition,
  ActionExecutionResult,
} from "./action.types";

export type ActionExecuteBundle = {
  result: ActionExecutionResult;
  trace: ActionRuntimeTrace;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

export function executeBusinessAction(
  action: ActionDefinition,
  options?: {
    taskId?: string;
    input?: Readonly<Record<string, unknown>>;
    metadata?: Readonly<Record<string, string>>;
    instanceId?: string;
  },
): ActionExecuteBundle {
  assertActionDefinition(action);

  const startedAt = Date.now();
  const instanceId = options?.instanceId?.trim() || createId("act-inst");
  const taskId = options?.taskId?.trim() || createId("act-task");
  const input = Object.freeze({ ...(options?.input ?? {}) });

  let trace = createActionRuntimeTrace({
    instanceId,
    actionId: action.id,
    taskId,
  });

  trace = appendActionTraceEvent(trace, "ready", `action ${action.id} ready`, {
    operationId: action.operationId,
    kind: action.kind,
  });

  const operation = getOperationById(action.operationId);

  try {
    if (!operation) {
      throw new Error(`operation missing: ${action.operationId}`);
    }

    trace = appendActionTraceEvent(
      trace,
      "operation",
      `running operation ${operation.id}`,
      { intelligenceId: operation.intelligenceId },
    );

    const context = createOperationExecutionContext({
      operationId: operation.id,
      intelligenceId: operation.intelligenceId,
      insightId: operation.insightId,
      taskId: `${taskId}:op`,
      input: {
        ...input,
        actionId: action.id,
        actionKind: action.kind,
        goal:
          typeof input.goal === "string"
            ? input.goal
            : `action:${action.kind}`,
      },
      metadata: {
        ...(options?.metadata ?? {}),
        layer: "e06-action",
        actionId: action.id,
      },
    });

    const operationRun = executeOperation(operation, context);

    trace = appendActionTraceEvent(
      trace,
      "policy",
      `policy effect=${operationRun.result.policy.effect}`,
      { matchedPolicyId: operationRun.result.policy.matchedPolicyId ?? "none" },
    );

    if (operationRun.result.status === "blocked") {
      const duration = Date.now() - startedAt;
      trace = appendActionTraceEvent(
        trace,
        "error",
        operationRun.result.errorMessage ?? "operation blocked",
      );

      return {
        trace,
        result: {
          success: false,
          actionId: action.id,
          kind: action.kind,
          operationId: action.operationId,
          intelligenceId: operation.intelligenceId,
          instanceId,
          taskId,
          traceId: trace.traceId,
          operationOutput: {},
          output: {},
          duration,
          status: "blocked",
          errorMessage: operationRun.result.errorMessage ?? "operation blocked",
          readOnly: true,
        },
      };
    }

    if (!operationRun.result.success) {
      throw new Error(
        `operation failed: ${operationRun.result.errorMessage ?? "unknown"}`,
      );
    }

    const effect = createActionEffectRecord(
      action,
      operationRun.result.policy.effect,
    );
    trace = appendActionTraceEvent(
      trace,
      "effect",
      `effect ${effect.effect} emitted`,
      { policyEffect: effect.policyEffect },
    );

    const duration = Date.now() - startedAt;

    const result: ActionExecutionResult = {
      success: true,
      actionId: action.id,
      kind: action.kind,
      operationId: action.operationId,
      intelligenceId: operation.intelligenceId,
      instanceId,
      taskId,
      traceId: trace.traceId,
      effect,
      operationOutput: operationRun.result.output,
      output: Object.freeze({
        actionId: action.id,
        kind: action.kind,
        effect: effect.effect,
        policyEffect: effect.policyEffect,
        operationDomain: operation.domain,
      }),
      duration,
      status: "result",
      readOnly: true,
    };

    trace = appendActionTraceEvent(
      trace,
      "result",
      `result ready durationMs=${duration}`,
      { success: "true" },
    );

    return { result, trace };
  } catch (error) {
    const message = error instanceof Error ? error.message : "action failed";
    const duration = Date.now() - startedAt;

    trace = appendActionTraceEvent(trace, "error", message);

    return {
      trace,
      result: {
        success: false,
        actionId: action.id,
        kind: action.kind,
        operationId: action.operationId,
        intelligenceId: operation?.intelligenceId ?? "unknown",
        instanceId,
        taskId,
        traceId: trace.traceId,
        operationOutput: {},
        output: {},
        duration,
        status: "failed",
        errorMessage: message,
        readOnly: true,
      },
    };
  }
}

export function executeBusinessActionOrThrow(
  action: ActionDefinition,
  options?: {
    taskId?: string;
    input?: Readonly<Record<string, unknown>>;
    metadata?: Readonly<Record<string, string>>;
    instanceId?: string;
  },
): ActionExecuteBundle & {
  result: ActionExecutionResult & { success: true; status: "result" };
} {
  const bundle = executeBusinessAction(action, options);
  if (!bundle.result.success || bundle.result.status !== "result") {
    throw new Error(
      `E06 action execution failed: ${bundle.result.errorMessage ?? bundle.result.status}`,
    );
  }
  return bundle as ActionExecuteBundle & {
    result: ActionExecutionResult & { success: true; status: "result" };
  };
}
