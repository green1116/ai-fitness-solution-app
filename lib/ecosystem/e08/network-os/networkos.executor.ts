/**
 * E08-P7 — Enterprise Network OS Executor
 * Runs controlled market-agent slots via E08 autonomous market agents
 */

import { getMarketAgentById } from "../market/market.registry";
import { executeMarketAgent } from "../market/market.executor";
import { controlNetworkOs } from "./networkos.controller";
import {
  appendNetworkOsTraceEvent,
  createNetworkOsRuntimeTrace,
  type NetworkOsRuntimeTrace,
} from "./networkos.trace";
import type {
  NetworkOsDefinition,
  NetworkOsExecutionResult,
  NetworkOsSlotResult,
} from "./networkos.types";

export type NetworkOsExecuteBundle = {
  result: NetworkOsExecutionResult;
  trace: NetworkOsRuntimeTrace;
};

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

export function executeNetworkOs(
  definition: NetworkOsDefinition,
  options?: {
    taskId?: string;
    input?: Readonly<Record<string, unknown>>;
    metadata?: Readonly<Record<string, string>>;
    instanceId?: string;
  },
): NetworkOsExecuteBundle {
  const startedAt = Date.now();
  const instanceId = options?.instanceId?.trim() || createId("nos-inst");
  const taskId = options?.taskId?.trim() || createId("nos-task");
  const input = Object.freeze({ ...(options?.input ?? {}) });

  let trace = createNetworkOsRuntimeTrace({
    instanceId,
    networkOsId: definition.id,
    taskId,
  });

  trace = appendNetworkOsTraceEvent(
    trace,
    "ready",
    `network os ${definition.id} ready`,
    { kind: definition.kind },
  );

  const slotResults: NetworkOsSlotResult[] = [];
  const marketAgentIds: string[] = [];

  const fail = (
    plan: NetworkOsExecutionResult["plan"],
    status: "blocked" | "failed",
    message: string,
  ): NetworkOsExecuteBundle => {
    trace = appendNetworkOsTraceEvent(trace, "error", message);
    return {
      trace,
      result: {
        success: false,
        networkOsId: definition.id,
        kind: definition.kind,
        mission: definition.mission,
        instanceId,
        taskId,
        traceId: trace.traceId,
        plan,
        slotResults: [...slotResults],
        completedSlots: slotResults.filter((s) => s.success).length,
        marketAgentIds: [...marketAgentIds],
        output: {},
        duration: Date.now() - startedAt,
        status,
        errorMessage: message,
        readOnly: true,
      },
    };
  };

  try {
    const plan = controlNetworkOs(definition);
    trace = appendNetworkOsTraceEvent(trace, "control", plan.narrative, {
      slotCount: String(plan.slotCount),
    });

    for (const slot of plan.slots) {
      const agent = getMarketAgentById(slot.marketAgentId);
      if (!agent) {
        return fail(plan, "failed", `unknown market agent: ${slot.marketAgentId}`);
      }

      trace = appendNetworkOsTraceEvent(
        trace,
        "slot",
        `slot ${slot.order}/${plan.slotCount}: ${slot.title}`,
        { marketAgentId: slot.marketAgentId },
      );

      const run = executeMarketAgent(agent, {
        taskId: `${taskId}:slot-${slot.order}`,
        input: {
          ...input,
          networkOsId: definition.id,
          networkOsKind: definition.kind,
          slotOrder: slot.order,
          goal:
            typeof input.goal === "string"
              ? input.goal
              : `network-os:${definition.kind}`,
        },
        metadata: {
          ...(options?.metadata ?? {}),
          layer: "e08-network-os",
          networkOsId: definition.id,
        },
      });

      const slotResult: NetworkOsSlotResult = {
        slotId: slot.id,
        order: slot.order,
        marketAgentId: slot.marketAgentId,
        success: run.result.success,
        status: run.result.status,
        posture: run.result.decision?.posture,
        confidence: run.result.decision?.confidence,
        durationMs: run.result.duration,
        errorMessage: run.result.errorMessage,
        readOnly: true,
      };
      slotResults.push(slotResult);

      trace = appendNetworkOsTraceEvent(
        trace,
        "market",
        `market agent ${slot.marketAgentId} status=${run.result.status}`,
        {
          success: String(run.result.success),
          posture: run.result.decision?.posture ?? "",
        },
      );

      if (!run.result.success) {
        const status =
          run.result.status === "blocked" ? "blocked" : "failed";
        return fail(
          plan,
          status,
          `slot ${slot.order} ${status}: ${run.result.errorMessage ?? "unknown"}`,
        );
      }

      marketAgentIds.push(slot.marketAgentId);
    }

    const duration = Date.now() - startedAt;
    const result: NetworkOsExecutionResult = {
      success: true,
      networkOsId: definition.id,
      kind: definition.kind,
      mission: definition.mission,
      instanceId,
      taskId,
      traceId: trace.traceId,
      plan,
      slotResults: [...slotResults],
      completedSlots: slotResults.length,
      marketAgentIds: [...marketAgentIds],
      output: Object.freeze({
        networkOsId: definition.id,
        kind: definition.kind,
        slotCount: plan.slotCount,
        completedSlots: slotResults.length,
        marketAgentIds: [...marketAgentIds],
        missions: plan.slots.map((s) => s.marketMission),
      }),
      duration,
      status: "result",
      readOnly: true,
    };

    trace = appendNetworkOsTraceEvent(
      trace,
      "result",
      `result ready slots=${slotResults.length}/${plan.slotCount} durationMs=${duration}`,
      { success: "true" },
    );

    return { result, trace };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "network os failed";
    return fail(
      {
        networkOsId: definition.id,
        kind: definition.kind,
        mission: definition.mission,
        slotCount: 0,
        slots: [],
        narrative: "control plan unavailable",
        readOnly: true,
      },
      "failed",
      message,
    );
  }
}

export function executeNetworkOsOrThrow(
  definition: NetworkOsDefinition,
  options?: {
    taskId?: string;
    input?: Readonly<Record<string, unknown>>;
    metadata?: Readonly<Record<string, string>>;
    instanceId?: string;
  },
): NetworkOsExecuteBundle & {
  result: NetworkOsExecutionResult & { success: true; status: "result" };
} {
  const bundle = executeNetworkOs(definition, options);
  if (!bundle.result.success || bundle.result.status !== "result") {
    throw new Error(
      `E08 network os failed: ${bundle.result.errorMessage ?? bundle.result.status}`,
    );
  }
  return bundle as NetworkOsExecuteBundle & {
    result: NetworkOsExecutionResult & { success: true; status: "result" };
  };
}
