import { finalizeRuntime, runStage } from "../shared/runtime";
import type { DifferentiationRuntimeResult, DifferentiationStageResult } from "../shared/types";
import { PROPOSAL_DIFFERENTIATION_VERSION } from "../shared/types";
import { buildBrandStrategySnapshot } from "./builders";
import type { BrandStrategyRuntimePayload } from "./types";
import { BRAND_STRATEGY_RUNTIME_VERSION } from "./types";

export function validateBrandStrategyRuntime(input?: {
  deploymentId?: string;
  bidderBrand?: import("../shared/types").DifferentiationBidderBrand;
}): { valid: boolean } {
  const snapshot = buildBrandStrategySnapshot(input);
  return { valid: snapshot.strategyScore > 0 && snapshot.selectedStrategy.focusBrands.length >= 1 };
}

export function runBrandStrategyRuntime(input?: {
  deploymentId?: string;
  bidderBrand?: import("../shared/types").DifferentiationBidderBrand;
}): DifferentiationRuntimeResult<BrandStrategyRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "brand-strategy-default";
  const stages: DifferentiationStageResult[] = [];

  const snapshot = runStage("brand-strategy-build", "Brand Strategy", () => buildBrandStrategySnapshot(input), stages);
  const validation = runStage("brand-strategy-validate", "Strategy Validation", () => validateBrandStrategyRuntime(input), stages);
  if (!validation.valid) throw new Error("Brand strategy validation failed");

  const payload: BrandStrategyRuntimePayload = {
    version: BRAND_STRATEGY_RUNTIME_VERSION,
    differentiationVersion: PROPOSAL_DIFFERENTIATION_VERSION,
    snapshot,
    strategyScore: snapshot.strategyScore,
    summary: `brand-strategy bidder=${snapshot.bidderBrand} type=${snapshot.selectedStrategy.strategyType} score=${snapshot.strategyScore}`,
  };

  return finalizeRuntime({ domain: "brand-strategy", deploymentId, stages, payload, summary: payload.summary });
}
