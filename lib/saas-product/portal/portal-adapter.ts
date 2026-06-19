import type { TenantContext } from "@/lib/saas-runtime/tenant-context/context-types";
import type { ProductContext } from "../shared/context-types";
import type { ProductCode } from "../shared/product-types";
import type { WorkspaceProductInstance } from "../shared/workspace-runtime-types";
import type { WorkflowInstance } from "../shared/workflow-runtime-types";
import { resolveProductContext } from "../context/resolve-product-context";
import { listWorkspaceProducts, resolveWorkspaceProduct } from "../workspace-runtime/workspace-product-runtime";
import { listWorkflowInstances } from "../workflow-runtime/quote-workflow-runtime";

export function readProductContextForPortal(
  tenantContext: TenantContext,
  productCode: ProductCode,
): ProductContext {
  return resolveProductContext(tenantContext, productCode);
}

export function readWorkspaceProductsForPortal(
  tenantId: string,
  workspaceId: string,
): WorkspaceProductInstance[] {
  return listWorkspaceProducts(tenantId).filter((item) => item.workspaceId === workspaceId);
}

export function readWorkspaceProductForPortal(workspaceProductId: string): WorkspaceProductInstance {
  return resolveWorkspaceProduct(workspaceProductId);
}

export function readWorkflowsForWorkspaceProduct(workspaceProductId: string): WorkflowInstance[] {
  return listWorkflowInstances(workspaceProductId);
}

export function readAllWorkflowsForPortal(
  workspaceProducts: WorkspaceProductInstance[],
): WorkflowInstance[] {
  return workspaceProducts.flatMap((item) => listWorkflowInstances(item.workspaceProductId));
}
