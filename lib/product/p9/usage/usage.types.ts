/**
 * Product P9 — Usage types
 */

import type { USAGE_TRENDS } from "../customer-health/health.constants";

export type UsageTrend = (typeof USAGE_TRENDS)[number];
export type UsageMetadata = Record<string, unknown>;

export type UsageSnapshot = {
  id: string;
  healthId: string;
  activeUsers: number;
  sessions: number;
  trend: UsageTrend;
  detail: string;
  metadata: UsageMetadata;
  capturedAt: string;
};

export type CreateUsageInput = {
  id?: string;
  healthId: string;
  activeUsers: number;
  sessions: number;
  trend: UsageTrend;
  metadata?: UsageMetadata;
};
