import { finalizeRuntime, runStage } from "../shared/runtime";
import type { BrandCatalogRuntimeResult, BrandCatalogStageResult } from "../shared/types";
import { BRAND_CATALOG_INTELLIGENCE_VERSION } from "../shared/types";
import { buildBrandComparisonSnapshot } from "./builders";
import type { BrandComparisonRuntimePayload } from "./types";
import { BRAND_COMPARISON_RUNTIME_VERSION } from "./types";

export function validateBrandComparisonRuntime(input?: { deploymentId?: string }): { valid: boolean } {
  const snapshot = buildBrandComparisonSnapshot(input);
  return { valid: snapshot.comparisonReadiness > 0 && snapshot.comparisons.length >= 3 };
}

export function runBrandComparisonRuntime(input?: {
  deploymentId?: string;
}): BrandCatalogRuntimeResult<BrandComparisonRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "brand-comparison-default";
  const stages: BrandCatalogStageResult[] = [];

  const snapshot = runStage("brand-comparison-build", "Brand Comparison", () => buildBrandComparisonSnapshot({ deploymentId }), stages);
  const validation = runStage("brand-comparison-validate", "Comparison Validation", () => validateBrandComparisonRuntime({ deploymentId }), stages);
  if (!validation.valid) throw new Error("Brand comparison validation failed");

  const payload: BrandComparisonRuntimePayload = {
    version: BRAND_COMPARISON_RUNTIME_VERSION,
    brandCatalogVersion: BRAND_CATALOG_INTELLIGENCE_VERSION,
    snapshot,
    comparisonReadiness: snapshot.comparisonReadiness,
    summary: `brand-comparison pairs=${snapshot.comparisons.length} readiness=${snapshot.comparisonReadiness}%`,
  };

  return finalizeRuntime({ domain: "brand-comparison", deploymentId, stages, payload, summary: payload.summary });
}
