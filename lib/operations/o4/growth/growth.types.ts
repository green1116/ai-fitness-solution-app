/**
 * Operations O4 — Growth types
 */

import type { GROWTH_METRIC_KINDS } from "./growth.constants";

export type GrowthMetricKind = (typeof GROWTH_METRIC_KINDS)[number];
export type GrowthMetadata = Record<string, unknown>;

export type GrowthMetrics = {
  id: string;
  accountRef: string;
  kind: GrowthMetricKind;
  value: number;
  period: string;
  detail: string;
  metadata: GrowthMetadata;
  recordedAt: string;
};

export type RecordGrowthMetricsInput = {
  id?: string;
  accountRef: string;
  kind: GrowthMetricKind;
  value: number;
  period?: string;
  metadata?: GrowthMetadata;
};

export type GrowthTracking = {
  id: string;
  metricsId: string;
  accountRef: string;
  delta: number;
  trend: "UP" | "FLAT" | "DOWN";
  detail: string;
  trackedAt: string;
};

export type TrackGrowthInput = {
  id?: string;
  metricsId: string;
  previousValue?: number;
};
