import type { WorkflowInstance } from "../shared/workflow-runtime-types";
import type { WorkspaceProductInstance } from "../shared/workspace-runtime-types";
import { listWorkflowInstances } from "../workflow-runtime/quote-workflow-runtime";
import { resolveWorkspaceProduct, listWorkspaceProducts } from "../workspace-runtime/workspace-product-runtime";
import { getWorkspaceProduct } from "../workspace-runtime/workspace-product-repository";

export function readWorkspaceProductForOps(workspaceProductId: string): WorkspaceProductInstance {
  return resolveWorkspaceProduct(workspaceProductId);
}

export function readWorkflowsForOps(workspaceProductId: string): WorkflowInstance[] {
  return listWorkflowInstances(workspaceProductId);
}

export function readWorkspaceProductsForOps(tenantId: string, workspaceId: string): WorkspaceProductInstance[] {
  return listWorkspaceProducts(tenantId).filter((item) => item.workspaceId === workspaceId);
}

export function workspaceProductExists(workspaceProductId: string): boolean {
  return Boolean(getWorkspaceProduct(workspaceProductId));
}
