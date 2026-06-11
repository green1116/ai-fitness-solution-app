import { runBrandCatalogDashboardRuntime } from "../dashboard/runtime";
import { runBudgetMappingRuntime } from "../budget-mapping/runtime";
import { runCatalogCoverageRuntime } from "../catalog-coverage/runtime";
import type { BrandCatalogIntelligenceReport } from "../shared/types";
import { BRAND_CATALOG_INTELLIGENCE_VERSION } from "../shared/types";

export function buildBrandCatalogIntelligenceReport(input?: {
  deploymentId?: string;
}): BrandCatalogIntelligenceReport {
  const deploymentId = input?.deploymentId ?? "brand-catalog-report-default";

  const coverage = runCatalogCoverageRuntime({ deploymentId });
  const budget = runBudgetMappingRuntime({ deploymentId });
  const dashboard = runBrandCatalogDashboardRuntime({ deploymentId });

  const brandCoverage = coverage.payload.snapshot.brandCoverage;
  const equipmentCoverage = coverage.payload.snapshot.equipmentCoverage;
  const budgetCoverage = budget.payload.budgetMappingReadiness;
  const differentiationReadiness = Math.round(
    (dashboard.payload.comparisonReadiness + dashboard.payload.matchingReadiness) / 2,
  );

  return {
    version: BRAND_CATALOG_INTELLIGENCE_VERSION,
    reportId: `brand-catalog-intelligence-report-${deploymentId}`,
    deploymentId,
    brandCoverage,
    equipmentCoverage,
    budgetCoverage,
    differentiationReadiness,
    summary: [
      `brand-catalog-intelligence-report`,
      `brandCoverage=${brandCoverage}%`,
      `equipmentCoverage=${equipmentCoverage}%`,
      `budgetCoverage=${budgetCoverage}%`,
      `differentiationReadiness=${differentiationReadiness}%`,
    ].join(" "),
    generatedAt: new Date().toISOString(),
  };
}
