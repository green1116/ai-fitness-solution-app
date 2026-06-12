import { finalizeRuntime, runStage } from "../shared/runtime";
import type { ComposerRuntimeResult, ComposerStageResult } from "../shared/types";
import { BIDDER_PROPOSAL_COMPOSER_VERSION } from "../shared/types";
import { buildAllProposalVariants } from "./builders";
import type { ProposalVariantComposerRuntimePayload } from "./types";
import { PROPOSAL_VARIANT_COMPOSER_RUNTIME_VERSION } from "./types";

export function validateProposalVariantComposerRuntime(input?: {
  deploymentId?: string;
}): { valid: boolean } {
  const { variants, variantSpreadScore } = buildAllProposalVariants(input);
  const allDistinct = new Set(variants.map((v) => v.bidderBrand)).size === 4;
  const allReady = variants.every((v) => v.variantReadiness > 0);
  return { valid: variants.length === 4 && allDistinct && allReady && variantSpreadScore > 20 };
}

export function runProposalVariantComposerRuntime(input?: {
  deploymentId?: string;
}): ComposerRuntimeResult<ProposalVariantComposerRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "proposal-variant-composer-default";
  const stages: ComposerStageResult[] = [];

  const result = runStage("proposal-variant-composer-build", "Proposal Variant Composer", () => buildAllProposalVariants(input), stages);
  const validation = runStage("proposal-variant-composer-validate", "Variant Validation", () => validateProposalVariantComposerRuntime(input), stages);
  if (!validation.valid) throw new Error("Proposal variant composer validation failed");

  const payload: ProposalVariantComposerRuntimePayload = {
    version: PROPOSAL_VARIANT_COMPOSER_RUNTIME_VERSION,
    composerVersion: BIDDER_PROPOSAL_COMPOSER_VERSION,
    variants: result.variants,
    variantCount: result.variants.length,
    variantSpreadScore: result.variantSpreadScore,
    summary: `proposal-variant-composer count=${result.variants.length} spread=${result.variantSpreadScore}%`,
  };

  return finalizeRuntime({ domain: "proposal-variant-composer", deploymentId, stages, payload, summary: payload.summary });
}
