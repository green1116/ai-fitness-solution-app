/**
 * E06-P7 — Autonomous Enterprise Agent Executor
 * TWIN -> REASON -> DECIDE over the E06 digital twin engine
 */

import { getTwinById } from "../digital-twin/twin.registry";
import { simulateDigitalTwin } from "../digital-twin/twin.engine";
import { reasonEnterpriseAgent } from "./agent.reasoner";
import { assertEnterpriseAgentDefinition } from "./agent.registry";
import {
  appendAgentTraceEvent,
  createAgentRuntimeTrace,
  type AgentRuntimeTrace,
} from "./agent.trace";
import type {
  AgentDecision,
  AgentExecutionResult,
  EnterpriseAgentDefinition,
} from "./agent.types";
import type { TwinSimulationResult } from "../digital-twin/twin.types";

type AgentExecutionSuccess = AgentExecutionResult & {
  success: true;
  status: "result";
  twin: TwinSimulationResult;
  decision: AgentDecision;
};

export type AgentExecuteBundle = {
  result: AgentExecutionResult;
  trace: AgentRuntimeTrace;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

export function executeEnterpriseAgent(
  agent: EnterpriseAgentDefinition,
  options?: {
    taskId?: string;
    input?: Readonly<Record<string, unknown>>;
    metadata?: Readonly<Record<string, string>>;
    instanceId?: string;
  },
): AgentExecuteBundle {
  assertEnterpriseAgentDefinition(agent);

  const startedAt = Date.now();
  const instanceId = options?.instanceId?.trim() || createId("agent-inst");
  const taskId = options?.taskId?.trim() || createId("agent-task");
  const input = Object.freeze({ ...(options?.input ?? {}) });

  let trace = createAgentRuntimeTrace({
    instanceId,
    agentId: agent.id,
    taskId,
  });

  trace = appendAgentTraceEvent(trace, "ready", `agent ${agent.id} ready`, {
    twinId: agent.twinId,
    mission: agent.mission,
  });

  try {
    const twinDefinition = getTwinById(agent.twinId);
    if (!twinDefinition) {
      throw new Error(`twin missing: ${agent.twinId}`);
    }

    // TWIN — simulate the bound digital twin
    const twinRun = simulateDigitalTwin(twinDefinition, {
      taskId: `${taskId}:twin`,
      input,
      metadata: {
        ...(options?.metadata ?? {}),
        layer: "e06-agent",
        agentId: agent.id,
      },
    });
    trace = appendAgentTraceEvent(
      trace,
      "twin",
      `twin ${twinRun.result.status} projected=${twinRun.result.projection.projectedScore}`,
      { converged: String(twinRun.result.projection.converged) },
    );

    if (!twinRun.result.success) {
      throw new Error(
        `twin simulation failed: ${twinRun.result.errorMessage ?? "unknown"}`,
      );
    }

    // REASON — derive decision from the twin projection
    const decision = reasonEnterpriseAgent(agent, twinRun.result);
    trace = appendAgentTraceEvent(trace, "reason", decision.rationale, {
      posture: decision.posture,
      confidence: decision.confidence.toFixed(2),
    });

    // DECIDE — accept the decision with its directives
    trace = appendAgentTraceEvent(
      trace,
      "decide",
      `adopt ${decision.posture} posture with ${decision.directives.length} directives`,
      { directiveKinds: decision.directives.map((d) => d.kind).join(",") },
    );

    const duration = Date.now() - startedAt;

    const result: AgentExecutionResult = {
      success: true,
      agentId: agent.id,
      name: agent.name,
      mission: agent.mission,
      twinId: agent.twinId,
      instanceId,
      taskId,
      traceId: trace.traceId,
      twin: twinRun.result,
      decision,
      output: Object.freeze({
        agentId: agent.id,
        mission: agent.mission,
        posture: decision.posture,
        confidence: decision.confidence,
        directiveCount: decision.directives.length,
        twinProjectedScore: twinRun.result.projection.projectedScore,
        twinConverged: twinRun.result.projection.converged,
      }),
      duration,
      status: "result",
      readOnly: true,
    };

    trace = appendAgentTraceEvent(
      trace,
      "result",
      `result ready durationMs=${duration}`,
      { success: "true" },
    );

    return { result, trace };
  } catch (error) {
    const message = error instanceof Error ? error.message : "agent failed";
    const duration = Date.now() - startedAt;

    trace = appendAgentTraceEvent(trace, "error", message);

    return {
      trace,
      result: {
        success: false,
        agentId: agent.id,
        name: agent.name,
        mission: agent.mission,
        twinId: agent.twinId,
        instanceId,
        taskId,
        traceId: trace.traceId,
        output: {},
        duration,
        status: "failed",
        errorMessage: message,
        readOnly: true,
      },
    };
  }
}

export function executeEnterpriseAgentOrThrow(
  agent: EnterpriseAgentDefinition,
  options?: {
    taskId?: string;
    input?: Readonly<Record<string, unknown>>;
    metadata?: Readonly<Record<string, string>>;
    instanceId?: string;
  },
): AgentExecuteBundle & { result: AgentExecutionSuccess } {
  const bundle = executeEnterpriseAgent(agent, options);
  if (!bundle.result.success || bundle.result.status !== "result") {
    throw new Error(
      `E06 enterprise agent execution failed: ${bundle.result.errorMessage ?? bundle.result.status}`,
    );
  }
  return bundle as AgentExecuteBundle & { result: AgentExecutionSuccess };
}
