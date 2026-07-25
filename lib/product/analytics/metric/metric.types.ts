/**
 * Product Analytics — Metric types
 */

import type { METRIC_KINDS } from "../foundation/foundation.constants";

export type MetricKind = (typeof METRIC_KINDS)[number];
export type MetricMetadata = Record<string, unknown>;

export type AnalyticsMetric = {
  id: string;
  code: string;
  kind: MetricKind;
  unit: string;
  detail: string;
  metadata: MetricMetadata;
  createdAt: string;
};

export type RegisterMetricInput = {
  id?: string;
  code: string;
  kind: MetricKind;
  unit: string;
  metadata?: MetricMetadata;
};
