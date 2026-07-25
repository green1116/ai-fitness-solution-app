/**
 * Product P4 — Budget target types
 */

import type { BUDGET_TARGET_STATUSES } from "../questionnaire/questionnaire.constants";

export type BudgetTargetStatus =
  (typeof BUDGET_TARGET_STATUSES)[number];
export type BudgetTargetMetadata = Record<string, unknown>;

export type BudgetTarget = {
  id: string;
  projectRef: string;
  currency: string;
  amount: number;
  status: BudgetTargetStatus;
  detail: string;
  metadata: BudgetTargetMetadata;
  createdAt: string;
  updatedAt: string;
};

export type SetBudgetTargetInput = {
  id?: string;
  projectRef: string;
  currency?: string;
  amount: number;
  metadata?: BudgetTargetMetadata;
};

export type UpdateBudgetTargetStatusInput = {
  budgetId: string;
  status: BudgetTargetStatus;
};
