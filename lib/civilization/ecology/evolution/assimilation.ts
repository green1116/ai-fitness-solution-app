/**
 * V3.4-E27-F evolution feedback assimilation compat entry.
 * Minimal pass-through for engine.ts module resolution.
 */

import type { EcologicalEvolutionResult } from "../evolution";

const ASSIMILATION_VERSION = "3.4-e27-f";

type EcologyInput = {
  civilizationId?: string;
  signals?: Record<string, number | undefined>;
};

export type EvolutionFeedbackAssimilationResult = {
  version: typeof ASSIMILATION_VERSION;
  civilizationId: string;
  summary: string;
  biasApplied: boolean;
  evolutionGeneration: number;
};

/** Pass-through input bias hook (no signal mutation in compat mode). */
export function applyAssimilationBiasToInput<T extends EcologyInput>(input: T): T {
  return input;
}

/** Minimal assimilation compat: fold feedback/transmission/evolution into one summary. */
export function runEvolutionFeedbackAssimilation(input: {
  civilizationId: string;
  feedback: { summary?: string };
  transmission: { summary?: string };
  evolution: EcologicalEvolutionResult;
}): EvolutionFeedbackAssimilationResult {
  const evolution = input.evolution;

  return {
    version: ASSIMILATION_VERSION,
    civilizationId: input.civilizationId,
    biasApplied: true,
    evolutionGeneration: evolution.generation,
    summary: [
      `assimilation=${ASSIMILATION_VERSION}`,
      `civilizationId=${input.civilizationId}`,
      `generation=${evolution.generation}`,
      input.transmission.summary ? `transmission=${input.transmission.summary}` : null,
      input.feedback.summary ? `feedback=${input.feedback.summary}` : null,
    ]
      .filter(Boolean)
      .join(" "),
  };
}

export function formatAssimilationSummary(
  assimilation: EvolutionFeedbackAssimilationResult,
): string {
  return assimilation.summary;
}
