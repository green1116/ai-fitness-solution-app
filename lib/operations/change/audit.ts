import type {
  ApprovalDecision,
  ChangeAuditBundle,
  ChangeLifecyclePhase,
  ChangePlan,
  ChangeRequest,
  ChangeStatus,
} from "./types";
import type { OperationalAutonomousExecutionRuntimeResult } from "../execution/types";

export function buildChangeAuditBundle(input: {
  deploymentId: string;
  requests: ChangeRequest[];
  plans: ChangePlan[];
  approvals: ApprovalDecision[];
  execution?: OperationalAutonomousExecutionRuntimeResult;
  lifecyclePhases: ChangeLifecyclePhase[];
}): ChangeAuditBundle {
  const now = new Date().toISOString();
  const primaryRequest = input.requests[0];
  const primaryPlan = input.plans[0];

  const executed = input.execution?.engine.executed ?? false;
  const rolledBack = input.execution?.rollback.result?.success ?? false;
  const success = input.approvals.some((a) => a.approved) && (executed || input.plans.length > 0);

  let status: ChangeStatus = "completed";
  if (input.approvals.every((a) => !a.approved)) status = "rejected";
  else if (rolledBack) status = "rolled_back";
  else if (input.execution?.status === "failed") status = "failed";
  else if (input.plans.length > 0) status = "executing";

  const traceEvents = input.lifecyclePhases.map((phase) => ({
    phase,
    detail: `${phase}-complete`,
    timestamp: now,
  }));

  if (input.execution) {
    traceEvents.push({
      phase: "execute",
      detail: `engine=${input.execution.engine.engineId} mode=${input.execution.engine.mode}`,
      timestamp: now,
    });
  }

  return {
    records: input.requests.map((request) => ({
      recordId: `change-record-${request.requestId}`,
      requestId: request.requestId,
      planId: input.plans.find((p) => p.requestId === request.requestId)?.planId ?? "none",
      status,
      timestamp: now,
    })),
    trace: {
      traceId: `change-trace-${input.deploymentId}`,
      events: traceEvents,
    },
    evidence: {
      evidenceId: `change-evidence-${input.deploymentId}`,
      requestId: primaryRequest?.requestId ?? "none",
      artifacts: [
        `approvals:${input.approvals.filter((a) => a.approved).length}`,
        `plans:${input.plans.length}`,
        input.execution ? `execution:${input.execution.registry.executionRuntimeId}` : "execution:pending",
      ],
    },
    outcome: {
      outcomeId: `change-outcome-${input.deploymentId}`,
      requestId: primaryRequest?.requestId ?? "none",
      success,
      rolledBack,
      message: `changes=${input.requests.length} approved=${input.approvals.filter((a) => a.approved).length} plans=${input.plans.length}`,
    },
  };
}
