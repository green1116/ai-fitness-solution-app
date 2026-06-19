import type { ApprovalAction, ApprovalPolicyCheck, ApprovalStatus } from "./approval-types";

const STATUS_ACTIONS: Record<ApprovalStatus, ApprovalAction[]> = {
  draft: ["submit"],
  review: ["approve", "reject"],
  approved: ["deliver"],
  rejected: [],
  delivered: [],
};

const ACTION_PERMISSIONS: Record<ApprovalAction, string[]> = {
  submit: ["edit-quote", "edit-project"],
  approve: ["view", "approve", "reject"],
  reject: ["view", "approve", "reject"],
  deliver: ["generate-package", "generate-delivery", "download"],
};

export function getAllowedActions(status: ApprovalStatus): ApprovalAction[] {
  return STATUS_ACTIONS[status];
}

export function canTransition(
  status: ApprovalStatus,
  action: ApprovalAction,
): ApprovalPolicyCheck {
  const allowed = STATUS_ACTIONS[status].includes(action);
  return {
    allowed,
    reasons: allowed ? [] : [`action ${action} not allowed in status ${status}`],
  };
}

export function assertPolicy(status: ApprovalStatus, action: ApprovalAction): void {
  const check = canTransition(status, action);
  if (!check.allowed) {
    throw new Error(check.reasons.join("; "));
  }
}

export function getStatusCapabilities(status: ApprovalStatus): string[] {
  switch (status) {
    case "draft":
      return ["edit", "modify-quote", "modify-project"];
    case "review":
      return ["view", "approve", "reject"];
    case "approved":
      return ["generate-package", "generate-delivery", "download"];
    case "delivered":
      return ["view", "download", "history"];
    case "rejected":
      return ["view", "history"];
  }
}

export function validateApprovalPolicyMatrix(): boolean {
  return (
    getAllowedActions("draft").includes("submit") &&
    getAllowedActions("review").includes("approve") &&
    getAllowedActions("review").includes("reject") &&
    getAllowedActions("approved").includes("deliver") &&
    getAllowedActions("delivered").length === 0 &&
    ACTION_PERMISSIONS.deliver.includes("generate-package")
  );
}
