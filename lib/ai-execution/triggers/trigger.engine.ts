/**
 * V62 P2 — Trigger engine (signals → execution)
 */

import type { ExecutionAction, ExecutionResult } from "../core/execution.types";
import { createTraceId } from "../core/execution.context";
import { collectExecutionSignals } from "./signal.listener";
import { resolveEventTriggers } from "./event.trigger";
import { executeAction } from "../core/execution-engine";
import { prioritizeActions } from "../planner/priority-resolver";

export async function runTriggerEngine(organizationId: string, traceId?: string) {
  const tid = traceId ?? createTraceId();
  const signals = collectExecutionSignals(organizationId);
  const actions = prioritizeActions(resolveEventTriggers(organizationId, tid));

  const results: ExecutionResult[] = [];
  for (const action of actions.slice(0, 5)) {
    results.push(await executeAction(action, tid));
  }

  return {
    traceId: tid,
    signals,
    actions,
    results,
    triggeredAt: new Date().toISOString(),
  };
}

export function inspectTriggers(organizationId: string): {
  signals: ReturnType<typeof collectExecutionSignals>;
  pendingActions: ExecutionAction[];
} {
  const traceId = createTraceId();
  return {
    signals: collectExecutionSignals(organizationId),
    pendingActions: resolveEventTriggers(organizationId, traceId),
  };
}
