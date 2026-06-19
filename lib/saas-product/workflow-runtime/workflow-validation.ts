import type { WorkflowInstance } from "../shared/workflow-runtime-types";
import { WORKFLOW_TYPES } from "../shared/workflow-runtime-types";
import { WORKFLOW_RUNTIME_ERROR_CODES, SaasWorkflowRuntimeError } from "../shared/workflow-runtime-errors";
import { assertValidWorkflowState } from "./workflow-state-machine";

export function validateWorkflowInstanceShape(instance: WorkflowInstance): boolean {
  if (!instance.workflowId?.trim()) return false;
  if (!instance.workspaceProductId?.trim()) return false;
  if (!WORKFLOW_TYPES.includes(instance.workflowType)) return false;
  if (!instance.currentState?.trim()) return false;
  if (!instance.createdAt || !instance.updatedAt) return false;
  if (!Array.isArray(instance.history)) return false;
  return true;
}

export function validateWorkflowInstance(instance: WorkflowInstance): boolean {
  if (!validateWorkflowInstanceShape(instance)) return false;
  try {
    assertValidWorkflowState(instance.workflowType, instance.currentState);
  } catch {
    return false;
  }
  for (const entry of instance.history) {
    if (!entry.fromState || !entry.toState || !entry.timestamp || !entry.actor) return false;
  }
  return true;
}

export function assertValidWorkflowInstance(instance: WorkflowInstance): void {
  if (!validateWorkflowInstance(instance)) {
    throw new SaasWorkflowRuntimeError(
      WORKFLOW_RUNTIME_ERROR_CODES.WORKFLOW_INVALID,
      `Invalid workflow instance: ${instance.workflowId}`,
    );
  }
}
