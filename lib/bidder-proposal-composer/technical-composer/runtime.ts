import { finalizeRuntime, runStage } from "../shared/runtime";
import type { ComposerRuntimeResult, ComposerStageResult } from "../shared/types";
import { BIDDER_PROPOSAL_COMPOSER_VERSION } from "../shared/types";
import { buildTechnicalProposalComposition } from "./builders";
import type { TechnicalComposerRuntimePayload } from "./types";
import { TECHNICAL_COMPOSER_RUNTIME_VERSION } from "./types";

export function validateTechnicalComposerRuntime(input?: {
  deploymentId?: string;
  bidderBrand?: import("../shared/types").ComposerBidderBrand;
}): { valid: boolean } {
  const c = buildTechnicalProposalComposition(input);
  return { valid: c.technicalReadiness > 0 && c.equipmentArchitecture.length > 20 };
}

export function runTechnicalComposerRuntime(input?: {
  deploymentId?: string;
  bidderBrand?: import("../shared/types").ComposerBidderBrand;
}): ComposerRuntimeResult<TechnicalComposerRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "technical-composer-default";
  const stages: ComposerStageResult[] = [];

  const composition = runStage("technical-composer-build", "Technical Composer", () => buildTechnicalProposalComposition(input), stages);
  const validation = runStage("technical-composer-validate", "Technical Validation", () => validateTechnicalComposerRuntime(input), stages);
  if (!validation.valid) throw new Error("Technical composer validation failed");

  const payload: TechnicalComposerRuntimePayload = {
    version: TECHNICAL_COMPOSER_RUNTIME_VERSION,
    composerVersion: BIDDER_PROPOSAL_COMPOSER_VERSION,
    composition,
    technicalReadiness: composition.technicalReadiness,
    summary: `technical-composer ${composition.proposalLabel} categories=${Object.keys(composition.equipmentArchitecture).length} readiness=${composition.technicalReadiness}%`,
  };

  return finalizeRuntime({ domain: "technical-composer", deploymentId, stages, payload, summary: payload.summary });
}
