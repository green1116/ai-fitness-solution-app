import type { PAYMENT_READINESS_VERSION } from "../shared/types";

export const PAYMENT_READINESS_DASHBOARD_RUNTIME_VERSION =
  "v10.1-payment-readiness-dashboard-runtime-1" as const;

export type ReadinessLevel = "not-started" | "in-progress" | "contract-ready" | "integration-ready";

export interface ReadinessDimension {
  dimensionId: string;
  label: string;
  level: ReadinessLevel;
  score: number;
  blockers: string[];
  nextSteps: string[];
}

export interface PaymentReadinessDashboardPayload {
  version: typeof PAYMENT_READINESS_DASHBOARD_RUNTIME_VERSION;
  readinessVersion: typeof PAYMENT_READINESS_VERSION;
  dimensions: ReadinessDimension[];
  overallScore: number;
  overallLevel: ReadinessLevel;
  summary: string;
}
