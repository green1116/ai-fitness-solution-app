/**
 * V62 P2 — Event triggers
 */

import { appendGrowthEvent } from "@/lib/growth/growth.events.store";
import type { ExecutionAction } from "../core/execution.types";
import { collectExecutionSignals } from "./signal.listener";
import { evaluateAutomationRules } from "../automation/automation.rules";

export function emitExecutionTriggerEvent(input: {
  organizationId: string;
  trigger: string;
  actionId?: string;
  meta?: Record<string, unknown>;
}) {
  appendGrowthEvent({
    event: "execution.trigger",
    organizationId: input.organizationId,
    meta: { trigger: input.trigger, actionId: input.actionId, ...input.meta },
  });
}

export function resolveEventTriggers(organizationId: string, traceId: string): ExecutionAction[] {
  const signals = collectExecutionSignals(organizationId);
  const actions: ExecutionAction[] = [];

  for (const signal of signals) {
    if (signal.name === "hot_deal" && signal.strength > 0) {
      emitExecutionTriggerEvent({
        organizationId,
        trigger: "sales.hot_deal",
        meta: { strength: signal.strength },
      });
    }
    if (signal.name === "churn_risk") {
      emitExecutionTriggerEvent({
        organizationId,
        trigger: "growth.churn_risk",
        meta: { strength: signal.strength },
      });
    }
  }

  if (signals.length > 0) {
    actions.push(...evaluateAutomationRules(organizationId, traceId));
  }

  return actions;
}
