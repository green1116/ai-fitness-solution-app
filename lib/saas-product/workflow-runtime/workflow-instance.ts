import type { WorkflowHistoryEntry, WorkflowInstance, WorkflowType } from "../shared/workflow-runtime-types";

export function generateWorkflowId(): string {
  return `wf-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function buildWorkflowInstance(input: {
  workspaceProductId: string;
  workflowType: WorkflowType;
  currentState: string;
  actor: string;
  metadata?: Record<string, string | undefined>;
}): WorkflowInstance {
  const now = new Date().toISOString();
  return {
    workflowId: generateWorkflowId(),
    workspaceProductId: input.workspaceProductId,
    workflowType: input.workflowType,
    currentState: input.currentState,
    history: [],
    createdAt: now,
    updatedAt: now,
    metadata: { createdBy: input.actor, ...input.metadata },
  };
}

export function cloneWorkflowInstance(instance: WorkflowInstance): WorkflowInstance {
  return {
    ...instance,
    history: instance.history.map((entry) => ({ ...entry })),
    metadata: { ...instance.metadata },
  };
}

export function appendWorkflowHistory(
  instance: WorkflowInstance,
  entry: WorkflowHistoryEntry,
): WorkflowInstance {
  return {
    ...cloneWorkflowInstance(instance),
    currentState: entry.toState,
    history: [...instance.history, entry],
    updatedAt: entry.timestamp,
  };
}
