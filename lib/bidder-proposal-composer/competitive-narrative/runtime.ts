import { finalizeRuntime, runStage } from "../shared/runtime";
import type { ComposerRuntimeResult, ComposerStageResult } from "../shared/types";
import { BIDDER_PROPOSAL_COMPOSER_VERSION } from "../shared/types";
import { buildCompetitiveNarrativeComposition } from "./builders";
import type { CompetitiveNarrativeComposerRuntimePayload } from "./types";
import { COMPETITIVE_NARRATIVE_COMPOSER_RUNTIME_VERSION } from "./types";

export function validateCompetitiveNarrativeComposerRuntime(input?: {
  deploymentId?: string;
  bidderBrand?: import("../shared/types").ComposerBidderBrand;
}): { valid: boolean } {
  const c = buildCompetitiveNarrativeComposition(input);
  return { valid: c.differentiationReadiness > 0 && c.brandAdvantage.length > 10 };
}

export function runCompetitiveNarrativeComposerRuntime(input?: {
  deploymentId?: string;
  bidderBrand?: import("../shared/types").ComposerBidderBrand;
}): ComposerRuntimeResult<CompetitiveNarrativeComposerRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "competitive-narrative-composer-default";
  const stages: ComposerStageResult[] = [];

  const composition = runStage("competitive-narrative-composer-build", "Competitive Narrative Composer", () => buildCompetitiveNarrativeComposition(input), stages);
  const validation = runStage("competitive-narrative-composer-validate", "Competitive Narrative Validation", () => validateCompetitiveNarrativeComposerRuntime(input), stages);
  if (!validation.valid) throw new Error("Competitive narrative composer validation failed");

  const payload: CompetitiveNarrativeComposerRuntimePayload = {
    version: COMPETITIVE_NARRATIVE_COMPOSER_RUNTIME_VERSION,
    composerVersion: BIDDER_PROPOSAL_COMPOSER_VERSION,
    composition,
    differentiationReadiness: composition.differentiationReadiness,
    summary: `competitive-narrative-composer ${composition.proposalLabel} readiness=${composition.differentiationReadiness}%`,
  };

  return finalizeRuntime({ domain: "competitive-narrative-composer", deploymentId, stages, payload, summary: payload.summary });
}
