import type { TENDER_RESPONSE_PACK_VERSION } from "../shared/types";

export const TENDER_RESPONSE_DASHBOARD_RUNTIME_VERSION = "v19.6-tender-response-dashboard-1" as const;

export interface TenderResponseDashboardMetrics {
  proposalReadiness: number;
  complianceReadiness: number;
  attachmentReadiness: number;
  submissionReadiness: number;
  tenderResponseReadiness: number;
  summary: string;
}

export interface TenderResponseDashboardRuntimePayload {
  version: typeof TENDER_RESPONSE_DASHBOARD_RUNTIME_VERSION;
  packVersion: typeof TENDER_RESPONSE_PACK_VERSION;
  metrics: TenderResponseDashboardMetrics;
  tenderResponseReadiness: number;
  summary: string;
}
