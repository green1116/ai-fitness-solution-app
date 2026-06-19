import type { WorkflowDependencyRule } from "../shared/workflow-p5-types";
import type { WorkflowType } from "../shared/workflow-runtime-types";
import { WORKFLOW_P5_ERROR_CODES, SaasWorkflowP5Error } from "../shared/workflow-runtime-errors-p5";
import { findActiveWorkflowByType } from "./workflow-repository";
import { recordWorkflowP5Event } from "./workflow-events-p5";

export const WORKFLOW_DEPENDENCY_RULES: WorkflowDependencyRule[] = [
  { workflowType: "APPROVAL", requiresType: "QUOTE", requiresState: "approved" },
  { workflowType: "DELIVERY", requiresType: "APPROVAL", requiresState: "approved" },
  { workflowType: "RELEASE", requiresType: "DELIVERY", requiresState: "completed" },
];

export function getWorkflowDependencyRule(workflowType: WorkflowType): WorkflowDependencyRule | undefined {
  return WORKFLOW_DEPENDENCY_RULES.find((rule) => rule.workflowType === workflowType);
}

export function checkWorkflowDependency(workspaceProductId: string, workflowType: WorkflowType): boolean {
  const rule = getWorkflowDependencyRule(workflowType);
  if (!rule) return true;

  const prerequisite = findActiveWorkflowByType(workspaceProductId, rule.requiresType);
  return Boolean(prerequisite && prerequisite.currentState === rule.requiresState);
}

export function assertWorkflowDependency(workspaceProductId: string, workflowType: WorkflowType): void {
  const rule = getWorkflowDependencyRule(workflowType);
  if (!rule) return;

  if (!checkWorkflowDependency(workspaceProductId, workflowType)) {
    recordWorkflowP5Event({
      eventType: "WORKFLOW_DEPENDENCY_DENIED",
      workspaceProductId,
      workflowType,
      detail: `${workflowType} requires ${rule.requiresType}=${rule.requiresState}`,
    });
    throw new SaasWorkflowP5Error(
      WORKFLOW_P5_ERROR_CODES.WORKFLOW_DEPENDENCY_NOT_SATISFIED,
      `${workflowType} dependency not satisfied: ${rule.requiresType} must be ${rule.requiresState}`,
    );
  }

  recordWorkflowP5Event({
    eventType: "WORKFLOW_DEPENDENCY_SATISFIED",
    workspaceProductId,
    workflowType,
    detail: `${rule.requiresType}=${rule.requiresState}`,
  });
}
