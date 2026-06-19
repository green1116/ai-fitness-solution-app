import type { PortalCapabilities } from "../shared/portal-runtime-types";
import type { WorkspaceProductInstance } from "../shared/workspace-runtime-types";
import type { WorkflowType } from "../shared/workflow-runtime-types";
import { checkWorkflowDependency } from "../workflow-runtime/workflow-dependency";
import { findActiveWorkflowByType } from "../workflow-runtime/workflow-repository";
import { getTerminalBusinessWorkflowState } from "../workflow-runtime/multi-workflow-state-machine";

function hasPermission(permissions: string[], candidates: string[]): boolean {
  return candidates.some((permission) => permissions.includes(permission));
}

function canInitiateWorkflow(
  workspaceProductId: string,
  workflowType: WorkflowType,
  terminalState: string,
): boolean {
  const existing = findActiveWorkflowByType(workspaceProductId, workflowType);
  return !existing || existing.currentState === terminalState;
}

export function getPortalCapabilities(workspaceProduct: WorkspaceProductInstance): PortalCapabilities {
  const permissions = workspaceProduct.productContextSnapshot.permissions;
  const workspaceProductId = workspaceProduct.workspaceProductId;
  const reasons: PortalCapabilities["reasons"] = {};

  const activeWorkspace = workspaceProduct.status === "active";

  let canCreateQuote = activeWorkspace;
  if (!activeWorkspace) {
    reasons.canCreateQuote = "workspace product is not active";
  } else if (!hasPermission(permissions, ["quote:create"])) {
    canCreateQuote = false;
    reasons.canCreateQuote = "missing quote:create permission";
  } else if (!canInitiateWorkflow(workspaceProductId, "QUOTE", "released")) {
    canCreateQuote = false;
    reasons.canCreateQuote = "active quote workflow already exists";
  }

  let canApprove = activeWorkspace;
  if (!activeWorkspace) {
    reasons.canApprove = "workspace product is not active";
  } else if (!hasPermission(permissions, ["approval:approve", "approval:submit"])) {
    canApprove = false;
    reasons.canApprove = "missing approval permission";
  } else if (!checkWorkflowDependency(workspaceProductId, "APPROVAL")) {
    canApprove = false;
    reasons.canApprove = "quote must be approved first";
  } else if (!canInitiateWorkflow(workspaceProductId, "APPROVAL", getTerminalBusinessWorkflowState("APPROVAL"))) {
    canApprove = false;
    reasons.canApprove = "active approval workflow already exists";
  }

  let canDeliver = activeWorkspace;
  if (!activeWorkspace) {
    reasons.canDeliver = "workspace product is not active";
  } else if (!hasPermission(permissions, ["delivery:execute"])) {
    canDeliver = false;
    reasons.canDeliver = "missing delivery:execute permission";
  } else if (!checkWorkflowDependency(workspaceProductId, "DELIVERY")) {
    canDeliver = false;
    reasons.canDeliver = "approval must be approved first";
  } else if (!canInitiateWorkflow(workspaceProductId, "DELIVERY", getTerminalBusinessWorkflowState("DELIVERY"))) {
    canDeliver = false;
    reasons.canDeliver = "active delivery workflow already exists";
  }

  let canRelease = activeWorkspace;
  if (!activeWorkspace) {
    reasons.canRelease = "workspace product is not active";
  } else if (!hasPermission(permissions, ["release:publish"])) {
    canRelease = false;
    reasons.canRelease = "missing release:publish permission";
  } else if (!checkWorkflowDependency(workspaceProductId, "RELEASE")) {
    canRelease = false;
    reasons.canRelease = "delivery must be completed first";
  } else if (!canInitiateWorkflow(workspaceProductId, "RELEASE", getTerminalBusinessWorkflowState("RELEASE"))) {
    canRelease = false;
    reasons.canRelease = "active release workflow already exists";
  }

  return {
    canCreateQuote,
    canApprove,
    canDeliver,
    canRelease,
    reasons,
  };
}
