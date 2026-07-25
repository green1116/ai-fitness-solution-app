/**
 * Product P6 — Budget types + readiness / manifest
 */

import type {
  BUDGET_STATUSES,
  P6_MANAGER_STATUSES,
  P6_READINESS_VERDICTS,
  PRODUCT_P6_BUDGET_ROI_BASE,
  PRODUCT_P6_BUDGET_ROI_FREEZE_VERSION,
  PRODUCT_P6_BUDGET_ROI_ID,
  PRODUCT_P6_BUDGET_ROI_VERSION,
} from "./budget.constants";

export type BudgetStatus = (typeof BUDGET_STATUSES)[number];
export type P6ReadinessVerdict = (typeof P6_READINESS_VERDICTS)[number];
export type P6ManagerStatus = (typeof P6_MANAGER_STATUSES)[number];
export type BudgetMetadata = Record<string, unknown>;

export type BudgetPlan = {
  id: string;
  proposalRef: string;
  name: string;
  currency: string;
  status: BudgetStatus;
  owner: string;
  detail: string;
  metadata: BudgetMetadata;
  createdAt: string;
  updatedAt: string;
};

export type CreateBudgetInput = {
  id?: string;
  proposalRef: string;
  name: string;
  currency?: string;
  owner: string;
  metadata?: BudgetMetadata;
};

export type UpdateBudgetStatusInput = {
  budgetId: string;
  status: BudgetStatus;
};

export type P6ReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type P6ReadinessResult = {
  verdict: P6ReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: P6ReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type P6RegistryManifest = {
  foundationId: typeof PRODUCT_P6_BUDGET_ROI_ID;
  version: typeof PRODUCT_P6_BUDGET_ROI_VERSION;
  freezeVersion: typeof PRODUCT_P6_BUDGET_ROI_FREEZE_VERSION;
  base: typeof PRODUCT_P6_BUDGET_ROI_BASE;
  budgetCount: number;
  costModelCount: number;
  investmentCount: number;
  roiCount: number;
  financialSummaryCount: number;
  scenarioCount: number;
  pricingCount: number;
};
