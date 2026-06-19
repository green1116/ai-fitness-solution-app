import type { TenantContext } from "@/lib/saas-runtime/tenant-context/context-types";
import type { PortalType } from "@/lib/saas-portal/shared/portal-types";
import { CONTEXT_ERROR_CODES, SaasProductContextError } from "../shared/context-errors";
import type { TenantProductContext } from "../shared/context-types";

export function bindTenantContext(ctx: TenantContext): TenantProductContext {
  if (!ctx.userId?.trim() || !ctx.tenantId?.trim()) {
    throw new SaasProductContextError(
      CONTEXT_ERROR_CODES.PRODUCT_CONTEXT_TENANT_INVALID,
      "Tenant context requires userId and tenantId",
    );
  }

  if (!ctx.portalType) {
    throw new SaasProductContextError(
      CONTEXT_ERROR_CODES.PRODUCT_CONTEXT_INVALID,
      "Tenant context requires portalType",
    );
  }

  return {
    userId: ctx.userId,
    tenantId: ctx.tenantId,
    organizationId: ctx.organizationId,
    portalType: ctx.portalType as PortalType,
    roleSystemCode: ctx.roleSystemCode,
    membershipId: ctx.membershipId,
  };
}
