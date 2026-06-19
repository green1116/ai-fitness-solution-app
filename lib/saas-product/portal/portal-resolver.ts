import type {
  PortalContext,
  ResolvePortalContextInput,
} from "../shared/portal-runtime-types";
import { SAAS_PRODUCT_P6_TAG } from "../shared/portal-runtime-types";
import { PORTAL_RUNTIME_ERROR_CODES, SaasPortalRuntimeError } from "../shared/portal-runtime-errors";
import {
  readAllWorkflowsForPortal,
  readProductContextForPortal,
  readWorkspaceProductForPortal,
  readWorkspaceProductsForPortal,
  readWorkflowsForWorkspaceProduct,
} from "./portal-adapter";

export function resolvePortalContext(input: ResolvePortalContextInput): PortalContext {
  const { tenantContext, productCode, workspaceProductId } = input;
  const workspaceId = tenantContext.workspaceId?.trim();

  if (!tenantContext.tenantId?.trim() || !tenantContext.userId?.trim()) {
    throw new SaasPortalRuntimeError(
      PORTAL_RUNTIME_ERROR_CODES.PORTAL_CONTEXT_INVALID,
      "tenantId and userId are required for portal context",
    );
  }

  if (!workspaceId) {
    throw new SaasPortalRuntimeError(
      PORTAL_RUNTIME_ERROR_CODES.PORTAL_WORKSPACE_REQUIRED,
      "workspaceId is required for portal context",
    );
  }

  let workspaceProducts = readWorkspaceProductsForPortal(tenantContext.tenantId, workspaceId);
  let workflows = readAllWorkflowsForPortal(workspaceProducts);
  let productContext = productCode
    ? readProductContextForPortal(tenantContext, productCode)
    : undefined;

  if (workspaceProductId) {
    const focused = readWorkspaceProductForPortal(workspaceProductId);
    if (focused.tenantId !== tenantContext.tenantId || focused.workspaceId !== workspaceId) {
      throw new SaasPortalRuntimeError(
        PORTAL_RUNTIME_ERROR_CODES.PORTAL_PRODUCT_NOT_FOUND,
        `Workspace product not in portal scope: ${workspaceProductId}`,
      );
    }
    workspaceProducts = [focused];
    workflows = readWorkflowsForWorkspaceProduct(workspaceProductId);
    productContext = productContext ?? focused.productContextSnapshot;
  } else if (productCode) {
    workspaceProducts = workspaceProducts.filter((item) => item.productCode === productCode);
    workflows = readAllWorkflowsForPortal(workspaceProducts);
  }

  return {
    tenantId: tenantContext.tenantId,
    workspaceId,
    userId: tenantContext.userId,
    portalType: tenantContext.portalType,
    productContext,
    workspaceProducts,
    workflows,
    source: {
      resolver: "resolvePortalContext",
      portalRuntimeVersion: SAAS_PRODUCT_P6_TAG,
      resolvedAt: new Date().toISOString(),
    },
  };
}
