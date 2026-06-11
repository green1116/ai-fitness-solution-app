import { finalizeRuntime, runStage } from "../shared/runtime";
import type { ComposerRuntimeResult, ComposerStageResult } from "../shared/types";
import { BIDDER_PROPOSAL_COMPOSER_VERSION } from "../shared/types";
import { buildAllProposalQualityAssessments } from "./builders";
import type { ProposalQualityRuntimePayload } from "./types";
import { PROPOSAL_QUALITY_RUNTIME_VERSION } from "./types";

export function validateProposalQualityRuntime(input?: {
  deploymentId?: string;
}): { valid: boolean } {
  const { assessments, averageQualityScore } = buildAllProposalQualityAssessments(input);
  return {
    valid: assessments.length === 4 && averageQualityScore > 50 && assessments.every((a) => a.completeness >= 80),
  };
}

export function runProposalQualityRuntime(input?: {
  deploymentId?: string;
}): ComposerRuntimeResult<ProposalQualityRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "proposal-quality-default";
  const stages: ComposerStageResult[] = [];

  const result = runStage("proposal-quality-build", "Proposal Quality", () => buildAllProposalQualityAssessments(input), stages);
  const validation = runStage("proposal-quality-validate", "Quality Validation", () => validateProposalQualityRuntime(input), stages);
  if (!validation.valid) throw new Error("Proposal quality validation failed");

  const payload: ProposalQualityRuntimePayload = {
    version: PROPOSAL_QUALITY_RUNTIME_VERSION,
    composerVersion: BIDDER_PROPOSAL_COMPOSER_VERSION,
    assessments: result.assessments,
    averageQualityScore: result.averageQualityScore,
    qualityReadiness: result.qualityReadiness,
    summary: `proposal-quality avg=${result.averageQualityScore}% readiness=${result.qualityReadiness}%`,
  };

  return finalizeRuntime({ domain: "proposal-quality", deploymentId, stages, payload, summary: payload.summary });
}
