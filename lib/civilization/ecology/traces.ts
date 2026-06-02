/**
 * V3.4-E27-A ecology runtime traces compat entry.
 * Minimal pass-through for engine.ts module resolution.
 */

import type { EcologicalOrchestrationPass } from "./adaptation";

export type EcologyRuntimeTrace = {
  stageId: string;
  label: string;
  index: number;
  status: "healthy" | "warning" | "critical";
  at: string;
};

/** Minimal traces compat: one trace row per orchestration slice. */
export function buildEcologyRuntimeTraces(
  slices: EcologicalOrchestrationPass["slices"],
  ranAt: string,
): EcologyRuntimeTrace[] {
  return slices.map((slice) => ({
    stageId: slice.stageId,
    label: slice.label,
    index: slice.index,
    status: slice.status,
    at: ranAt,
  }));
}
