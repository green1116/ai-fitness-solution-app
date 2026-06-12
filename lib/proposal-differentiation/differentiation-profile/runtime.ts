import { finalizeRuntime, runStage } from "../shared/runtime";
import type { DifferentiationRuntimeResult, DifferentiationStageResult } from "../shared/types";
import { PROPOSAL_DIFFERENTIATION_VERSION } from "../shared/types";
import { buildAllProposalVariants } from "./builders";
import type { ProposalDifferentiationRuntimePayload } from "./types";
import { PROPOSAL_DIFFERENTIATION_RUNTIME_VERSION } from "./types";

export function validateProposalDifferentiationRuntime(input?: {
  deploymentId?: string;
  bidderBrand?: import("../shared/types").DifferentiationBidderBrand;
}): { valid: boolean } {
  const { primary, allVariants } = buildAllProposalVariants(input);
  const scores = allVariants.map((v) => v.differentiationScore);
  const uniqueScores = new Set(scores);
  return {
    valid:
      primary.differentiationScore > 0 &&
      allVariants.length === 4 &&
      uniqueScores.size >= 3,
  };
}

export function runProposalDifferentiationRuntime(input?: {
  deploymentId?: string;
  bidderBrand?: import("../shared/types").DifferentiationBidderBrand;
}): DifferentiationRuntimeResult<ProposalDifferentiationRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "proposal-differentiation-default";
  const stages: DifferentiationStageResult[] = [];

  const result = runStage("proposal-differentiation-build", "Proposal Differentiation", () => buildAllProposalVariants(input), stages);
  const validation = runStage("proposal-differentiation-validate", "Differentiation Validation", () => validateProposalDifferentiationRuntime(input), stages);
  if (!validation.valid) throw new Error("Proposal differentiation validation failed");

  const payload: ProposalDifferentiationRuntimePayload = {
    version: PROPOSAL_DIFFERENTIATION_RUNTIME_VERSION,
    differentiationVersion: PROPOSAL_DIFFERENTIATION_VERSION,
    profile: result.primary,
    allVariants: result.allVariants,
    differentiationScore: result.primary.differentiationScore,
    summary: `proposal-differentiation variants=${result.allVariants.length} primary=${result.primary.proposalLabel} score=${result.primary.differentiationScore}%`,
  };

  return finalizeRuntime({ domain: "proposal-differentiation", deploymentId, stages, payload, summary: payload.summary });
}
