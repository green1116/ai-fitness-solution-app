import { finalizeRuntime, runStage } from "../shared/runtime";
import type { BrandCatalogRuntimeResult, BrandCatalogStageResult } from "../shared/types";
import { BRAND_CATALOG_INTELLIGENCE_VERSION } from "../shared/types";
import { buildBrandIntelligenceSnapshot } from "./builders";
import type { BrandIntelligenceRuntimePayload } from "./types";
import { BRAND_INTELLIGENCE_RUNTIME_VERSION } from "./types";

export function validateBrandIntelligenceRuntime(input?: { deploymentId?: string }): { valid: boolean } {
  const snapshot = buildBrandIntelligenceSnapshot(input);
  return {
    valid:
      snapshot.intelligenceReadiness > 0 &&
      snapshot.profiles.length >= 6 &&
      snapshot.tierDistribution.premium > 0 &&
      snapshot.tierDistribution.commercial > 0 &&
      snapshot.tierDistribution.value > 0,
  };
}

export function runBrandIntelligenceRuntime(input?: {
  deploymentId?: string;
}): BrandCatalogRuntimeResult<BrandIntelligenceRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "brand-intelligence-default";
  const stages: BrandCatalogStageResult[] = [];

  const snapshot = runStage("brand-intelligence-build", "Brand Intelligence", () => buildBrandIntelligenceSnapshot({ deploymentId }), stages);
  const validation = runStage("brand-intelligence-validate", "Intelligence Validation", () => validateBrandIntelligenceRuntime({ deploymentId }), stages);
  if (!validation.valid) throw new Error("Brand intelligence validation failed");

  const payload: BrandIntelligenceRuntimePayload = {
    version: BRAND_INTELLIGENCE_RUNTIME_VERSION,
    brandCatalogVersion: BRAND_CATALOG_INTELLIGENCE_VERSION,
    snapshot,
    intelligenceReadiness: snapshot.intelligenceReadiness,
    summary: `brand-intelligence profiles=${snapshot.profiles.length} tiers=${Object.values(snapshot.tierDistribution).filter((c) => c > 0).length} readiness=${snapshot.intelligenceReadiness}%`,
  };

  return finalizeRuntime({ domain: "brand-intelligence", deploymentId, stages, payload, summary: payload.summary });
}
