import type { PortalType } from "@/lib/saas-portal/shared/portal-types";
import { listWorkspaceProductsForPortal } from "../workspace/workspace-product-catalog";
import { CONTEXT_ERROR_CODES, SaasProductContextError } from "../shared/context-errors";
import type { WorkspaceProductContext } from "../shared/context-types";
import type { ProductCode, WorkspaceProductBinding } from "../shared/product-types";

export interface BindWorkspaceContextInput {
  workspaceId?: string;
  productCode: ProductCode;
  portalType: PortalType;
  v47ProjectId?: string;
  status?: WorkspaceProductBinding["status"];
}

export function bindWorkspaceContext(input: BindWorkspaceContextInput): WorkspaceProductContext {
  const workspaceId = input.workspaceId?.trim();
  if (!workspaceId) {
    throw new SaasProductContextError(
      CONTEXT_ERROR_CODES.PRODUCT_CONTEXT_WORKSPACE_REQUIRED,
      "Workspace context requires workspaceId",
    );
  }

  const catalogProducts = listWorkspaceProductsForPortal(input.portalType);
  if (!catalogProducts.includes(input.productCode)) {
    throw new SaasProductContextError(
      CONTEXT_ERROR_CODES.PRODUCT_CONTEXT_CATALOG_INCOMPATIBLE,
      `Product ${input.productCode} not in workspace catalog for portal ${input.portalType}`,
    );
  }

  const workspaceBinding: WorkspaceProductBinding = {
    saasWorkspaceId: workspaceId,
    productCode: input.productCode,
    v47ProjectId: input.v47ProjectId,
    status: input.status ?? "active",
  };

  return { workspaceId, workspaceBinding };
}
