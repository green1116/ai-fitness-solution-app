/**
 * V62 P2 — Execution plan generator
 */

import { generateActionPlan, buildBusinessContext } from "@/lib/ai-decision/decision.service";
import type { ExecutionPlan } from "../core/execution.types";
import { createTraceId } from "../core/execution.context";
import { planExecutionsFromDecisions } from "./action-planner";
import { prioritizeActions } from "./priority-resolver";
import { evaluateAutomationRules } from "../automation/automation.rules";

export function generateExecutionPlan(
  organizationId: string,
  options?: { traceId?: string; includeAutomation?: boolean },
): ExecutionPlan {
  const traceId = options?.traceId ?? createTraceId();
  const context = buildBusinessContext(organizationId);
  const decisions = generateActionPlan(context, organizationId);
  const fromDecisions = planExecutionsFromDecisions(decisions);

  const fromRules =
    options?.includeAutomation !== false
      ? evaluateAutomationRules(organizationId, traceId)
      : [];

  const actions = prioritizeActions([...fromDecisions, ...fromRules]);

  return {
    organizationId,
    traceId,
    actions,
    generatedAt: new Date().toISOString(),
    source: fromRules.length > 0 ? "automation_rules" : "decision_engine",
  };
}
