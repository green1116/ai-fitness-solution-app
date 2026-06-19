import type { WorkspaceProductInstance } from "../shared/workspace-runtime-types";
import { OPS_RUNTIME_ERROR_CODES, SaasOpsRuntimeError } from "../shared/ops-runtime-errors";
import { updateWorkspaceProductStatus } from "../workspace-runtime/workspace-product-repository";
import { readWorkspaceProductForOps } from "./ops-read-adapter";

function assertLifecycleTransition(
  current: WorkspaceProductInstance["status"],
  allowed: WorkspaceProductInstance["status"][],
  target: WorkspaceProductInstance["status"],
  workspaceProductId: string,
): void {
  if (!allowed.includes(current)) {
    throw new SaasOpsRuntimeError(
      OPS_RUNTIME_ERROR_CODES.OPS_LIFECYCLE_TRANSITION_DENIED,
      `Cannot transition ${workspaceProductId} from ${current} to ${target}`,
    );
  }
}

export function activateProduct(workspaceProductId: string): WorkspaceProductInstance {
  const current = readWorkspaceProductForOps(workspaceProductId);
  assertLifecycleTransition(current.status, ["draft"], "active", workspaceProductId);
  return updateWorkspaceProductStatus(workspaceProductId, "active");
}

export function suspendProduct(workspaceProductId: string): WorkspaceProductInstance {
  const current = readWorkspaceProductForOps(workspaceProductId);
  assertLifecycleTransition(current.status, ["active"], "suspended", workspaceProductId);
  return updateWorkspaceProductStatus(workspaceProductId, "suspended");
}

export function archiveProduct(workspaceProductId: string): WorkspaceProductInstance {
  const current = readWorkspaceProductForOps(workspaceProductId);
  assertLifecycleTransition(current.status, ["draft", "active", "suspended"], "archived", workspaceProductId);
  return updateWorkspaceProductStatus(workspaceProductId, "archived");
}

export function restoreProduct(workspaceProductId: string): WorkspaceProductInstance {
  const current = readWorkspaceProductForOps(workspaceProductId);
  if (current.status === "suspended") {
    return updateWorkspaceProductStatus(workspaceProductId, "active");
  }
  if (current.status === "archived") {
    return updateWorkspaceProductStatus(workspaceProductId, "draft");
  }
  throw new SaasOpsRuntimeError(
    OPS_RUNTIME_ERROR_CODES.OPS_LIFECYCLE_TRANSITION_DENIED,
    `Cannot restore ${workspaceProductId} from ${current.status}`,
  );
}
