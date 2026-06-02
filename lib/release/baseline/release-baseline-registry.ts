/**
 * V3.7 FINAL —release baseline registry
 */

import { V37_ENTERPRISE_LAYER_VERSIONS, V37_FINAL_RELEASE_GENERATION } from "../shared";

export const RELEASE_BASELINE_REGISTRY_VERSION = "3.7-final-baseline-registry-1" as const;

export type BaselineRegistryEntry = {
  id: string;
  label: string;
  version: string;
  generation: typeof V37_FINAL_RELEASE_GENERATION;
  registered: boolean;
};

export type ReleaseBaselineRegistry = {
  version: typeof RELEASE_BASELINE_REGISTRY_VERSION;
  registryId: string;
  entries: BaselineRegistryEntry[];
  registeredCount: number;
  summary: string;
};

const REGISTRY_LABELS: Record<keyof typeof V37_ENTERPRISE_LAYER_VERSIONS, string> = {
  landing: "Enterprise Landing",
  rolloutReadiness: "Rollout Readiness",
  rollout: "Launch Checklist",
  goLive: "Go-Live Control",
  launchClosure: "Launch Closure",
  archival: "Archival",
  retention: "Retention Review",
  lifecycle: "Lifecycle Continuity",
  preservationClosure: "Preservation Closure",
};

export function buildReleaseBaselineRegistry(input?: { deploymentId?: string }): ReleaseBaselineRegistry {
  const deploymentId = input?.deploymentId ?? "baseline-registry";
  const registryId = `RBR-V37FINAL-${deploymentId.slice(0, 8)}`;

  const entries: BaselineRegistryEntry[] = Object.entries(V37_ENTERPRISE_LAYER_VERSIONS).map(([id, version]) => ({
    id,
    label: REGISTRY_LABELS[id as keyof typeof V37_ENTERPRISE_LAYER_VERSIONS],
    version,
    generation: V37_FINAL_RELEASE_GENERATION,
    registered: true,
  }));

  entries.push({
    id: "production-freeze",
    label: "Production Freeze FINAL",
    version: "3.7-final-freeze-1",
    generation: V37_FINAL_RELEASE_GENERATION,
    registered: true,
  });

  return {
    version: RELEASE_BASELINE_REGISTRY_VERSION,
    registryId,
    entries,
    registeredCount: entries.length,
    summary: `baseline-registry id=${registryId} entries=${entries.length} generation=${V37_FINAL_RELEASE_GENERATION}`,
  };
}
