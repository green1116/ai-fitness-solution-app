import type { WorkflowInstance } from "../shared/workflow-runtime-types";
import { WORKFLOW_RUNTIME_ERROR_CODES, SaasWorkflowRuntimeError } from "../shared/workflow-runtime-errors";
import { cloneWorkflowInstance } from "./workflow-instance";

const workflowInstances = new Map<string, WorkflowInstance>();

export function saveWorkflowInstance(instance: WorkflowInstance): WorkflowInstance {
  const cloned = cloneWorkflowInstance(instance);
  workflowInstances.set(cloned.workflowId, cloned);
  return cloneWorkflowInstance(cloned);
}

export function getWorkflowInstance(workflowId: string): WorkflowInstance | undefined {
  const record = workflowInstances.get(workflowId);
  return record ? cloneWorkflowInstance(record) : undefined;
}

export function listWorkflowInstancesByWorkspaceProduct(workspaceProductId: string): WorkflowInstance[] {
  return [...workflowInstances.values()]
    .filter((item) => item.workspaceProductId === workspaceProductId)
    .map((item) => cloneWorkflowInstance(item));
}

export function findActiveWorkflowByType(
  workspaceProductId: string,
  workflowType: WorkflowInstance["workflowType"],
): WorkflowInstance | undefined {
  const record = [...workflowInstances.values()].find(
    (item) => item.workspaceProductId === workspaceProductId && item.workflowType === workflowType,
  );
  return record ? cloneWorkflowInstance(record) : undefined;
}

export function clearWorkflowRepository(): void {
  workflowInstances.clear();
}

export function getWorkflowRepositorySize(): number {
  return workflowInstances.size;
}

export function requireWorkflowInstance(workflowId: string): WorkflowInstance {
  const record = getWorkflowInstance(workflowId);
  if (!record) {
    throw new SaasWorkflowRuntimeError(
      WORKFLOW_RUNTIME_ERROR_CODES.WORKFLOW_NOT_FOUND,
      `Workflow not found: ${workflowId}`,
    );
  }
  return record;
}
