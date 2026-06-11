import type { PROPOSAL_DIFFERENTIATION_VERSION } from "../shared/types";

export const DIFFERENTIATION_DASHBOARD_RUNTIME_VERSION = "v19.2-differentiation-dashboard-1" as const;

export interface DifferentiationDashboardRuntimePayload {
  version: typeof DIFFERENTIATION_DASHBOARD_RUNTIME_VERSION;
  differentiationVersion: typeof PROPOSAL_DIFFERENTIATION_VERSION;
  brandDifferentiation: number;
  budgetDifferentiation: number;
  equipmentDifferentiation: number;
  proposalDifferentiation: number;
  differentiationScore: number;
  variantScores: Array<{ bidderBrand: string; proposalLabel: string; score: number }>;
  summary: string;
}
