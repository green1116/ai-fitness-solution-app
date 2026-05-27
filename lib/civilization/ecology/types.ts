/**
 * V3.4-E27-A civilization ecology runtime types (compat entry).
 */

import type { EcologicalOrchestrationPass } from "./adaptation";
import type { EcologyRuntimeIntelligence } from "./intelligence";
import type { EcologyRuntimeTrace } from "./traces";

export type EcologySignals = Record<string, number | undefined>;

/** Minimal ecology engine input consumed by engine.ts. */
export type EcologyRuntimeInput = {
  civilizationId: string;
  signals?: EcologySignals;
};

/** Minimal ecology engine result shape returned by runCivilizationEcologyEngine. */
export type CivilizationEcologyRuntimeResult = {
  version: string;
  civilizationId: string;
  traceId: string;
  correlationId: string;
  ranAt: string;
  ecologyIndex: number;
  ecologicalState: string;
  slices: EcologicalOrchestrationPass["slices"];
  traces: EcologyRuntimeTrace[];
  intelligence: EcologyRuntimeIntelligence;
  debug: {
    summary: string;
    skeleton: true;
  };
};
