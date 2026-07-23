/**
 * Commercialization P6 — Analytics types
 */

export type AnalyticsSnapshot = {
  id: string;
  accountRef?: string;
  revenueTotal: number;
  growthRate: number;
  churnRiskIndex: number;
  expansionIndex: number;
  insights: string[];
  detail: string;
  analyzedAt: string;
};

export type RunAnalyticsInput = {
  id?: string;
  accountRef?: string;
};

export type AnalyticsCalculation = {
  id: string;
  analyticsId: string;
  formula: string;
  inputs: Record<string, number>;
  result: number;
  detail: string;
  calculatedAt: string;
};

export type CalculateAnalyticsInput = {
  id?: string;
  analyticsId: string;
  formula: "GROWTH" | "CHURN_RISK" | "EXPANSION";
};
