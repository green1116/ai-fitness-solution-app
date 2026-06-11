import { finalizeRuntime, runStage } from "../shared/runtime";
import type { BrandCatalogRuntimeResult, BrandCatalogStageResult } from "../shared/types";
import { BRAND_CATALOG_INTELLIGENCE_VERSION } from "../shared/types";
import { buildBrandCatalogDashboardMetrics } from "./builders";
import type { BrandCatalogDashboardRuntimePayload } from "./types";
import { BRAND_CATALOG_DASHBOARD_RUNTIME_VERSION } from "./types";

export function validateBrandCatalogDashboardRuntime(input?: { deploymentId?: string }): { valid: boolean } {
  const metrics = buildBrandCatalogDashboardMetrics(input);
  return {
    valid:
      metrics.brandReadiness > 0 &&
      metrics.equipmentReadiness > 0 &&
      metrics.comparisonReadiness > 0 &&
      metrics.matchingReadiness > 0 &&
      metrics.budgetMappingReadiness > 0,
  };
}

export function runBrandCatalogDashboardRuntime(input?: {
  deploymentId?: string;
}): BrandCatalogRuntimeResult<BrandCatalogDashboardRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "brand-catalog-dashboard-default";
  const stages: BrandCatalogStageResult[] = [];

  const metrics = runStage("brand-catalog-dashboard-metrics", "Brand & Catalog Dashboard", () => buildBrandCatalogDashboardMetrics({ deploymentId }), stages);
  const validation = runStage("brand-catalog-dashboard-validate", "Dashboard Validation", () => validateBrandCatalogDashboardRuntime({ deploymentId }), stages);
  if (!validation.valid) throw new Error("Brand catalog dashboard validation failed");

  const payload: BrandCatalogDashboardRuntimePayload = {
    version: BRAND_CATALOG_DASHBOARD_RUNTIME_VERSION,
    brandCatalogVersion: BRAND_CATALOG_INTELLIGENCE_VERSION,
    brandReadiness: metrics.brandReadiness,
    equipmentReadiness: metrics.equipmentReadiness,
    comparisonReadiness: metrics.comparisonReadiness,
    matchingReadiness: metrics.matchingReadiness,
    budgetMappingReadiness: metrics.budgetMappingReadiness,
    summary: metrics.summary,
  };

  return finalizeRuntime({ domain: "brand-catalog-dashboard", deploymentId, stages, payload, summary: payload.summary });
}
