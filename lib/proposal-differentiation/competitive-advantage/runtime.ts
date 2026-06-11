import { finalizeRuntime, runStage } from "../shared/runtime";
import type { DifferentiationRuntimeResult, DifferentiationStageResult } from "../shared/types";
import { PROPOSAL_DIFFERENTIATION_VERSION } from "../shared/types";
import { buildCompetitiveAdvantageSnapshot } from "./builders";
import type { CompetitiveAdvantageRuntimePayload } from "./types";
import { COMPETITIVE_ADVANTAGE_RUNTIME_VERSION } from "./types";

export function validateCompetitiveAdvantageRuntime(input?: {
  deploymentId?: string;
  bidderBrand?: import("../shared/types").DifferentiationBidderBrand;
}): { valid: boolean } {
  const snapshot = buildCompetitiveAdvantageSnapshot(input);
  return {
    valid:
      snapshot.advantageScore > 0 &&
      snapshot.matrix.brandAdvantage.length >= 2 &&
      snapshot.matrix.deliveryAdvantage.length >= 2,
  };
}

export function runCompetitiveAdvantageRuntime(input?: {
  deploymentId?: string;
  bidderBrand?: import("../shared/types").DifferentiationBidderBrand;
}): DifferentiationRuntimeResult<CompetitiveAdvantageRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "competitive-advantage-default";
  const stages: DifferentiationStageResult[] = [];

  const snapshot = runStage("competitive-advantage-build", "Competitive Advantage", () => buildCompetitiveAdvantageSnapshot(input), stages);
  const validation = runStage("competitive-advantage-validate", "Advantage Validation", () => validateCompetitiveAdvantageRuntime(input), stages);
  if (!validation.valid) throw new Error("Competitive advantage validation failed");

  const payload: CompetitiveAdvantageRuntimePayload = {
    version: COMPETITIVE_ADVANTAGE_RUNTIME_VERSION,
    differentiationVersion: PROPOSAL_DIFFERENTIATION_VERSION,
    snapshot,
    advantageScore: snapshot.advantageScore,
    summary: `competitive-advantage bidder=${snapshot.bidderBrand} brand=${snapshot.matrix.brandAdvantage.length} delivery=${snapshot.matrix.deliveryAdvantage.length} score=${snapshot.advantageScore}`,
  };

  return finalizeRuntime({ domain: "competitive-advantage", deploymentId, stages, payload, summary: payload.summary });
}
