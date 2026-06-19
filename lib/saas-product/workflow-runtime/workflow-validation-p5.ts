import type { WorkflowInstance } from "../shared/workflow-runtime-types";
import { WORKFLOW_TYPES } from "../shared/workflow-runtime-types";
import { WORKFLOW_RUNTIME_ERROR_CODES, SaasWorkflowRuntimeError } from "../shared/workflow-runtime-errors";
import { assertValidBusinessWorkflowState } from "./multi-workflow-state-machine";

export function validateBusinessWorkflowInstanceShape(instance: WorkflowInstance): boolean {
  if (!instance.workflowId?.trim()) return false;
  if (!instance.workspaceProductId?.trim()) return false;
  if (!WORKFLOW_TYPES.includes(instance.workflowType)) return false;
  if (!instance.currentState?.trim()) return false;
  if (!instance.createdAt || !instance.updatedAt) return false;
  if (!Array.isArray(instance.history)) return false;
  return true;
}

export function validateBusinessWorkflowInstance(instance: WorkflowInstance): boolean {
  if (!validateBusinessWorkflowInstanceShape(instance)) return false;
  try {
    assertValidBusinessWorkflowState(instance.workflowType, instance.currentState);
  } catch {
    return false;
  }
  for (const entry of instance.history) {
    if (!entry.fromState || !entry.toState || !entry.timestamp || !entry.actor) return false;
  }
  return true;
}

export function assertValidBusinessWorkflowInstance(instance: WorkflowInstance): void {
  if (!validateBusinessWorkflowInstance(instance)) {
    throw new SaasWorkflowRuntimeError(
      WORKFLOW_RUNTIME_ERROR_CODES.WORKFLOW_INVALID,
      `Invalid business workflow instance: ${instance.workflowId}`,
    );
  }
}
