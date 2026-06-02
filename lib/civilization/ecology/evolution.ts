/**
 * V3.4-E27-D ecological evolution compat entry.
 * Minimal pass-through for engine.ts module resolution (no full evolution runtime).
 */

import type {
  EcologicalClosedLoopAdaptation,
  EcologicalOrchestrationPass,
} from "./adaptation";
import { ECOLOGY_RUNTIME_PIPELINE } from "./contract";

const EVOLUTION_VERSION = "3.4-e27-d";

export type EcologicalEvolutionInput = {
  civilizationId: string;
  finalPass: EcologicalOrchestrationPass;
  adaptation: EcologicalClosedLoopAdaptation;
};

export type EcologicalEvolutionResult = {
  version: typeof EVOLUTION_VERSION;
  civilizationId: string;
  generation: number;
  maturity: "nascent" | "developing" | "mature";
  ecologyIndex: number;
  ecologicalState: string;
  summary: string;
  profile: {
    imbalanceCount: number;
    recoveryEffective: boolean;
    driftStable: boolean;
  };
};

/** Single-generation evolution compat: ingest one closed-loop pass. */
export function runEcologicalEvolution(
  input: EcologicalEvolutionInput,
): EcologicalEvolutionResult {
  const { civilizationId, finalPass, adaptation } = input;
  const ecologyIndex = finalPass.ecologyIndex;
  const pipelineStageCount = ECOLOGY_RUNTIME_PIPELINE.length;

  let maturity: EcologicalEvolutionResult["maturity"] = "developing";
  if (ecologyIndex >= 70) maturity = "mature";
  else if (ecologyIndex < 40) maturity = "nascent";

  const summary = [
    `evolution=${EVOLUTION_VERSION}`,
    `generation=1`,
    `maturity=${maturity}`,
    `index=${ecologyIndex}`,
    `pipeline=${pipelineStageCount}`,
    `slices=${finalPass.slices.length}`,
  ].join(" ");

  return {
    version: EVOLUTION_VERSION,
    civilizationId,
    generation: 1,
    maturity,
    ecologyIndex,
    ecologicalState: finalPass.ecologicalState,
    summary,
    profile: {
      imbalanceCount: 0,
      recoveryEffective: adaptation.passCount >= 1,
      driftStable: ecologyIndex >= 50,
    },
  };
}

export function formatEvolutionSummary(evolution: EcologicalEvolutionResult): string {
  return evolution.summary;
}
