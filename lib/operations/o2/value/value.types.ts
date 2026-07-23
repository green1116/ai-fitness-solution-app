/**
 * Operations O2 — Value types
 */

import type { VALUE_BANDS } from "../usage/usage.constants";

export type ValueBand = (typeof VALUE_BANDS)[number];
export type ValueMetadata = Record<string, unknown>;

export type ValueMetrics = {
  id: string;
  accountRef: string;
  usageUnits: number;
  adoptionRate: number;
  activityIntensity: number;
  detail: string;
  metadata: ValueMetadata;
  recordedAt: string;
};

export type RecordValueMetricsInput = {
  id?: string;
  accountRef: string;
  usageUnits: number;
  adoptionRate: number;
  activityIntensity: number;
  metadata?: ValueMetadata;
};

export type ValueScore = {
  id: string;
  accountRef: string;
  metricsId: string;
  score: number;
  band: ValueBand;
  detail: string;
  scoredAt: string;
};

export type ScoreAccountValueInput = {
  id?: string;
  accountRef: string;
  metricsId?: string;
};
