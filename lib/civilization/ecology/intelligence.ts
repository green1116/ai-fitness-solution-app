/**
 * V3.4-E27-A ecology runtime intelligence compat entry.
 * Minimal pass-through for engine.ts module resolution.
 */

import type { EcologicalOrchestrationPass } from "./adaptation";

export type EcologyRuntimeIntelligence = {
  ecologyIndex: number;
  ecologicalState: string;
  ecologicallySynergistic: boolean;
  sliceCount: number;
  healthySliceCount: number;
  summary: string;
};

type BuildEcologyRuntimeIntelligenceInput = {
  ecologyIndex: number;
  ecologicalState: string;
  slices: EcologicalOrchestrationPass["slices"];
};

/** Minimal intelligence compat: derive synergistic flag from index/state/slices. */
export function buildEcologyRuntimeIntelligence(
  input: BuildEcologyRuntimeIntelligenceInput,
): EcologyRuntimeIntelligence {
  const healthySliceCount = input.slices.filter((slice) => slice.status === "healthy").length;
  const ecologicallySynergistic =
    input.ecologyIndex >= 75 || input.ecologicalState === "synergistic";

  return {
    ecologyIndex: input.ecologyIndex,
    ecologicalState: input.ecologicalState,
    ecologicallySynergistic,
    sliceCount: input.slices.length,
    healthySliceCount,
    summary: [
      "intelligence=compat",
      `index=${input.ecologyIndex}`,
      `state=${input.ecologicalState}`,
      `synergistic=${ecologicallySynergistic}`,
      `slices=${input.slices.length}`,
    ].join(" "),
  };
}
