import type { EQUIPMENT_SELECTION_VERSION } from "../shared/types";

export const COMPATIBILITY_RUNTIME_VERSION = "v19.3-compatibility-1" as const;

export interface CompatibilitySnapshot {
  snapshotId: string;
  categoryCoverage: number;
  quantityCoverage: number;
  requirementCoverage: number;
  compatibilityScore: number;
}

export interface CompatibilityRuntimePayload {
  version: typeof COMPATIBILITY_RUNTIME_VERSION;
  selectionVersion: typeof EQUIPMENT_SELECTION_VERSION;
  snapshot: CompatibilitySnapshot;
  compatibilityScore: number;
  summary: string;
}
