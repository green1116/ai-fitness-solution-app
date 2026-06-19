import type { TenantContext } from "@/lib/saas-runtime/tenant-context/context-types";
import type { PortalMembership } from "../shared/portal-types";

export function buildPortalMembershipFromTenantContext(ctx: TenantContext): PortalMembership {
  return {
    id: ctx.membershipId ?? `${ctx.tenantId}:${ctx.userId}`,
    userId: ctx.userId,
    tenantId: ctx.tenantId,
    organizationId: ctx.organizationId,
    workspaceId: ctx.workspaceId,
    roleSystemCode: ctx.roleSystemCode,
    portalType: ctx.portalType,
  };
}
