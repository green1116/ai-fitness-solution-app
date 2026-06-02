import { buildTrialEntitlements } from "./entitlements";
import type { TrialUsage } from "./types";

export function buildTrialUsage(input?: {
  deploymentId?: string;
  plansGenerated?: number;
  budgetsGenerated?: number;
  pdfExports?: number;
  tenderExports?: number;
  activeUsers?: number;
}): TrialUsage {
  const deploymentId = input?.deploymentId ?? "trial-workspace-default";
  const entitlements = buildTrialEntitlements({ deploymentId });

  const plansGenerated = input?.plansGenerated ?? 6;
  const budgetsGenerated = input?.budgetsGenerated ?? 4;
  const pdfExports = input?.pdfExports ?? 3;
  const tenderExports = input?.tenderExports ?? 2;
  const activeUsers = input?.activeUsers ?? 3;

  return {
    usageId: `trial-usage-${deploymentId}`,
    plansGenerated,
    budgetsGenerated,
    pdfExports,
    tenderExports,
    activeUsers,
    remainingQuota: {
      plans: Math.max(0, entitlements.planGenerationLimit - plansGenerated),
      budgets: Math.max(0, entitlements.budgetGenerationLimit - budgetsGenerated),
      pdf: Math.max(0, entitlements.proposalPdfLimit - pdfExports),
      tenders: Math.max(0, entitlements.tenderPackageLimit - tenderExports),
      users: Math.max(0, entitlements.userLimit - activeUsers),
    },
  };
}
