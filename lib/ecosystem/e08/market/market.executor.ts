/**
 * E08-P6 — Autonomous Market Agent Executor
 * INTELLIGENCE -> REASON -> DECIDE over E08 ecosystem intelligence
 */

import { getIntelligenceById } from "../intelligence/intelligence.registry";
import { runEcosystemIntelligence } from "../intelligence/intelligence.insight";
import type { IntelligenceRunResult } from "../intelligence/intelligence.types";
import { reasonMarketAgent } from "./market.agent";
import { assertMarketAgentDefinition } from "./market.registry";
import {
  appendMarketTraceEvent,
  createMarketRuntimeTrace,
  type MarketRuntimeTrace,
} from "./market.trace";
import type {
  MarketAgentDefinition,
  MarketDecision,
  MarketExecutionResult,
} from "./market.types";

type MarketExecutionSuccess = MarketExecutionResult & {
  success: true;
  status: "result";
  intelligence: IntelligenceRunResult;
  decision: MarketDecision;
};

export type MarketExecuteBundle = {
  result: MarketExecutionResult;
  trace: MarketRuntimeTrace;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

export function executeMarketAgent(
  agent: MarketAgentDefinition,
  options?: {
    taskId?: string;
    input?: Readonly<Record<string, unknown>>;
    metadata?: Readonly<Record<string, string>>;
    instanceId?: string;
  },
): MarketExecuteBundle {
  assertMarketAgentDefinition(agent);

  const startedAt = Date.now();
  const instanceId = options?.instanceId?.trim() || createId("mkt-inst");
  const taskId = options?.taskId?.trim() || createId("mkt-task");
  const input = Object.freeze({ ...(options?.input ?? {}) });

  let trace = createMarketRuntimeTrace({
    instanceId,
    agentId: agent.id,
    taskId,
  });

  trace = appendMarketTraceEvent(trace, "ready", `agent ${agent.id} ready`, {
    intelligenceId: agent.intelligenceId,
    mission: agent.mission,
  });

  try {
    const intelligenceDefinition = getIntelligenceById(agent.intelligenceId);
    if (!intelligenceDefinition) {
      throw new Error(`intelligence missing: ${agent.intelligenceId}`);
    }

    // INTELLIGENCE — run bound ecosystem intelligence
    const intelligenceRun = runEcosystemIntelligence(intelligenceDefinition, {
      taskId: `${taskId}:intelligence`,
      input,
      metadata: {
        ...(options?.metadata ?? {}),
        layer: "e08-market",
        agentId: agent.id,
      },
    });

    trace = appendMarketTraceEvent(
      trace,
      "intelligence",
      `intelligence ${intelligenceRun.result.status} score=${intelligenceRun.result.analysis.score}`,
      {
        needsInsight: String(intelligenceRun.result.analysis.needsInsight),
        confidence: String(intelligenceRun.result.insight.confidence),
      },
    );

    if (!intelligenceRun.result.success) {
      const status =
        intelligenceRun.result.status === "blocked" ? "blocked" : "failed";
      const message =
        intelligenceRun.result.errorMessage ??
        `intelligence ${status}`;

      trace = appendMarketTraceEvent(trace, "error", message, {
        intelligenceStatus: intelligenceRun.result.status,
      });

      return {
        trace,
        result: {
          success: false,
          agentId: agent.id,
          name: agent.name,
          mission: agent.mission,
          intelligenceId: agent.intelligenceId,
          instanceId,
          taskId,
          traceId: trace.traceId,
          intelligence: intelligenceRun.result,
          output: {},
          duration: Date.now() - startedAt,
          status,
          errorMessage: message,
          readOnly: true,
        },
      };
    }

    // REASON — derive decision from intelligence
    const decision = reasonMarketAgent(agent, intelligenceRun.result);
    trace = appendMarketTraceEvent(trace, "reason", decision.rationale, {
      posture: decision.posture,
      confidence: decision.confidence.toFixed(2),
    });

    // DECIDE — accept the decision with its directives
    trace = appendMarketTraceEvent(
      trace,
      "decide",
      `adopt ${decision.posture} posture with ${decision.directives.length} directives`,
      { directiveKinds: decision.directives.map((d) => d.kind).join(",") },
    );

    const duration = Date.now() - startedAt;

    const result: MarketExecutionResult = {
      success: true,
      agentId: agent.id,
      name: agent.name,
      mission: agent.mission,
      intelligenceId: agent.intelligenceId,
      instanceId,
      taskId,
      traceId: trace.traceId,
      intelligence: intelligenceRun.result,
      decision,
      output: Object.freeze({
        agentId: agent.id,
        mission: agent.mission,
        posture: decision.posture,
        confidence: decision.confidence,
        directiveCount: decision.directives.length,
        intelligenceScore: intelligenceRun.result.analysis.score,
        insightConfidence: intelligenceRun.result.insight.confidence,
      }),
      duration,
      status: "result",
      readOnly: true,
    };

    trace = appendMarketTraceEvent(
      trace,
      "result",
      `result ready durationMs=${duration}`,
      { success: "true" },
    );

    return { result, trace };
  } catch (error) {
    const message = error instanceof Error ? error.message : "market agent failed";
    const duration = Date.now() - startedAt;

    trace = appendMarketTraceEvent(trace, "error", message);

    return {
      trace,
      result: {
        success: false,
        agentId: agent.id,
        name: agent.name,
        mission: agent.mission,
        intelligenceId: agent.intelligenceId,
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

export function executeMarketAgentOrThrow(
  agent: MarketAgentDefinition,
  options?: {
    taskId?: string;
    input?: Readonly<Record<string, unknown>>;
    metadata?: Readonly<Record<string, string>>;
    instanceId?: string;
  },
): MarketExecuteBundle & { result: MarketExecutionSuccess } {
  const bundle = executeMarketAgent(agent, options);
  if (!bundle.result.success || bundle.result.status !== "result") {
    throw new Error(
      `E08 market agent execution failed: ${bundle.result.errorMessage ?? bundle.result.status}`,
    );
  }
  return bundle as MarketExecuteBundle & { result: MarketExecutionSuccess };
}
