/**
 * Operations O1 — Health types
 */

import type { HEALTH_BANDS } from "../success/success.constants";

export type HealthBand = (typeof HEALTH_BANDS)[number];
export type HealthMetadata = Record<string, unknown>;

export type HealthMetrics = {
  id: string;
  customerId: string;
  adoptionScore: number;
  engagementScore: number;
  supportLoad: number;
  detail: string;
  metadata: HealthMetadata;
  recordedAt: string;
};

export type RecordHealthMetricsInput = {
  id?: string;
  customerId: string;
  adoptionScore: number;
  engagementScore: number;
  supportLoad: number;
  metadata?: HealthMetadata;
};

export type HealthScore = {
  id: string;
  customerId: string;
  metricsId: string;
  score: number;
  band: HealthBand;
  detail: string;
  scoredAt: string;
};

export type ScoreCustomerHealthInput = {
  id?: string;
  customerId: string;
  metricsId?: string;
};
