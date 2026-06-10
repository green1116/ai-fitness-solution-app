import type { CUSTOMER_SUCCESS_VERSION } from "../shared/types";

export const ADOPTION_RUNTIME_VERSION = "v16.0-adoption-runtime-1" as const;

export interface AdoptionMetric {
  metricId: string;
  category: "feature" | "proposal" | "delivery";
  adoptionRate: number;
  activeUsers: number;
  totalUsers: number;
  trend: "up" | "stable" | "down";
}

export interface AdoptionRuntimePayload {
  version: typeof ADOPTION_RUNTIME_VERSION;
  successVersion: typeof CUSTOMER_SUCCESS_VERSION;
  metrics: AdoptionMetric[];
  overallAdoptionRate: number;
  summary: string;
}
