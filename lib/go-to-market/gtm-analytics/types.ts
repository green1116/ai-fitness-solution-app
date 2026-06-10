import type { GO_TO_MARKET_VERSION } from "../shared/types";

export const GTM_ANALYTICS_RUNTIME_VERSION = "v17.0-gtm-analytics-1" as const;

export interface GtmAnalyticsSnapshot {
  leadCount: number;
  campaignCount: number;
  outreachCount: number;
  conversionRate: number;
  launchReadiness: number;
  goToMarketHealth: number;
  pipelineHealth: number;
  conversionHealth: number;
  launchHealth: number;
}

export interface GtmAnalyticsRuntimePayload {
  version: typeof GTM_ANALYTICS_RUNTIME_VERSION;
  gtmVersion: typeof GO_TO_MARKET_VERSION;
  snapshot: GtmAnalyticsSnapshot;
  summary: string;
}
