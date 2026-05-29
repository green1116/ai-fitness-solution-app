import type { ApprovalDecision, ChangeMetrics, ChangePlan, ChangeRequest } from "./types";
import type { OperationalAutonomousExecutionRuntimeResult } from "../execution/types";

export function computeChangeMetrics(input: {
  deploymentId: string;
  requests: ChangeRequest[];
  approvals: ApprovalDecision[];
  plans: ChangePlan[];
  audit: { outcome: { success: boolean; rolledBack: boolean } };
  execution?: OperationalAutonomousExecutionRuntimeResult;
}): ChangeMetrics {
  const changes = input.requests.length;
  const approved = input.approvals.filter((a) => a.approved).length;
  const rejected = input.approvals.filter((a) => !a.approved).length;
  const executed = input.plans.length;
  const rolledBack = input.audit.outcome.rolledBack ? 1 : 0;
  const failed = input.execution?.metrics.failures ?? (input.audit.outcome.success ? 0 : rejected > 0 ? 0 : 1);

  return {
    metricsId: `change-metrics-${input.deploymentId}`,
    changes,
    approved,
    rejected,
    executed,
    rolledBack,
    failed,
  };
}
