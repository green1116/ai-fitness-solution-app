/**
 * Product KPI — Target types
 */

import type { TARGET_PERIODS } from "../management/management.constants";

export type TargetPeriod = (typeof TARGET_PERIODS)[number];
export type TargetMetadata = Record<string, unknown>;

export type KpiTarget = {
  id: string;
  kpiId: string;
  period: TargetPeriod;
  value: number;
  detail: string;
  metadata: TargetMetadata;
  setAt: string;
};

export type SetKpiTargetInput = {
  id?: string;
  kpiId: string;
  period: TargetPeriod;
  value: number;
  metadata?: TargetMetadata;
};
