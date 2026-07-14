/**
 * E03-P2 — Agent Executor
 * execute(agent, context): READY -> RUNNING -> COMPLETED -> RESULT
 */

import type { AgentDefinition } from "../core/agent.types";
import {
  assertValidExecutionContext,
  type AgentExecutionContext,
} from "./agent.context";
import {
  advanceExecutionPhase,
  createReadyExecutionState,
  type AgentExecutionState,
} from "./agent.execution";
import {
  buildAgentExecutionResult,
  type AgentExecutionResult,
} from "./agent.result";
import {
  appendTraceEvent,
  createAgentRuntimeTrace,
  type AgentRuntimeTrace,
} from "./agent.trace";

export type AgentExecuteBundle = {
  result: AgentExecutionResult;
  state: AgentExecutionState;
  trace: AgentRuntimeTrace;
};

function buildCapabilityOutput(
  agent: AgentDefinition,
  context: AgentExecutionContext,
): Record<string, unknown> {
  const goal =
    typeof context.input.goal === "string"
      ? context.input.goal
      : `run:${agent.role}`;

  switch (agent.capability) {
    case "plan":
      return {
        kind: "plan",
        steps: [`analyze:${goal}`, `delegate:${goal}`, `review:${goal}`],
        agentRole: agent.role,
      };
    case "execute":
      return {
        kind: "execution",
        completed: true,
        goal,
        worker: agent.id,
      };
    case "evaluate":
      return {
        kind: "evaluation",
        verdict: "pass",
        score: 1,
        goal,
      };
    case "remember":
      return {
        kind: "memory",
        stored: true,
        keys: Object.keys(context.input),
      };
    case "invoke":
      return {
        kind: "tool",
        invoked: true,
        toolHint:
          typeof context.input.tool === "string" ? context.input.tool : "default",
      };
    case "orchestrate":
      return {
        kind: "orchestration",
        coordinated: true,
        agents: agent.dependsOn,
      };
    default:
      return { kind: "noop", agentId: agent.id };
  }
}

export function execute(
  agent: AgentDefinition,
  context: AgentExecutionContext,
): AgentExecuteBundle {
  assertValidExecutionContext(context);

  if (agent.id !== context.agentId) {
    throw new Error(
      `agent/context mismatch: agent.id=${agent.id} context.agentId=${context.agentId}`,
    );
  }

  const startedAt = Date.now();
  let state = createReadyExecutionState();
  let trace = createAgentRuntimeTrace({
    executionId: context.executionId,
    agentId: context.agentId,
    taskId: context.taskId,
  });

  trace = appendTraceEvent(trace, "ready", `agent ${agent.id} ready`, {
    role: agent.role,
    capability: agent.capability,
  });

  try {
    state = advanceExecutionPhase(state, "RUNNING", "executor started");
    trace = appendTraceEvent(trace, "running", `agent ${agent.id} running`);

    const output = buildCapabilityOutput(agent, context);

    state = advanceExecutionPhase(state, "COMPLETED", "capability executed");
    trace = appendTraceEvent(trace, "completed", `agent ${agent.id} completed`, {
      capability: agent.capability,
    });

    state = advanceExecutionPhase(state, "RESULT", "result sealed");
    const duration = Date.now() - startedAt;

    const result = buildAgentExecutionResult({
      success: true,
      output,
      traceId: trace.traceId,
      duration,
      status: "result",
      executionId: context.executionId,
      agentId: context.agentId,
      taskId: context.taskId,
    });

    trace = appendTraceEvent(trace, "result", `result ready durationMs=${duration}`, {
      success: "true",
    });

    return { result, state, trace };
  } catch (error) {
    const message = error instanceof Error ? error.message : "execution failed";
    const duration = Date.now() - startedAt;

    trace = appendTraceEvent(trace, "error", message, {
      phase: state.phase,
    });

    const result = buildAgentExecutionResult({
      success: false,
      output: {},
      traceId: trace.traceId,
      duration,
      status: "failed",
      executionId: context.executionId,
      agentId: context.agentId,
      taskId: context.taskId,
      errorMessage: message,
    });

    return { result, state, trace };
  }
}

export function executeOrThrow(
  agent: AgentDefinition,
  context: AgentExecutionContext,
): AgentExecuteBundle & {
  result: AgentExecutionResult & { success: true; status: "result" };
} {
  const bundle = execute(agent, context);
  if (!bundle.result.success || bundle.result.status !== "result") {
    throw new Error(
      `E03 agent runtime execution failed: ${bundle.result.errorMessage ?? bundle.result.status}`,
    );
  }
  return bundle as AgentExecuteBundle & {
    result: AgentExecutionResult & { success: true; status: "result" };
  };
}
