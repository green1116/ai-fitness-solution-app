import type { UsageMetrics } from "./types";

function startOfMonth(): string {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
}

export function buildUsageMetrics(input?: { deploymentId?: string }): UsageMetrics {
  const deploymentId = input?.deploymentId ?? "usage-default";
  return {
    metricsId: `usage-metrics-${deploymentId}`,
    tenantId: `tenant-${deploymentId}`,
    workspaceId: `workspace-${deploymentId}`,
    projects: 12,
    plans: 28,
    budgets: 19,
    zipExports: 6,
    tenderUploads: 14,
    periodStart: startOfMonth(),
    periodEnd: new Date().toISOString(),
  };
}
