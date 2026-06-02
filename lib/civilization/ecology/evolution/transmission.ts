/**
 * V3.4-E27-E evolution transmission compat entry.
 * Minimal pass-through for engine.ts module resolution.
 */

import type { EcologicalEvolutionResult } from "../evolution";

const TRANSMISSION_VERSION = "3.4-e27-e";

export type EvolutionTransmissionResult = {
  version: typeof TRANSMISSION_VERSION;
  civilizationId: string;
  summary: string;
  generation: number;
  maturity: EcologicalEvolutionResult["maturity"];
  ecologyIndex: number;
};

/** Minimal transmission compat: encode evolution state into a pass-through protocol. */
export function runEvolutionTransmission(input: {
  evolution: EcologicalEvolutionResult;
}): EvolutionTransmissionResult {
  const { evolution } = input;

  const summary = [
    `transmission=${TRANSMISSION_VERSION}`,
    `civilizationId=${evolution.civilizationId}`,
    `generation=${evolution.generation}`,
    `maturity=${evolution.maturity}`,
    `index=${evolution.ecologyIndex}`,
  ].join(" ");

  return {
    version: TRANSMISSION_VERSION,
    civilizationId: evolution.civilizationId,
    summary,
    generation: evolution.generation,
    maturity: evolution.maturity,
    ecologyIndex: evolution.ecologyIndex,
  };
}

export function formatTransmissionSummary(
  transmission: EvolutionTransmissionResult,
): string {
  return transmission.summary;
}
