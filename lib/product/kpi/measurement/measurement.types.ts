/**
 * Product KPI — Measurement types
 */

import type { MEASUREMENT_RESULTS } from "../management/management.constants";

export type MeasurementResult = (typeof MEASUREMENT_RESULTS)[number];
export type MeasurementMetadata = Record<string, unknown>;

export type KpiMeasurement = {
  id: string;
  kpiId: string;
  targetId: string;
  actual: number;
  result: MeasurementResult;
  detail: string;
  metadata: MeasurementMetadata;
  measuredAt: string;
};

export type RecordKpiMeasurementInput = {
  id?: string;
  kpiId: string;
  targetId: string;
  actual: number;
  metadata?: MeasurementMetadata;
};
