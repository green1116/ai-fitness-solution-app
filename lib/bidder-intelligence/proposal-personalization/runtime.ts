import { finalizeRuntime, runStage } from "../shared/runtime";
import type { BidderIntelligenceRuntimeResult, BidderIntelligenceStageResult } from "../shared/types";
import { BIDDER_INTELLIGENCE_VERSION } from "../shared/types";
import { buildProposalPersonalizationSnapshot } from "./builders";
import type { ProposalPersonalizationRuntimePayload } from "./types";
import { PROPOSAL_PERSONALIZATION_RUNTIME_VERSION } from "./types";

export function validateProposalPersonalizationRuntime(input?: { deploymentId?: string }): { valid: boolean } {
  const snapshot = buildProposalPersonalizationSnapshot(input);
  return {
    valid:
      snapshot.differentiationReadiness > 0 &&
      snapshot.brandStrategy.recommendedBrands.length >= 2 &&
      snapshot.valueProposition.keyBenefits.length >= 2,
  };
}

export function runProposalPersonalizationRuntime(input?: {
  deploymentId?: string;
}): BidderIntelligenceRuntimeResult<ProposalPersonalizationRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "proposal-personalization-default";
  const stages: BidderIntelligenceStageResult[] = [];

  const snapshot = runStage("proposal-personalization-build", "Proposal Personalization", () => buildProposalPersonalizationSnapshot({ deploymentId }), stages);
  const validation = runStage("proposal-personalization-validate", "Personalization Validation", () => validateProposalPersonalizationRuntime({ deploymentId }), stages);
  if (!validation.valid) throw new Error("Proposal personalization validation failed");

  const payload: ProposalPersonalizationRuntimePayload = {
    version: PROPOSAL_PERSONALIZATION_RUNTIME_VERSION,
    bidderIntelligenceVersion: BIDDER_INTELLIGENCE_VERSION,
    snapshot,
    differentiationReadiness: snapshot.differentiationReadiness,
    summary: `proposal-personalization tender=${snapshot.tenderContext.projectName} brands=${snapshot.brandStrategy.recommendedBrands.length} readiness=${snapshot.differentiationReadiness}%`,
  };

  return finalizeRuntime({ domain: "proposal-personalization", deploymentId, stages, payload, summary: payload.summary });
}
