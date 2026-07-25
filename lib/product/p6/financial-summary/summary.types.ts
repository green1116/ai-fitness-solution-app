/**
 * Product P6 — Financial summary types
 */

export type FinancialSummaryMetadata = Record<string, unknown>;

export type FinancialSummary = {
  id: string;
  budgetId: string;
  totalInvestment: number;
  totalAnnualCost: number;
  projectedReturn: number;
  netValue: number;
  narrative: string;
  detail: string;
  metadata: FinancialSummaryMetadata;
  createdAt: string;
};

export type CreateFinancialSummaryInput = {
  id?: string;
  budgetId: string;
  totalInvestment: number;
  totalAnnualCost: number;
  projectedReturn: number;
  narrative?: string;
  metadata?: FinancialSummaryMetadata;
};
