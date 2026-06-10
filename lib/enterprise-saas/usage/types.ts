import type { ENTERPRISE_SAAS_VERSION } from "../shared/types";

export const USAGE_RUNTIME_VERSION = "v10.5-usage-runtime-1" as const;

export interface UsageMetrics {
  metricsId: string;
  tenantId: string;
  workspaceId: string;
  projects: number;
  plans: number;
  budgets: number;
  zipExports: number;
  tenderUploads: number;
  periodStart: string;
  periodEnd: string;
}

export interface UsageRuntimePayload {
  version: typeof USAGE_RUNTIME_VERSION;
  saasVersion: typeof ENTERPRISE_SAAS_VERSION;
  metrics: UsageMetrics;
  summary: string;
}
