export const APPROVAL_WORKFLOW_STATES = ["pending", "reviewing", "approved"] as const;
export type ApprovalWorkflowState = (typeof APPROVAL_WORKFLOW_STATES)[number];

export const APPROVAL_WORKFLOW_TRANSITIONS: Record<ApprovalWorkflowState, ApprovalWorkflowState[]> = {
  pending: ["reviewing"],
  reviewing: ["approved"],
  approved: [],
};

export const DELIVERY_WORKFLOW_STATES = ["planned", "in_progress", "completed"] as const;
export type DeliveryWorkflowState = (typeof DELIVERY_WORKFLOW_STATES)[number];

export const DELIVERY_WORKFLOW_TRANSITIONS: Record<DeliveryWorkflowState, DeliveryWorkflowState[]> = {
  planned: ["in_progress"],
  in_progress: ["completed"],
  completed: [],
};

export const RELEASE_WORKFLOW_STATES = ["draft", "ready", "released"] as const;
export type ReleaseWorkflowState = (typeof RELEASE_WORKFLOW_STATES)[number];

export const RELEASE_WORKFLOW_TRANSITIONS: Record<ReleaseWorkflowState, ReleaseWorkflowState[]> = {
  draft: ["ready"],
  ready: ["released"],
  released: [],
};
