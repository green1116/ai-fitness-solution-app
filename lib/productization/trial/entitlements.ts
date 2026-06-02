import type { TrialEntitlement } from "./types";

export function buildTrialEntitlements(input?: { deploymentId?: string }): TrialEntitlement {
  const deploymentId = input?.deploymentId ?? "trial-workspace-default";
  return {
    entitlementId: `trial-entitlements-${deploymentId}`,
    planGenerationLimit: 20,
    budgetGenerationLimit: 12,
    proposalPdfLimit: 10,
    tenderPackageLimit: 6,
    workspaceLimit: 1,
    userLimit: 5,
  };
}
