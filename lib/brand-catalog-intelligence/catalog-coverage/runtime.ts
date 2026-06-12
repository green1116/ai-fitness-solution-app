import { finalizeRuntime, runStage } from "../shared/runtime";
import type { BrandCatalogRuntimeResult, BrandCatalogStageResult } from "../shared/types";
import { BRAND_CATALOG_INTELLIGENCE_VERSION } from "../shared/types";
import { buildCatalogCoverageSnapshot } from "./builders";
import type { CatalogCoverageRuntimePayload } from "./types";
import { CATALOG_COVERAGE_RUNTIME_VERSION } from "./types";

export function validateCatalogCoverageRuntime(input?: { deploymentId?: string }): { valid: boolean } {
  const snapshot = buildCatalogCoverageSnapshot(input);
  return { valid: snapshot.catalogCompletenessScore > 0 && snapshot.brandCount >= 6 };
}

export function runCatalogCoverageRuntime(input?: {
  deploymentId?: string;
}): BrandCatalogRuntimeResult<CatalogCoverageRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "catalog-coverage-default";
  const stages: BrandCatalogStageResult[] = [];

  const snapshot = runStage("catalog-coverage-build", "Catalog Coverage", () => buildCatalogCoverageSnapshot({ deploymentId }), stages);
  const validation = runStage("catalog-coverage-validate", "Coverage Validation", () => validateCatalogCoverageRuntime({ deploymentId }), stages);
  if (!validation.valid) throw new Error("Catalog coverage validation failed");

  const payload: CatalogCoverageRuntimePayload = {
    version: CATALOG_COVERAGE_RUNTIME_VERSION,
    brandCatalogVersion: BRAND_CATALOG_INTELLIGENCE_VERSION,
    snapshot,
    catalogCompletenessScore: snapshot.catalogCompletenessScore,
    summary: `catalog-coverage brands=${snapshot.brandCount} categories=${snapshot.categoryCount} equipment=${snapshot.equipmentCount} completeness=${snapshot.catalogCompletenessScore}%`,
  };

  return finalizeRuntime({ domain: "catalog-coverage", deploymentId, stages, payload, summary: payload.summary });
}
