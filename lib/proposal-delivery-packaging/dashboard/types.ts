import type { PROPOSAL_DELIVERY_PACKAGING_VERSION } from "../shared/types";

export const PROPOSAL_PACKAGING_DASHBOARD_RUNTIME_VERSION = "v19.5-proposal-packaging-dashboard-1" as const;

export interface ProposalPackagingDashboardMetrics {
  budgetReadiness: number;
  lifecycleReadiness: number;
  maintenanceReadiness: number;
  roiReadiness: number;
  tcoReadiness: number;
  deliveryReadiness: number;
  budgetAlignmentScore: number;
  summary: string;
}

export interface ProposalPackagingDashboardRuntimePayload {
  version: typeof PROPOSAL_PACKAGING_DASHBOARD_RUNTIME_VERSION;
  packagingVersion: typeof PROPOSAL_DELIVERY_PACKAGING_VERSION;
  metrics: ProposalPackagingDashboardMetrics;
  budgetAlignmentScore: number;
  deliveryReadinessScore: number;
  summary: string;
}
