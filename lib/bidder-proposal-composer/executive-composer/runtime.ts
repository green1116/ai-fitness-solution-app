import { finalizeRuntime, runStage } from "../shared/runtime";
import type { ComposerRuntimeResult, ComposerStageResult } from "../shared/types";
import { BIDDER_PROPOSAL_COMPOSER_VERSION } from "../shared/types";
import { buildExecutiveSummaryComposition } from "./builders";
import type { ExecutiveComposerRuntimePayload } from "./types";
import { EXECUTIVE_COMPOSER_RUNTIME_VERSION } from "./types";

export function validateExecutiveComposerRuntime(input?: {
  deploymentId?: string;
  bidderBrand?: import("../shared/types").ComposerBidderBrand;
}): { valid: boolean } {
  const composition = buildExecutiveSummaryComposition(input);
  return { valid: composition.executiveReadiness > 0 && composition.executiveSummary.length > 50 };
}

export function runExecutiveComposerRuntime(input?: {
  deploymentId?: string;
  bidderBrand?: import("../shared/types").ComposerBidderBrand;
}): ComposerRuntimeResult<ExecutiveComposerRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "executive-composer-default";
  const stages: ComposerStageResult[] = [];

  const composition = runStage("executive-composer-build", "Executive Composer", () => buildExecutiveSummaryComposition(input), stages);
  const validation = runStage("executive-composer-validate", "Executive Validation", () => validateExecutiveComposerRuntime(input), stages);
  if (!validation.valid) throw new Error("Executive composer validation failed");

  const payload: ExecutiveComposerRuntimePayload = {
    version: EXECUTIVE_COMPOSER_RUNTIME_VERSION,
    composerVersion: BIDDER_PROPOSAL_COMPOSER_VERSION,
    composition,
    executiveReadiness: composition.executiveReadiness,
    summary: `executive-composer ${composition.proposalLabel} style=${composition.style} readiness=${composition.executiveReadiness}%`,
  };

  return finalizeRuntime({ domain: "executive-composer", deploymentId, stages, payload, summary: payload.summary });
}
