import { finalizeRuntime, runStage } from "../shared/runtime";
import type { DifferentiationRuntimeResult, DifferentiationStageResult } from "../shared/types";
import { PROPOSAL_DIFFERENTIATION_VERSION } from "../shared/types";
import { buildValuePropositionSnapshot } from "./builders";
import type { ValuePropositionRuntimePayload } from "./types";
import { VALUE_PROPOSITION_RUNTIME_VERSION } from "./types";

export function validateValuePropositionRuntime(input?: {
  deploymentId?: string;
  bidderBrand?: import("../shared/types").DifferentiationBidderBrand;
}): { valid: boolean } {
  const snapshot = buildValuePropositionSnapshot(input);
  return { valid: snapshot.propositionScore > 0 && snapshot.keyBenefits.length >= 3 };
}

export function runValuePropositionRuntime(input?: {
  deploymentId?: string;
  bidderBrand?: import("../shared/types").DifferentiationBidderBrand;
}): DifferentiationRuntimeResult<ValuePropositionRuntimePayload> {
  const deploymentId = input?.deploymentId ?? "value-proposition-default";
  const stages: DifferentiationStageResult[] = [];

  const snapshot = runStage("value-proposition-build", "Value Proposition", () => buildValuePropositionSnapshot(input), stages);
  const validation = runStage("value-proposition-validate", "Proposition Validation", () => validateValuePropositionRuntime(input), stages);
  if (!validation.valid) throw new Error("Value proposition validation failed");

  const payload: ValuePropositionRuntimePayload = {
    version: VALUE_PROPOSITION_RUNTIME_VERSION,
    differentiationVersion: PROPOSAL_DIFFERENTIATION_VERSION,
    snapshot,
    propositionScore: snapshot.propositionScore,
    summary: `value-proposition bidder=${snapshot.bidderBrand} position="${snapshot.competitivePosition}" score=${snapshot.propositionScore}`,
  };

  return finalizeRuntime({ domain: "value-proposition", deploymentId, stages, payload, summary: payload.summary });
}
