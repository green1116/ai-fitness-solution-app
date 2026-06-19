import type { WorkflowMetrics } from "../shared/ops-runtime-types";
import type { WorkflowInstance, WorkflowType } from "../shared/workflow-runtime-types";
import { getTerminalBusinessWorkflowState } from "../workflow-runtime/multi-workflow-state-machine";

function countByType(workflows: WorkflowInstance[], workflowType: WorkflowType): number {
  return workflows.filter((item) => item.workflowType === workflowType).length;
}

function isTerminalWorkflow(workflow: WorkflowInstance): boolean {
  return workflow.currentState === getTerminalBusinessWorkflowState(workflow.workflowType);
}

export function calculateWorkflowMetrics(workflows: WorkflowInstance[]): WorkflowMetrics {
  const workflowCount = workflows.length;
  const quoteCount = countByType(workflows, "QUOTE");
  const approvalCount = countByType(workflows, "APPROVAL");
  const deliveryCount = countByType(workflows, "DELIVERY");
  const releaseCount = countByType(workflows, "RELEASE");
  const completedCount = workflows.filter(isTerminalWorkflow).length;
  const activeWorkflowCount = workflows.filter((item) => !isTerminalWorkflow(item)).length;
  const completionRate = workflowCount === 0 ? 0 : completedCount / workflowCount;

  return {
    workflowCount,
    quoteCount,
    approvalCount,
    deliveryCount,
    releaseCount,
    completionRate,
    activeWorkflowCount,
  };
}
