import { buildOwnerContext } from "@/lib/saas-rbac";
import { resolveProductContext } from "../context/resolve-product-context";
import {
  clearWorkspaceProductRepository,
  createProductWorkspace,
  getWorkspaceProductRepositorySize,
  listWorkspaceProducts,
  mapSaasWorkspaceToV47CustomerWorkspace,
  resolveWorkspaceProduct,
  validateWorkspaceProductInstance,
} from "../workspace-runtime/workspace-product-runtime";

export interface SaasProductP3ValidationResult {
  valid: boolean;
  summary: string;
}

export function validateSaasProductP3Runtime(): SaasProductP3ValidationResult {
  clearWorkspaceProductRepository();
  const context = resolveProductContext(buildOwnerContext(), "kickstart-package");
  const created = createProductWorkspace({ context, status: "active" });
  const resolved = resolveWorkspaceProduct(created.workspaceProductId);
  const listed = listWorkspaceProducts(context.tenantId);
  const v47Workspace = mapSaasWorkspaceToV47CustomerWorkspace(resolved);

  const valid =
    validateWorkspaceProductInstance(resolved) &&
    listed.length === 1 &&
    getWorkspaceProductRepositorySize() === 1 &&
    v47Workspace.workspaceId === resolved.v47CustomerWorkspaceMapping.v47WorkspaceId &&
    v47Workspace.customerId === resolved.tenantId;

  clearWorkspaceProductRepository();

  return {
    valid,
    summary: `workspaceRuntimeValid=${valid}`,
  };
}
