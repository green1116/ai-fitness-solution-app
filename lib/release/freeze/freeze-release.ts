/**
 * V3.7 FINAL —freeze release descriptor
 */

import { V37_FINAL_RELEASE_GENERATION, V37_ENTERPRISE_LAYER_VERSIONS } from "../shared";
import { buildFreezeBaseline } from "./freeze-baseline";

export const FREEZE_RELEASE_VERSION = "3.7-final-freeze-release-1" as const;

export type FreezeReleaseEntry = {
  id: string;
  generation: string;
  layerVersion: string;
  phase: string;
};

export type FreezeReleaseDescriptor = {
  version: typeof FREEZE_RELEASE_VERSION;
  releaseId: string;
  generation: typeof V37_FINAL_RELEASE_GENERATION;
  entries: FreezeReleaseEntry[];
  chronology: string[];
  summary: string;
};

export function buildFreezeReleaseDescriptor(input?: { deploymentId?: string }): FreezeReleaseDescriptor {
  const deploymentId = input?.deploymentId ?? "freeze-release";
  const releaseId = `FRL-V37FINAL-${deploymentId.slice(0, 8)}`;
  const baseline = buildFreezeBaseline({ deploymentId });

  const entries: FreezeReleaseEntry[] = baseline.layers.map((layer) => ({
    id: layer.id,
    generation: V37_FINAL_RELEASE_GENERATION,
    layerVersion: layer.version,
    phase: layer.phase,
  }));

  entries.push({
    id: "final-freeze",
    generation: V37_FINAL_RELEASE_GENERATION,
    layerVersion: "3.7-final-freeze-1",
    phase: "freeze",
  });

  const chronology = [
    ...Object.keys(V37_ENTERPRISE_LAYER_VERSIONS),
    "production-freeze",
  ];

  return {
    version: FREEZE_RELEASE_VERSION,
    releaseId,
    generation: V37_FINAL_RELEASE_GENERATION,
    entries,
    chronology,
    summary: `freeze-release id=${releaseId} generation=${V37_FINAL_RELEASE_GENERATION} entries=${entries.length}`,
  };
}
