import type { BRAND_CATALOG_INTELLIGENCE_VERSION } from "../shared/types";

export const BRAND_CATALOG_DASHBOARD_RUNTIME_VERSION = "v19.1-brand-catalog-dashboard-1" as const;

export interface BrandCatalogDashboardRuntimePayload {
  version: typeof BRAND_CATALOG_DASHBOARD_RUNTIME_VERSION;
  brandCatalogVersion: typeof BRAND_CATALOG_INTELLIGENCE_VERSION;
  brandReadiness: number;
  equipmentReadiness: number;
  comparisonReadiness: number;
  matchingReadiness: number;
  budgetMappingReadiness: number;
  summary: string;
}
