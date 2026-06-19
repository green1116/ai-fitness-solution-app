import type { SaasPortalType } from "@/lib/saas-foundation/shared/types";

export interface SessionUser {
  userId: string;
  email: string;
}

export interface TenantContext {
  userId: string;
  tenantId: string;
  organizationId?: string;
  workspaceId?: string;
  portalType: SaasPortalType;
  roleSystemCode?: string;
  membershipId?: string;
}

export interface MembershipContextRecord {
  id: string;
  userId: string;
  tenantId: string;
  organizationId: string;
  workspaceId: string;
  roleSystemCode: string;
  portalType: SaasPortalType;
}

export interface ResolveTenantContextOptions {
  session?: SessionUser;
}
