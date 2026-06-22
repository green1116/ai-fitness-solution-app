/**
 * V62 P2 — Automation engine
 */

import type { ExecutionAction, ExecutionResult } from "../core/execution.types";
import { evaluateAutomationRules } from "./automation.rules";
import { scheduleExecutions, drainScheduledExecutions } from "./automation.scheduler";
import { buildExecutionContext } from "../core/execution.context";
import { executeAction } from "../core/execution-engine";

export async function triggerAutomationRules(
  organizationId: string,
  traceId: string,
  options?: { executeImmediately?: boolean },
): Promise<{ rules: ExecutionAction[]; results: ExecutionResult[] }> {
  const rules = evaluateAutomationRules(organizationId, traceId);
  scheduleExecutions(rules);

  if (!options?.executeImmediately) {
    return { rules, results: [] };
  }

  const results: ExecutionResult[] = [];
  for (const action of rules) {
    results.push(await executeAction(action, traceId));
  }
  return { rules, results };
}

export async function runAutomationCycle(organizationId: string, traceId: string) {
  const ctx = buildExecutionContext(organizationId, traceId);
  const triggered = await triggerAutomationRules(organizationId, traceId, {
    executeImmediately: true,
  });

  const scheduled = drainScheduledExecutions(organizationId);
  const results = [...triggered.results];

  for (const action of scheduled) {
    if (!results.some((r) => r.actionId === action.id)) {
      results.push(await executeAction(action, traceId));
    }
  }

  return {
    context: ctx,
    rules: triggered.rules,
    results,
    executedAt: new Date().toISOString(),
  };
}
