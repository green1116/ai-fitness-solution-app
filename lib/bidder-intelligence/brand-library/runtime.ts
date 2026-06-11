import { finalizeRuntime, runStage } from "../shared/runtime";
import type { BidderIntelligenceRuntimeResult, BidderIntelligenceStageResult } from "../shared/types";
import { BIDDER_INTELLIGENCE_VERSION } from "../shared/types";
import { buildBrandLibrarySnapshot } from "./builders";
import type { BrandLibraryRuntimePayload } from "./types";
import { BRAND_LIBRARY_RUNTIME_VERSION } from "./types";

export function validateBrandLibraryRuntime(input?: { deploymentId?: string }): { valid: boolean } {
  const snapshot = buildBrandLibrarySnapshot(input);
  return { valid: snapshot.brandReadiness > 0 && snapshot.brands.length >= 3 };
}

export function runBrandLibraryRuntime(input?: {
  deploymentId?: string;
}): BidderIntelligenceRuntimeResult<BrandLibraryRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "brand-library-default";
  const stages: BidderIntelligenceStageResult[] = [];

  const snapshot = runStage("brand-library-build", "Brand Library", () => buildBrandLibrarySnapshot({ deploymentId }), stages);
  const validation = runStage("brand-library-validate", "Brand Validation", () => validateBrandLibraryRuntime({ deploymentId }), stages);
  if (!validation.valid) throw new Error("Brand library validation failed");

  const payload: BrandLibraryRuntimePayload = {
    version: BRAND_LIBRARY_RUNTIME_VERSION,
    bidderIntelligenceVersion: BIDDER_INTELLIGENCE_VERSION,
    snapshot,
    brandReadiness: snapshot.brandReadiness,
    summary: `brand-library brands=${snapshot.brands.length} readiness=${snapshot.brandReadiness}% tiers=${Object.values(snapshot.tierCoverage).filter((c) => c > 0).length}`,
  };

  return finalizeRuntime({ domain: "brand-library", deploymentId, stages, payload, summary: payload.summary });
}
