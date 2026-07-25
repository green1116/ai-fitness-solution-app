/**
 * Product P6 — Cost model types
 */

import type { COST_MODEL_KINDS } from "../budget/budget.constants";

export type CostModelKind = (typeof COST_MODEL_KINDS)[number];
export type CostModelMetadata = Record<string, unknown>;

export type CostModel = {
  id: string;
  budgetId: string;
  kind: CostModelKind;
  name: string;
  annualCost: number;
  detail: string;
  metadata: CostModelMetadata;
  createdAt: string;
};

export type CreateCostModelInput = {
  id?: string;
  budgetId: string;
  kind: CostModelKind;
  name: string;
  annualCost: number;
  metadata?: CostModelMetadata;
};
