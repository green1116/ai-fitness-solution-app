/**
 * Product P6 — Investment types
 */

import type { INVESTMENT_CATEGORIES } from "../budget/budget.constants";

export type InvestmentCategory = (typeof INVESTMENT_CATEGORIES)[number];
export type InvestmentMetadata = Record<string, unknown>;

export type Investment = {
  id: string;
  budgetId: string;
  category: InvestmentCategory;
  label: string;
  amount: number;
  detail: string;
  metadata: InvestmentMetadata;
  createdAt: string;
};

export type CreateInvestmentInput = {
  id?: string;
  budgetId: string;
  category: InvestmentCategory;
  label: string;
  amount: number;
  metadata?: InvestmentMetadata;
};
