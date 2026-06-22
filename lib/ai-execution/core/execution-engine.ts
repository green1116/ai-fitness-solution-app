/**
 * V62 P2 — AI Execution Engine (orchestrates V60/V61 delegation)
 */

import type {
  ExecutionAction,
  ExecutionPlan,
  ExecutionResult,
  ExecutionMonitorReport,
} from "./execution.types";
import { validateExecutionAction } from "./execution.validation";
import {
  logExecution,
  getExecutionLogs,
  getReversibleAction,
  clearReversibleAction,
} from "./execution-log.store";
import { executeGrowthAction } from "../executor/growth.executor";
import { executeSalesAction } from "../executor/sales.executor";
import { executePricingAction } from "../executor/pricing.executor";
import { executeCRMAction } from "../executor/crm.executor";
import { generateExecutionPlan } from "../planner/execution-planner";
import { prioritizeActions } from "../planner/priority-resolver";
import { emitKpiStreamUpdate } from "@/lib/dashboard/realtime/dashboard.stream";
import { incrementMetric } from "@/lib/observability/metrics.service";
import { appendGrowthEvent } from "@/lib/growth/growth.events.store";

export { generateExecutionPlan, prioritizeActions };

export async function executeAction(
  action: ExecutionAction,
  traceId: string,
): Promise<ExecutionResult> {
  validateExecutionAction(action);

  let result: ExecutionResult;

  try {
    switch (action.type) {
      case "GROWTH":
        result = await executeGrowthAction(action, traceId);
        break;
      case "SALES":
        result = await executeSalesAction(action, traceId);
        break;
      case "PRICING":
        result = await executePricingAction(action, traceId);
        break;
      case "CRM":
        result = await executeCRMAction(action, traceId);
        break;
      case "SYSTEM":
        result = await dispatchSystemAction(action, traceId);
        break;
      default:
        result = {
          actionId: action.id,
          type: action.type,
          status: "failed",
          message: `Unknown type: ${action.type}`,
          targetSystem: action.targetSystem,
          traceId,
          reversible: false,
          executedAt: new Date().toISOString(),
        };
    }
  } catch (err) {
    result = {
      actionId: action.id,
      type: action.type,
      status: "failed",
      message: err instanceof Error ? err.message : "execution failed",
      targetSystem: action.targetSystem,
      traceId,
      reversible: false,
      executedAt: new Date().toISOString(),
    };
  }

  logExecution(action, result);
  incrementMetric("ai.execution.count", { type: action.type, status: result.status });
  return result;
}

export async function dispatchSystemAction(
  action: ExecutionAction,
  traceId: string,
): Promise<ExecutionResult> {
  const op = String((action.payload as { operation?: string })?.operation ?? "metrics_refresh");

  if (op === "metrics_refresh" || action.targetSystem === "V61") {
    emitKpiStreamUpdate(action.organizationId);
    return {
      actionId: action.id,
      type: "SYSTEM",
      status: "executed",
      message: "V61 dashboard metrics stream updated",
      targetSystem: "V61",
      delegatedTo: "lib/dashboard/realtime/dashboard.stream",
      traceId,
      reversible: true,
      executedAt: new Date().toISOString(),
    };
  }

  incrementMetric("ai.execution.system", { organizationId: action.organizationId });
  return {
    actionId: action.id,
    type: "SYSTEM",
    status: "executed",
    message: "V59 observability metric recorded",
    targetSystem: "V59",
    delegatedTo: "lib/observability/metrics.service",
    traceId,
    reversible: false,
    executedAt: new Date().toISOString(),
  };
}

export async function executePlan(plan: ExecutionPlan): Promise<ExecutionResult[]> {
  const ordered = prioritizeActions(plan.actions);
  const results: ExecutionResult[] = [];

  for (const action of ordered) {
    results.push(await executeAction(action, plan.traceId));
  }

  // Feedback loop → metrics update
  await dispatchSystemAction(
    {
      id: `sys-feedback-${plan.traceId}`,
      type: "SYSTEM",
      priority: "LOW",
      payload: { operation: "metrics_refresh" },
      targetSystem: "V61",
      organizationId: plan.organizationId,
    },
    plan.traceId,
  );

  return results;
}

export async function runAutonomousExecution(organizationId: string, traceId?: string) {
  const plan = generateExecutionPlan(organizationId, { traceId });
  const results = await executePlan(plan);
  return { plan, results };
}

export function monitorExecutionResult(organizationId?: string): ExecutionMonitorReport {
  const logs = getExecutionLogs(organizationId, 100);
  return {
    total: logs.length,
    executed: logs.filter((l) => l.result.status === "executed").length,
    failed: logs.filter((l) => l.result.status === "failed").length,
    skipped: logs.filter((l) => l.result.status === "skipped").length,
    reversed: logs.filter((l) => l.result.status === "reversed").length,
    recent: logs.slice(-10),
  };
}

export async function reverseExecution(actionId: string, traceId: string): Promise<ExecutionResult | null> {
  const action = getReversibleAction(actionId);
  if (!action) return null;

  appendGrowthEvent({
    event: "execution.reversed",
    organizationId: action.organizationId,
    meta: { actionId, reversedAt: new Date().toISOString() },
  });

  clearReversibleAction(actionId);

  const result: ExecutionResult = {
    actionId,
    type: action.type,
    status: "reversed",
    message: "Execution reversed — automation rollback recorded",
    targetSystem: action.targetSystem,
    traceId,
    reversible: false,
    executedAt: new Date().toISOString(),
  };

  logExecution(action, result);
  return result;
}

// Re-export executor entry points for verification
export {
  executeGrowthAction,
  executeSalesAction,
  executePricingAction,
  executeCRMAction,
};
