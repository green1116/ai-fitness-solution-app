import { runBrandComparisonRuntime } from "./brand-comparison";
import { runBrandIntelligenceRuntime } from "./brand-intelligence";
import { runBudgetMappingRuntime } from "./budget-mapping";
import { runCatalogCoverageRuntime } from "./catalog-coverage";
import { runBrandCatalogDashboardRuntime } from "./dashboard";
import { runEquipmentIntelligenceRuntime } from "./equipment-intelligence";
import { runEquipmentMatchingRuntime } from "./equipment-matching";
import type { BrandCatalogIntelligenceEvidence } from "./shared/types";
import { BRAND_CATALOG_INTELLIGENCE_VERSION } from "./shared/types";

export const BRAND_CATALOG_INTELLIGENCE_DOMAINS = [
  "brand-intelligence",
  "brand-comparison",
  "equipment-intelligence",
  "equipment-matching",
  "budget-mapping",
  "catalog-coverage",
  "brand-catalog-dashboard",
] as const;

export function buildBrandCatalogIntelligenceEvidence(input?: {
  deploymentId?: string;
}): BrandCatalogIntelligenceEvidence {
  const deploymentId = input?.deploymentId ?? "brand-catalog-intelligence-default";

  const runtimes = [
    runBrandIntelligenceRuntime({ deploymentId }),
    runBrandComparisonRuntime({ deploymentId }),
    runEquipmentIntelligenceRuntime({ deploymentId }),
    runEquipmentMatchingRuntime({ deploymentId }),
    runBudgetMappingRuntime({ deploymentId }),
    runCatalogCoverageRuntime({ deploymentId }),
    runBrandCatalogDashboardRuntime({ deploymentId }),
  ];

  const allSuccess = runtimes.every((runtime) => runtime.status === "success");
  if (!allSuccess) {
    const failed = runtimes
      .filter((runtime) => runtime.status !== "success")
      .map((runtime) => runtime.domain);
    throw new Error(`Brand catalog intelligence evidence incomplete: ${failed.join(", ")}`);
  }

  return {
    evidenceId: `evidence-brand-catalog-intelligence-${deploymentId}`,
    version: BRAND_CATALOG_INTELLIGENCE_VERSION,
    domains: [...BRAND_CATALOG_INTELLIGENCE_DOMAINS],
    runtimes: runtimes.map((runtime) => ({
      domain: runtime.domain,
      runtimeId: runtime.runtimeId,
      status: runtime.status,
      stageCount: runtime.stages.length,
      summary: runtime.summary,
    })),
    generatedAt: new Date().toISOString(),
    summary: `brand-catalog-intelligence-evidence domains=${BRAND_CATALOG_INTELLIGENCE_DOMAINS.length} allSuccess=true`,
  };
}
