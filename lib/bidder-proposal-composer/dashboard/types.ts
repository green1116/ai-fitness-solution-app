import type { BIDDER_PROPOSAL_COMPOSER_VERSION } from "../shared/types";

export const BIDDER_PROPOSAL_DASHBOARD_RUNTIME_VERSION = "v19.4-bidder-proposal-dashboard-1" as const;

export interface BidderProposalDashboardMetrics {
  contextReadiness: number;
  executiveReadiness: number;
  technicalReadiness: number;
  budgetReadiness: number;
  differentiationReadiness: number;
  qualityReadiness: number;
  proposalDifferentiationScore: number;
  brandAlignmentScore: number;
  equipmentAlignmentScore: number;
  budgetAlignmentScore: number;
  summary: string;
}

export interface BidderProposalDashboardRuntimePayload {
  version: typeof BIDDER_PROPOSAL_DASHBOARD_RUNTIME_VERSION;
  composerVersion: typeof BIDDER_PROPOSAL_COMPOSER_VERSION;
  metrics: BidderProposalDashboardMetrics;
  proposalDifferentiationScore: number;
  summary: string;
}
