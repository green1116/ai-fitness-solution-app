import { COMMERCIAL_PLATFORM_FREEZE_VERSION } from "../shared/types";

export const COMMERCIAL_PLATFORM_DASHBOARD_RUNTIME_VERSION =
  "v18.0-commercial-platform-dashboard-1" as const;

export interface CommercialPlatformDashboardRuntimePayload {
  version: typeof COMMERCIAL_PLATFORM_DASHBOARD_RUNTIME_VERSION;
  freezeVersion: typeof COMMERCIAL_PLATFORM_FREEZE_VERSION;
  freezeTag: string;
  platformCompleteness: number;
  platformStability: number;
  platformReadiness: number;
  commercializationReadiness: number;
  layerScores: Array<{
    layer: string;
    completeness: number;
    stability: number;
    readiness: number;
  }>;
  summary: string;
}
