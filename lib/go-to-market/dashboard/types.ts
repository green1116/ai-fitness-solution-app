import type { GO_TO_MARKET_VERSION } from "../shared/types";

export const GTM_DASHBOARD_RUNTIME_VERSION = "v17.0-gtm-dashboard-1" as const;

export interface GtmDashboardRuntimePayload {
  version: typeof GTM_DASHBOARD_RUNTIME_VERSION;
  gtmVersion: typeof GO_TO_MARKET_VERSION;
  goToMarketReadiness: number;
  marketActivation: number;
  leadMomentum: number;
  conversionMomentum: number;
  summary: string;
}
