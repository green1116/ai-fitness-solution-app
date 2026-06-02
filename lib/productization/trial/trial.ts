import { buildTrialEntitlements } from "./entitlements";
import { buildTrialUsage } from "./usage";
import { buildTrialWorkspace } from "./workspace";
import type { TrialSummary, TrialWorkspaceResponse } from "./types";
import { TRIAL_WORKSPACE_VERSION } from "./types";

function computeUtilizationRate(input: {
  used: number;
  limit: number;
}): number {
  if (input.limit === 0) return 0;
  return Math.round((input.used / input.limit) * 1000) / 10;
}

export function buildTrialSummary(input?: { deploymentId?: string }): TrialSummary {
  const deploymentId = input?.deploymentId ?? "trial-workspace-default";
  const workspace = buildTrialWorkspace({ deploymentId });
  const entitlements = buildTrialEntitlements({ deploymentId });
  const usage = buildTrialUsage({ deploymentId });

  const usedCore =
    usage.plansGenerated +
    usage.budgetsGenerated +
    usage.pdfExports +
    usage.tenderExports;
  const limitCore =
    entitlements.planGenerationLimit +
    entitlements.budgetGenerationLimit +
    entitlements.proposalPdfLimit +
    entitlements.tenderPackageLimit;
  const utilizationRate = computeUtilizationRate({ used: usedCore, limit: limitCore });
  const remainingCoreQuota =
    usage.remainingQuota.plans +
    usage.remainingQuota.budgets +
    usage.remainingQuota.pdf +
    usage.remainingQuota.tenders;

  return {
    summaryId: `trial-summary-${deploymentId}`,
    version: TRIAL_WORKSPACE_VERSION,
    workspaceId: workspace.workspaceId,
    status: workspace.status,
    utilizationRate,
    remainingCoreQuota,
    summary: `trial-summary workspace=${workspace.workspaceId} status=${workspace.status} utilization=${utilizationRate}% remainingCore=${remainingCoreQuota}`,
  };
}

export function buildTrialWorkspaceResponse(input?: {
  deploymentId?: string;
}): TrialWorkspaceResponse {
  const deploymentId = input?.deploymentId ?? "trial-workspace-default";
  return {
    version: TRIAL_WORKSPACE_VERSION,
    workspace: buildTrialWorkspace({ deploymentId }),
    entitlements: buildTrialEntitlements({ deploymentId }),
    usage: buildTrialUsage({ deploymentId }),
    summary: buildTrialSummary({ deploymentId }),
  };
}

export function validateTrialWorkspace(input?: { deploymentId?: string }): {
  workspaceValid: boolean;
  entitlementValid: boolean;
  usageValid: boolean;
  summaryValid: boolean;
} {
  const deploymentId = input?.deploymentId ?? "trial-workspace-default";
  const response = buildTrialWorkspaceResponse({ deploymentId });
  const { workspace, entitlements, usage, summary } = response;

  const workspaceValid =
    workspace.workspaceId.length > 0 &&
    workspace.organization.length > 0 &&
    workspace.owner.length > 0 &&
    workspace.createdAt.length > 0 &&
    workspace.expiresAt.length > 0;

  const entitlementValid =
    entitlements.planGenerationLimit > 0 &&
    entitlements.budgetGenerationLimit > 0 &&
    entitlements.proposalPdfLimit > 0 &&
    entitlements.tenderPackageLimit > 0 &&
    entitlements.workspaceLimit > 0 &&
    entitlements.userLimit > 0;

  const usageValid =
    usage.plansGenerated >= 0 &&
    usage.budgetsGenerated >= 0 &&
    usage.pdfExports >= 0 &&
    usage.tenderExports >= 0 &&
    usage.activeUsers >= 0 &&
    usage.remainingQuota.plans >= 0 &&
    usage.remainingQuota.budgets >= 0 &&
    usage.remainingQuota.pdf >= 0 &&
    usage.remainingQuota.tenders >= 0 &&
    usage.remainingQuota.users >= 0;

  const summaryValid =
    summary.summaryId.length > 0 &&
    summary.workspaceId === workspace.workspaceId &&
    summary.utilizationRate >= 0 &&
    summary.remainingCoreQuota >= 0 &&
    summary.summary.length > 0;

  return {
    workspaceValid,
    entitlementValid,
    usageValid,
    summaryValid,
  };
}
