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

export interface PortalSessionState {
  user: PortalUser | null;
  tenant: PortalTenant | null;
  role?: string;
  portalDisplayName?: string;
  loading: boolean;
  error: string | null;
}

export interface PortalSessionSnapshot extends PortalSessionState {
  user: PortalUser;
  tenant: PortalTenant;
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
