import type {
  V47CustomerWorkspaceMapping,
  V47CustomerWorkspaceSkeleton,
  WorkspaceProductInstance,
} from "../shared/workspace-runtime-types";
import type { ProductContext } from "../shared/context-types";

export function buildV47CustomerWorkspaceMapping(context: ProductContext): V47CustomerWorkspaceMapping {
  return {
    v47WorkspaceId: `v47-ws-${context.tenantId}-${context.workspaceId}`,
    customerId: context.tenantId,
    customerName: context.organizationId ? `org-${context.organizationId}` : undefined,
    sku: context.productCode,
    saasWorkspaceId: context.workspaceId,
    tenantId: context.tenantId,
  };
}

export function mapSaasWorkspaceToV47CustomerWorkspace(
  workspaceProduct: WorkspaceProductInstance,
): V47CustomerWorkspaceSkeleton {
  const mapping = workspaceProduct.v47CustomerWorkspaceMapping;
  const createdAt = Date.parse(workspaceProduct.createdAt);
  const updatedAt = Date.parse(workspaceProduct.updatedAt);
  const now = Date.now();

  return {
    workspaceId: mapping.v47WorkspaceId,
    customerId: mapping.customerId,
    customerName: mapping.customerName ?? "SaaS Workspace Customer",
    projects: [],
    history: [],
    createdAt: Number.isFinite(createdAt) ? createdAt : now,
    updatedAt: Number.isFinite(updatedAt) ? updatedAt : now,
  };
}

export function validateV47CustomerWorkspaceMapping(mapping: V47CustomerWorkspaceMapping): boolean {
  return Boolean(
    mapping.v47WorkspaceId?.trim() &&
      mapping.customerId?.trim() &&
      mapping.saasWorkspaceId?.trim() &&
      mapping.tenantId?.trim() &&
      mapping.sku,
  );
}
