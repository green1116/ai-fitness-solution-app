import type { REVENUE_OPERATIONS_VERSION } from "../shared/types";

export const CONVERSION_RUNTIME_VERSION = "v15.0-conversion-runtime-1" as const;

export interface ConversionMetric {
  metricId: string;
  category: "lead" | "trial" | "customer";
  rate: number;
  numerator: number;
  denominator: number;
  trend: "up" | "stable" | "down";
}

export interface ConversionRuntimePayload {
  version: typeof CONVERSION_RUNTIME_VERSION;
  revOpsVersion: typeof REVENUE_OPERATIONS_VERSION;
  metrics: ConversionMetric[];
  overallConversionRate: number;
  summary: string;
}
