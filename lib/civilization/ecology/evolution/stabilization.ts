/**
 * V3.4-E27-G ecological stabilization compat entry.
 * Minimal pass-through for engine.ts module resolution.
 */

import type { EcologicalEvolutionResult } from "../evolution";
import type { EvolutionFeedbackAssimilationResult } from "./assimilation";
import type { EvolutionFeedbackClosureResult } from "./feedback";

const STABILIZATION_VERSION = "3.4-e27-g";

type EcologyInput = {
  civilizationId?: string;
  signals?: Record<string, number | undefined>;
};

export type EcologicalStabilizationResult = {
  version: typeof STABILIZATION_VERSION;
  civilizationId: string;
  summary: string;
  ecologyIndex: number;
  ecologicalState: string;
  signalCount: number;
  evolutionGeneration: number;
};

/** Pass-through stabilization anchor hook (compat: no signal mutation). */
export function applyStabilizationAnchorToInput<T extends EcologyInput>(input: T): T {
  return input;
}

/** Minimal stabilization compat: anchor assimilation/feedback/evolution signals. */
export function runEcologicalStabilization(input: {
  civilizationId: string;
  assimilation: EvolutionFeedbackAssimilationResult;
  evolution: EcologicalEvolutionResult;
  feedback: EvolutionFeedbackClosureResult;
  ecologyIndex: number;
  ecologicalState: string;
  currentSignals: Record<string, number | undefined>;
}): EcologicalStabilizationResult {
  const signalCount = Object.keys(input.currentSignals).length;

  const summary = [
    `stabilization=${STABILIZATION_VERSION}`,
    `civilizationId=${input.civilizationId}`,
    `index=${input.ecologyIndex}`,
    `state=${input.ecologicalState}`,
    `signals=${signalCount}`,
    `generation=${input.evolution.generation}`,
    input.assimilation.summary ? `assimilation=${input.assimilation.summary}` : null,
    input.feedback.summary ? `feedback=${input.feedback.summary}` : null,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    version: STABILIZATION_VERSION,
    civilizationId: input.civilizationId,
    summary,
    ecologyIndex: input.ecologyIndex,
    ecologicalState: input.ecologicalState,
    signalCount,
    evolutionGeneration: input.evolution.generation,
  };
}

export function formatStabilizationSummary(
  stabilization: EcologicalStabilizationResult,
): string {
  return stabilization.summary;
}
