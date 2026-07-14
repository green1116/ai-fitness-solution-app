/**
 * E03-P3 — Tool Executor
 * PENDING -> AUTHORIZED -> RUNNING -> COMPLETED -> RESULT
 */

import type { ToolContract } from "./tool.contract";
import { validateToolInput } from "./tool.contract";
import {
  evaluateToolPermission,
  type ToolPermissionDecision,
} from "./tool.permission";
import {
  buildToolExecutionResult,
  type ToolExecutionResult,
} from "./tool.result";
import {
  appendToolTraceEvent,
  createToolRuntimeTrace,
  type ToolRuntimeTrace,
} from "./tool.trace";
import type { ToolExecutionPhase, ToolRequest } from "./tool.types";

export type ToolPhaseTransition = {
  from: ToolExecutionPhase;
  to: ToolExecutionPhase;
  at: string;
  note?: string;
  readOnly: true;
};

export type ToolPhaseState = {
  phase: ToolExecutionPhase;
  phases: ToolExecutionPhase[];
  transitions: ToolPhaseTransition[];
  complete: boolean;
  readOnly: true;
};

export const TOOL_PHASE_TRANSITIONS: ReadonlyArray<
  readonly [ToolExecutionPhase, ToolExecutionPhase]
> = [
  ["PENDING", "AUTHORIZED"],
  ["AUTHORIZED", "RUNNING"],
  ["RUNNING", "COMPLETED"],
  ["COMPLETED", "RESULT"],
] as const;

const PHASES: ToolExecutionPhase[] = [
  "PENDING",
  "AUTHORIZED",
  "RUNNING",
  "COMPLETED",
  "RESULT",
];

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

export function canAdvanceToolPhase(
  from: ToolExecutionPhase,
  to: ToolExecutionPhase,
): boolean {
  return TOOL_PHASE_TRANSITIONS.some(([f, t]) => f === from && t === to);
}

export function createPendingToolPhaseState(): ToolPhaseState {
  return {
    phase: "PENDING",
    phases: [...PHASES],
    transitions: [],
    complete: false,
    readOnly: true,
  };
}

export function advanceToolPhase(
  state: ToolPhaseState,
  to: ToolExecutionPhase,
  note?: string,
): ToolPhaseState {
  if (!canAdvanceToolPhase(state.phase, to)) {
    throw new Error(`Invalid tool phase transition: ${state.phase} → ${to}`);
  }

  return {
    phase: to,
    phases: [...PHASES],
    transitions: [
      ...state.transitions,
      {
        from: state.phase,
        to,
        at: nowIso(),
        note,
        readOnly: true,
      },
    ],
    complete: to === "RESULT",
    readOnly: true,
  };
}

export type ToolExecuteBundle = {
  result: ToolExecutionResult;
  phase: ToolPhaseState;
  trace: ToolRuntimeTrace;
  permission: ToolPermissionDecision;
};

export function createToolRequest(input: {
  toolId: string;
  caller: ToolRequest["caller"];
  input?: ToolRequest["input"];
  metadata?: ToolRequest["metadata"];
  requestId?: string;
}): ToolRequest {
  if (!input.toolId.trim()) throw new Error("toolId is required");
  if (!input.caller.agentId.trim()) throw new Error("caller.agentId is required");

  return {
    requestId: input.requestId?.trim() || createId("treq"),
    toolId: input.toolId.trim(),
    caller: {
      agentId: input.caller.agentId.trim(),
      role: input.caller.role,
      taskId: input.caller.taskId,
      executionId: input.caller.executionId,
    },
    input: Object.freeze({ ...(input.input ?? {}) }),
    metadata: Object.freeze({ ...(input.metadata ?? {}) }),
    createdAt: nowIso(),
    readOnly: true,
  };
}

export function executeTool(
  contract: ToolContract,
  request: ToolRequest,
): ToolExecuteBundle {
  if (contract.id !== request.toolId) {
    throw new Error(
      `tool/request mismatch: contract.id=${contract.id} request.toolId=${request.toolId}`,
    );
  }

  const startedAt = Date.now();
  let phase = createPendingToolPhaseState();
  let trace = createToolRuntimeTrace({
    requestId: request.requestId,
    toolId: request.toolId,
    agentId: request.caller.agentId,
  });

  trace = appendToolTraceEvent(trace, "pending", `tool ${contract.id} pending`);

  const permission = evaluateToolPermission(contract, request.caller);
  if (!permission.allowed) {
    trace = appendToolTraceEvent(trace, "denied", permission.reason, {
      role: request.caller.role,
    });
    return {
      permission,
      phase,
      trace,
      result: buildToolExecutionResult({
        success: false,
        status: "denied",
        toolId: contract.id,
        requestId: request.requestId,
        traceId: trace.traceId,
        duration: Date.now() - startedAt,
        errorMessage: permission.reason,
      }),
    };
  }

  try {
    phase = advanceToolPhase(phase, "AUTHORIZED", permission.reason);
    trace = appendToolTraceEvent(trace, "authorized", permission.reason);

    const inputCheck = validateToolInput(contract, request.input);
    if (!inputCheck.ok) {
      throw new Error(`missing required input: ${inputCheck.missing.join(", ")}`);
    }

    phase = advanceToolPhase(phase, "RUNNING", "handler invoked");
    trace = appendToolTraceEvent(trace, "running", `running ${contract.id}`);

    const output = contract.handler(request.input);

    phase = advanceToolPhase(phase, "COMPLETED", "handler completed");
    trace = appendToolTraceEvent(trace, "completed", `completed ${contract.id}`);

    phase = advanceToolPhase(phase, "RESULT", "result sealed");
    const duration = Date.now() - startedAt;

    const result = buildToolExecutionResult({
      success: true,
      status: "result",
      toolId: contract.id,
      requestId: request.requestId,
      output,
      traceId: trace.traceId,
      duration,
    });

    trace = appendToolTraceEvent(
      trace,
      "result",
      `result ready durationMs=${duration}`,
      { success: "true" },
    );

    return { result, phase, trace, permission };
  } catch (error) {
    const message = error instanceof Error ? error.message : "tool failed";
    const duration = Date.now() - startedAt;
    trace = appendToolTraceEvent(trace, "error", message, {
      phase: phase.phase,
    });

    return {
      permission,
      phase,
      trace,
      result: buildToolExecutionResult({
        success: false,
        status: "failed",
        toolId: contract.id,
        requestId: request.requestId,
        traceId: trace.traceId,
        duration,
        errorMessage: message,
      }),
    };
  }
}

export function executeToolOrThrow(
  contract: ToolContract,
  request: ToolRequest,
): ToolExecuteBundle & {
  result: ToolExecutionResult & { success: true; status: "result" };
} {
  const bundle = executeTool(contract, request);
  if (!bundle.result.success || bundle.result.status !== "result") {
    throw new Error(
      `E03 tool execution failed: ${bundle.result.errorMessage ?? bundle.result.status}`,
    );
  }
  return bundle as ToolExecuteBundle & {
    result: ToolExecutionResult & { success: true; status: "result" };
  };
}
