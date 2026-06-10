import type { ENTERPRISE_SAAS_VERSION } from "../shared/types";

export const ENTERPRISE_DASHBOARD_RUNTIME_VERSION =
  "v10.5-enterprise-dashboard-runtime-1" as const;

export interface EnterpriseDashboardTenantSummary {
  tenantId: string;
  name: string;
  tier: string;
  status: string;
}

export interface EnterpriseDashboardWorkspaceSummary {
  workspaceId: string;
  name: string;
  projectCount: number;
  activeMembers: number;
}

export interface EnterpriseDashboardUserSummary {
  totalUsers: number;
  activeUsers: number;
  invitedUsers: number;
}

export interface EnterpriseDashboardSeatSummary {
  licensedSeats: number;
  activeSeats: number;
  availableSeats: number;
  utilizationRate: number;
}

export interface EnterpriseDashboardUsageSummary {
  projects: number;
  plans: number;
  budgets: number;
  zipExports: number;
  tenderUploads: number;
}

export interface EnterpriseDashboardRuntimePayload {
  version: typeof ENTERPRISE_DASHBOARD_RUNTIME_VERSION;
  saasVersion: typeof ENTERPRISE_SAAS_VERSION;
  tenantSummary: EnterpriseDashboardTenantSummary;
  workspaceSummary: EnterpriseDashboardWorkspaceSummary;
  userSummary: EnterpriseDashboardUserSummary;
  seatSummary: EnterpriseDashboardSeatSummary;
  usageSummary: EnterpriseDashboardUsageSummary;
  summary: string;
}
