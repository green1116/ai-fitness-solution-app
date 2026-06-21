/**
 * V62 P3 — Control: company control plane
 */

import type { CompanyState, CompanyCycleOutcome } from "../core/company.state";
import type { ExecutionAction, ExecutionResult } from "@/lib/ai-execution/core/execution.types";
import { generateExecutionPlan, executePlan, monitorExecutionResult } from "@/lib/ai-execution/execution.service";
import { enforceBusinessPolicies, allPoliciesPassed } from "../governance/policy.engine";
import { trimActionsToConstraints } from "../governance/constraint.engine";
import { guardExecutionBatch } from "../governance/safety.guard";

export async function executeCompanyActions(
  state: CompanyState,
  extraActions?: ExecutionAction[],
): Promise<{ results: ExecutionResult[]; policiesEnforced: number; outcome: Partial<CompanyCycleOutcome> }> {
  const plan = generateExecutionPlan(state.organizationId, { traceId: state.traceId });
  let actions = [...plan.actions, ...(extraActions ?? [])];

  actions = filterPolicyCompliantActions(state.organizationId, actions);
  actions = guardExecutionBatch(actions);
  actions = trimActionsToConstraints(actions);

  const policyChecks = enforceBusinessPolicies(state.organizationId, actions);
  const policiesEnforced = policyChecks.filter((p) => p.passed).length;

  if (!allPoliciesPassed(policyChecks)) {
    return {
      results: [],
      policiesEnforced,
      outcome: {
        actionsExecuted: 0,
        actionsFailed: 0,
        strategyGenerated: !!state.strategy,
      },
    };
  }

  const boundedPlan = { ...plan, actions };
  const results = await executePlan(boundedPlan);

  return {
    results,
    policiesEnforced,
    outcome: {
      actionsExecuted: results.filter((r) => r.status === "executed").length,
      actionsFailed: results.filter((r) => r.status === "failed").length,
      strategyGenerated: !!state.strategy,
    },
  };
}

function filterPolicyCompliantActions(organizationId: string, actions: ExecutionAction[]): ExecutionAction[] {
  return actions.filter((a) => a.organizationId === organizationId);
}

export function getControlPlaneStatus(organizationId: string) {
  const monitor = monitorExecutionResult(organizationId);
  return {
    organizationId,
    executionMonitor: monitor,
    controlPlane: "autonomous-company-v62-p3",
    status: monitor.failed > monitor.executed ? "degraded" : "operational",
  };
}
