import { finalizeRuntime, runStage } from "../shared/runtime";
import type { ComposerRuntimeResult, ComposerStageResult } from "../shared/types";
import { BIDDER_PROPOSAL_COMPOSER_VERSION } from "../shared/types";
import { buildProposalContextBundle } from "./builders";
import type { ProposalContextRuntimePayload } from "./types";
import { PROPOSAL_CONTEXT_RUNTIME_VERSION } from "./types";

export function validateProposalContextRuntime(input?: {
  deploymentId?: string;
  bidderBrand?: import("../shared/types").ComposerBidderBrand;
}): { valid: boolean } {
  const bundle = buildProposalContextBundle(input);
  return { valid: bundle.contextReadiness >= 80 };
}

export function runProposalContextRuntime(input?: {
  deploymentId?: string;
  bidderBrand?: import("../shared/types").ComposerBidderBrand;
}): ComposerRuntimeResult<ProposalContextRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "proposal-context-default";
  const stages: ComposerStageResult[] = [];

  const bundle = runStage("proposal-context-build", "Proposal Context", () => buildProposalContextBundle(input), stages);
  const validation = runStage("proposal-context-validate", "Context Validation", () => validateProposalContextRuntime(input), stages);
  if (!validation.valid) throw new Error("Proposal context validation failed");

  const payload: ProposalContextRuntimePayload = {
    version: PROPOSAL_CONTEXT_RUNTIME_VERSION,
    composerVersion: BIDDER_PROPOSAL_COMPOSER_VERSION,
    context: bundle.context,
    contextReadiness: bundle.contextReadiness,
    summary: `proposal-context ${bundle.context.proposalLabel} brand=${bundle.context.bidderBrand} readiness=${bundle.contextReadiness}%`,
  };

  return finalizeRuntime({ domain: "proposal-context", deploymentId, stages, payload, summary: payload.summary });
}
