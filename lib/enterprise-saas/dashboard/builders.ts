import { buildSeatAllocation } from "../seat/builders";
import { buildTenant } from "../tenant/builders";
import { buildUsageMetrics } from "../usage/builders";
import { buildUserProfiles } from "../user/builders";
import { buildWorkspace, buildWorkspaceSummary } from "../workspace/builders";
import type {
  EnterpriseDashboardRuntimePayload,
  EnterpriseDashboardSeatSummary,
  EnterpriseDashboardTenantSummary,
  EnterpriseDashboardUsageSummary,
  EnterpriseDashboardUserSummary,
  EnterpriseDashboardWorkspaceSummary,
} from "./types";

export function buildEnterpriseDashboardTenantSummary(input?: {
  deploymentId?: string;
}): EnterpriseDashboardTenantSummary {
  const deploymentId = input?.deploymentId ?? "dashboard-default";
  const tenant = buildTenant({ deploymentId });
  return {
    tenantId: tenant.tenantId,
    name: tenant.name,
    tier: tenant.tier,
    status: tenant.status,
  };
}

export function buildEnterpriseDashboardWorkspaceSummary(input?: {
  deploymentId?: string;
}): EnterpriseDashboardWorkspaceSummary {
  const deploymentId = input?.deploymentId ?? "dashboard-default";
  const workspace = buildWorkspace({ deploymentId });
  const summary = buildWorkspaceSummary({ deploymentId, workspace });
  return {
    workspaceId: workspace.workspaceId,
    name: workspace.name,
    projectCount: summary.projectCount,
    activeMembers: summary.activeMembers,
  };
}

export function buildEnterpriseDashboardUserSummary(input?: {
  deploymentId?: string;
}): EnterpriseDashboardUserSummary {
  const deploymentId = input?.deploymentId ?? "dashboard-default";
  const profiles = buildUserProfiles({ deploymentId });
  return {
    totalUsers: profiles.length,
    activeUsers: profiles.filter((p) => p.status === "active").length,
    invitedUsers: profiles.filter((p) => p.status === "invited").length,
  };
}

export function buildEnterpriseDashboardSeatSummary(input?: {
  deploymentId?: string;
}): EnterpriseDashboardSeatSummary {
  const deploymentId = input?.deploymentId ?? "dashboard-default";
  const allocation = buildSeatAllocation({ deploymentId });
  return {
    licensedSeats: allocation.licensedSeats,
    activeSeats: allocation.activeSeats,
    availableSeats: allocation.availableSeats,
    utilizationRate: allocation.utilizationRate,
  };
}

export function buildEnterpriseDashboardUsageSummary(input?: {
  deploymentId?: string;
}): EnterpriseDashboardUsageSummary {
  const deploymentId = input?.deploymentId ?? "dashboard-default";
  const metrics = buildUsageMetrics({ deploymentId });
  return {
    projects: metrics.projects,
    plans: metrics.plans,
    budgets: metrics.budgets,
    zipExports: metrics.zipExports,
    tenderUploads: metrics.tenderUploads,
  };
}

export function buildEnterpriseDashboardPayload(input?: {
  deploymentId?: string;
}): Omit<EnterpriseDashboardRuntimePayload, "version" | "saasVersion" | "summary"> & {
  summary: string;
} {
  const deploymentId = input?.deploymentId ?? "dashboard-default";
  const tenantSummary = buildEnterpriseDashboardTenantSummary({ deploymentId });
  const workspaceSummary = buildEnterpriseDashboardWorkspaceSummary({ deploymentId });
  const userSummary = buildEnterpriseDashboardUserSummary({ deploymentId });
  const seatSummary = buildEnterpriseDashboardSeatSummary({ deploymentId });
  const usageSummary = buildEnterpriseDashboardUsageSummary({ deploymentId });

  return {
    tenantSummary,
    workspaceSummary,
    userSummary,
    seatSummary,
    usageSummary,
    summary: `enterprise-dashboard tenant=${tenantSummary.tenantId} users=${userSummary.totalUsers} seats=${seatSummary.activeSeats}/${seatSummary.licensedSeats} plans=${usageSummary.plans}`,
  };
}
