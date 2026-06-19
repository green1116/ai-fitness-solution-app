import type { TenantContext } from "@/lib/saas-runtime/tenant-context/context-types";

export interface V47CommercialContext {
  tenantId: string;
  workspaceId: string;
  organizationScopeId: string;
  roleSystemCode: string;
  portalType: TenantContext["portalType"];
  membershipId?: string;
  userId: string;
}

export function mapTenantToV47Context(ctx: TenantContext): V47CommercialContext {
  return {
    tenantId: ctx.tenantId,
    workspaceId: ctx.workspaceId ?? `workspace-${ctx.tenantId}`,
    organizationScopeId: ctx.organizationId ?? `organization-${ctx.tenantId}`,
    roleSystemCode: ctx.roleSystemCode ?? "enterprise_owner",
    portalType: ctx.portalType,
    membershipId: ctx.membershipId,
    userId: ctx.userId,
  };
}
