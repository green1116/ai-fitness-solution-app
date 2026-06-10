import type { AUTOPILOT_VERSION } from "../shared/types";

export const AUTOPILOT_DASHBOARD_RUNTIME_VERSION = "v13.5-autopilot-dashboard-1" as const;

export interface AutopilotDashboardRuntimePayload {
  version: typeof AUTOPILOT_DASHBOARD_RUNTIME_VERSION;
  autopilotVersion: typeof AUTOPILOT_VERSION;
  completionRate: number;
  successRate: number;
  retryRate: number;
  reviewRate: number;
  deliveryReadiness: number;
  summary: string;
}
