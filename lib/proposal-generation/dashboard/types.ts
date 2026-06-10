import type { PROPOSAL_GENERATION_VERSION } from "../shared/types";

export const PROPOSAL_DASHBOARD_RUNTIME_VERSION = "v11.0-proposal-dashboard-runtime-1" as const;

export interface ProposalDashboardRuntimePayload {
  version: typeof PROPOSAL_DASHBOARD_RUNTIME_VERSION;
  proposalVersion: typeof PROPOSAL_GENERATION_VERSION;
  proposalCompleteness: number;
  proposalReadiness: "not-ready" | "in-progress" | "contract-ready" | "generation-ready";
  complianceCoverage: number;
  riskCoverage: number;
  deliveryReadiness: number;
  sectionCount: number;
  summary: string;
}
