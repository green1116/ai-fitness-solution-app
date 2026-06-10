import type { COMMERCIAL_DELIVERY_VERSION } from "../shared/types";

export const COMMERCIAL_DASHBOARD_RUNTIME_VERSION = "v14.0-commercial-dashboard-1" as const;

export interface CommercialDashboardRuntimePayload {
  version: typeof COMMERCIAL_DASHBOARD_RUNTIME_VERSION;
  deliveryVersion: typeof COMMERCIAL_DELIVERY_VERSION;
  activeProjects: number;
  completedProjects: number;
  deliveries: number;
  downloads: number;
  approvals: number;
  summary: string;
}
