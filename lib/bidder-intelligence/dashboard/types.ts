import { BIDDER_INTELLIGENCE_VERSION } from "../shared/types";

export const BIDDER_DASHBOARD_RUNTIME_VERSION = "v19.0-bidder-dashboard-1" as const;

export interface BidderDashboardRuntimePayload {
  version: typeof BIDDER_DASHBOARD_RUNTIME_VERSION;
  bidderIntelligenceVersion: typeof BIDDER_INTELLIGENCE_VERSION;
  bidderReadiness: number;
  brandReadiness: number;
  catalogReadiness: number;
  proposalDifferentiationReadiness: number;
  summary: string;
}
