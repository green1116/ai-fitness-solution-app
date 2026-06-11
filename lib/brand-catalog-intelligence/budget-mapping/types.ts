import type { BRAND_CATALOG_INTELLIGENCE_VERSION } from "../shared/types";

export const BUDGET_MAPPING_RUNTIME_VERSION = "v19.1-budget-mapping-1" as const;

export interface BudgetProfile {
  profileId: string;
  tier: "low" | "mid" | "premium";
  label: string;
  totalBudgetMin: number;
  totalBudgetMax: number;
  currency: string;
  equipmentItems: Array<{
    modelName: string;
    brandName: string;
    unitPriceEstimate: number;
    quantity: number;
  }>;
  coverageScore: number;
}

export interface BudgetMappingSnapshot {
  snapshotId: string;
  lowBudgetProfile: BudgetProfile;
  midBudgetProfile: BudgetProfile;
  premiumBudgetProfile: BudgetProfile;
  budgetMappingReadiness: number;
}

export interface BudgetMappingRuntimePayload {
  version: typeof BUDGET_MAPPING_RUNTIME_VERSION;
  brandCatalogVersion: typeof BRAND_CATALOG_INTELLIGENCE_VERSION;
  snapshot: BudgetMappingSnapshot;
  budgetMappingReadiness: number;
  summary: string;
}
