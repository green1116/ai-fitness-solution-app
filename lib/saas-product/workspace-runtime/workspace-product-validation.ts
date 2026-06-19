import type { ProductContext } from "../shared/context-types";
import {
  validateProductContextCompatibility,
  validateProductContextShape,
  validateResolvedProductContext,
} from "../validation/validate-saas-product-p2";
import {
  WORKSPACE_PRODUCT_INSTANCE_STATUSES,
  type WorkspaceProductInstance,
  type WorkspaceProductInstanceStatus,
} from "../shared/workspace-runtime-types";
import { WORKSPACE_RUNTIME_ERROR_CODES, SaasWorkspaceProductError } from "../shared/workspace-runtime-errors";
import { resolveProduct } from "../registry/product-registry";
import { validateV47CustomerWorkspaceMapping } from "./workspace-product-mapper";

export function assertValidProductContextForWorkspace(context: ProductContext): void {
  if (!validateProductContextShape(context)) {
    throw new SaasWorkspaceProductError(
      WORKSPACE_RUNTIME_ERROR_CODES.WORKSPACE_PRODUCT_CONTEXT_INVALID,
      "Invalid ProductContext shape for workspace product",
    );
  }
  if (!validateProductContextCompatibility(context)) {
    throw new SaasWorkspaceProductError(
      WORKSPACE_RUNTIME_ERROR_CODES.WORKSPACE_PRODUCT_CONTEXT_INVALID,
      "ProductContext is not compatible with workspace product runtime",
    );
  }
  if (!validateResolvedProductContext(context, context.productCode)) {
    throw new SaasWorkspaceProductError(
      WORKSPACE_RUNTIME_ERROR_CODES.WORKSPACE_PRODUCT_CONTEXT_INVALID,
      "ProductContext failed resolved validation",
    );
  }
  resolveProduct(context.productCode);
}

export function validateWorkspaceProductInstance(instance: WorkspaceProductInstance): boolean {
  if (!instance.workspaceProductId?.trim()) return false;
  if (!instance.tenantId?.trim() || !instance.workspaceId?.trim()) return false;
  if (!WORKSPACE_PRODUCT_INSTANCE_STATUSES.includes(instance.status)) return false;
  if (instance.productCode !== instance.productDefinition.productCode) return false;
  if (instance.productContextSnapshot.tenantId !== instance.tenantId) return false;
  if (instance.productContextSnapshot.workspaceId !== instance.workspaceId) return false;
  if (!validateV47CustomerWorkspaceMapping(instance.v47CustomerWorkspaceMapping)) return false;
  return validateProductContextShape(instance.productContextSnapshot);
}

export function assertValidWorkspaceProductStatus(status: WorkspaceProductInstanceStatus): void {
  if (!WORKSPACE_PRODUCT_INSTANCE_STATUSES.includes(status)) {
    throw new SaasWorkspaceProductError(
      WORKSPACE_RUNTIME_ERROR_CODES.WORKSPACE_PRODUCT_STATUS_INVALID,
      `Invalid workspace product status: ${status}`,
    );
  }
}
