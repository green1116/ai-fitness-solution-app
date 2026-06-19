import type { NavigationItem } from "@/lib/saas-portal/shared/portal-types";

export interface PortalMeData {
  tenantId: string;
  userId: string;
}

export interface PortalUser {
  userId: string;
  email?: string;
}

export interface PortalTenant {
  tenantId: string;
}

export interface PortalMembership {
  id: string;
  userId: string;
  tenantId: string;
  organizationId?: string;
  workspaceId?: string;
  roleSystemCode?: string;
  portalType?: string;
}

export type PortalSessionSource = "cookie" | "headers" | "none";

export interface PortalSessionState {
  user: PortalUser | null;
  tenant: PortalTenant | null;
  role?: string;
  membership?: PortalMembership | null;
  sessionSource?: PortalSessionSource;
  portalDisplayName?: string;
  loading: boolean;
  error: string | null;
}

export interface PortalSessionSnapshot extends PortalSessionState {
  user: PortalUser;
  tenant: PortalTenant;
  membership: PortalMembership;
  sessionSource: PortalSessionSource;
  navigation: NavigationItem[];
}

export interface SaasProductApiSuccessBody<T> {
  ok: true;
  data: T;
}

export interface SaasProductApiErrorBody {
  ok: false;
  code?: string;
  message?: string;
}

export type SaasProductApiResponseBody<T> = SaasProductApiSuccessBody<T> | SaasProductApiErrorBody;

export interface PortalKpiSnapshot {
  workspaces: number;
  quotes: number;
  workflows: number;
}

export interface PortalP1Validation {
  valid: boolean;
  summary: string;
}

export interface PortalSessionValidation {
  valid: boolean;
  summary: string;
  userId?: string;
  tenantId?: string;
  role?: string;
  membershipId?: string;
}
