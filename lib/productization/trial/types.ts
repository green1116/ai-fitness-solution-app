export const TRIAL_WORKSPACE_VERSION = "v8.4-trial-workspace-1" as const;

export type TrialStatus = "active" | "expired" | "suspended";

export interface TrialWorkspace {
  workspaceId: string;
  organization: string;
  owner: string;
  createdAt: string;
  expiresAt: string;
  status: TrialStatus;
}

export interface TrialProfile {
  profileId: string;
  productName: string;
  workspace: TrialWorkspace;
  trialDays: number;
}

export interface TrialEntitlement {
  entitlementId: string;
  planGenerationLimit: number;
  budgetGenerationLimit: number;
  proposalPdfLimit: number;
  tenderPackageLimit: number;
  workspaceLimit: number;
  userLimit: number;
}

export interface TrialUsage {
  usageId: string;
  plansGenerated: number;
  budgetsGenerated: number;
  pdfExports: number;
  tenderExports: number;
  activeUsers: number;
  remainingQuota: {
    plans: number;
    budgets: number;
    pdf: number;
    tenders: number;
    users: number;
  };
}

export interface TrialSummary {
  summaryId: string;
  version: typeof TRIAL_WORKSPACE_VERSION;
  workspaceId: string;
  status: TrialStatus;
  utilizationRate: number;
  remainingCoreQuota: number;
  summary: string;
}

export interface TrialWorkspaceResponse {
  version: typeof TRIAL_WORKSPACE_VERSION;
  workspace: TrialWorkspace;
  entitlements: TrialEntitlement;
  usage: TrialUsage;
  summary: TrialSummary;
}
