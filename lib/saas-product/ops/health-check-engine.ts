import type { HealthFinding } from "../shared/ops-runtime-types";
import type { WorkflowInstance } from "../shared/workflow-runtime-types";
import type { WorkspaceProductInstance } from "../shared/workspace-runtime-types";
import { getInitialBusinessWorkflowState, getTerminalBusinessWorkflowState } from "../workflow-runtime/multi-workflow-state-machine";
import { workspaceProductExists } from "./ops-read-adapter";

function findWorkflowByType(workflows: WorkflowInstance[], workflowType: WorkflowInstance["workflowType"]) {
  return workflows.find((item) => item.workflowType === workflowType);
}

function isStuckWorkflow(workflow: WorkflowInstance): boolean {
  const initial = getInitialBusinessWorkflowState(workflow.workflowType);
  const terminal = getTerminalBusinessWorkflowState(workflow.workflowType);
  return workflow.currentState !== initial && workflow.currentState !== terminal;
}

export function runHealthChecks(
  workspaceProduct: WorkspaceProductInstance,
  workflows: WorkflowInstance[],
  allWorkspaceProductIds: string[],
): HealthFinding[] {
  const findings: HealthFinding[] = [];
  const workspaceProductId = workspaceProduct.workspaceProductId;

  if (workspaceProduct.status !== "active") {
    findings.push({
      code: "INACTIVE_PRODUCT",
      level: workspaceProduct.status === "archived" ? "CRITICAL" : "WARNING",
      message: `Workspace product is ${workspaceProduct.status}`,
      workspaceProductId,
    });
  }

  for (const workflow of workflows) {
    if (!allWorkspaceProductIds.includes(workflow.workspaceProductId)) {
      findings.push({
        code: "ORPHAN_WORKFLOW",
        level: "CRITICAL",
        message: `Workflow ${workflow.workflowId} has no matching workspace product`,
        workflowId: workflow.workflowId,
        workspaceProductId: workflow.workspaceProductId,
      });
      continue;
    }

    if (!workspaceProductExists(workflow.workspaceProductId)) {
      findings.push({
        code: "ORPHAN_WORKFLOW",
        level: "CRITICAL",
        message: `Workflow ${workflow.workflowId} references missing workspace product`,
        workflowId: workflow.workflowId,
        workspaceProductId: workflow.workspaceProductId,
      });
    }

    if (isStuckWorkflow(workflow)) {
      findings.push({
        code: "WORKFLOW_STUCK",
        level: "WARNING",
        message: `${workflow.workflowType} workflow is in non-terminal state: ${workflow.currentState}`,
        workflowId: workflow.workflowId,
        workspaceProductId,
      });
    }
  }

  const quote = findWorkflowByType(workflows, "QUOTE");
  const approval = findWorkflowByType(workflows, "APPROVAL");
  const delivery = findWorkflowByType(workflows, "DELIVERY");
  const release = findWorkflowByType(workflows, "RELEASE");

  if (
    quote &&
    (quote.currentState === "approved" || quote.currentState === getTerminalBusinessWorkflowState("QUOTE")) &&
    !approval
  ) {
    findings.push({
      code: "MISSING_APPROVAL",
      level: "WARNING",
      message: "Quote is approved but approval workflow is missing",
      workspaceProductId,
      workflowId: quote.workflowId,
    });
  }

  if (approval?.currentState === getTerminalBusinessWorkflowState("APPROVAL") && !delivery) {
    findings.push({
      code: "MISSING_DELIVERY",
      level: "WARNING",
      message: "Approval is complete but delivery workflow is missing",
      workspaceProductId,
      workflowId: approval.workflowId,
    });
  }

  if (delivery?.currentState === getTerminalBusinessWorkflowState("DELIVERY") && !release) {
    findings.push({
      code: "MISSING_RELEASE",
      level: "WARNING",
      message: "Delivery is complete but release workflow is missing",
      workspaceProductId,
      workflowId: delivery.workflowId,
    });
  }

  if (workflows.length === 0 && workspaceProduct.status === "active") {
    findings.push({
      code: "WORKFLOW_STUCK",
      level: "INFO",
      message: "Active product has no workflows yet",
      workspaceProductId,
    });
  }

  return findings;
}
