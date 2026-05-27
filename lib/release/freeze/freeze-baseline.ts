/**
 * V3.7 FINAL —freeze baseline descriptor
 */

import { BUILD_FREEZE_MANIFEST } from "../../commercialization/stabilization/build-freeze";
import { V37_ENTERPRISE_LAYER_VERSIONS, baselineHashFromLayers, isBuildFreezeIntact } from "../shared";

export const FREEZE_BASELINE_VERSION = "3.7-final-freeze-baseline-1" as const;

export type FreezeBaselineLayer = {
  id: string;
  label: string;
  version: string;
  phase: string;
};

export type FreezeBaseline = {
  version: typeof FREEZE_BASELINE_VERSION;
  baselineId: string;
  baselineHash: string;
  buildFreezeVersion: typeof BUILD_FREEZE_MANIFEST.version;
  layers: FreezeBaselineLayer[];
  intact: boolean;
  summary: string;
};

const LAYER_LABELS: Record<keyof typeof V37_ENTERPRISE_LAYER_VERSIONS, { label: string; phase: string }> = {
  landing: { label: "Enterprise Landing H17", phase: "landing" },
  rolloutReadiness: { label: "Rollout Readiness H18", phase: "rollout" },
  rollout: { label: "Launch Checklist H19", phase: "rollout" },
  goLive: { label: "Go-Live Control H20", phase: "go-live" },
  launchClosure: { label: "Launch Closure H21", phase: "closure" },
  archival: { label: "Archival H22", phase: "archival" },
  retention: { label: "Retention H23", phase: "retention" },
  lifecycle: { label: "Lifecycle H24", phase: "lifecycle" },
  preservationClosure: { label: "Preservation Closure H25", phase: "preservation" },
};

export function buildFreezeBaseline(input?: { deploymentId?: string }): FreezeBaseline {
  const deploymentId = input?.deploymentId ?? "freeze-baseline";
  const baselineId = `FBL-V37FINAL-${deploymentId.slice(0, 8)}`;
  const layers: FreezeBaselineLayer[] = Object.entries(V37_ENTERPRISE_LAYER_VERSIONS).map(([id, version]) => ({
    id,
    label: LAYER_LABELS[id as keyof typeof V37_ENTERPRISE_LAYER_VERSIONS].label,
    version,
    phase: LAYER_LABELS[id as keyof typeof V37_ENTERPRISE_LAYER_VERSIONS].phase,
  }));

  return {
    version: FREEZE_BASELINE_VERSION,
    baselineId,
    baselineHash: baselineHashFromLayers(),
    buildFreezeVersion: BUILD_FREEZE_MANIFEST.version,
    layers,
    intact: isBuildFreezeIntact(),
    summary: `freeze-baseline id=${baselineId} layers=${layers.length} intact=${isBuildFreezeIntact()} hash=${baselineHashFromLayers()}`,
  };
}
