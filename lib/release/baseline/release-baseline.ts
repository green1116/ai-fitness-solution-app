/**
 * V3.7 FINAL —release baseline descriptor
 */

import { V37_FINAL_RELEASE_GENERATION, baselineHashFromLayers } from "../shared";
import { buildFreezeBaseline } from "../freeze/freeze-baseline";
import { getEnterpriseStackSnapshot } from "../release-context";

export const RELEASE_BASELINE_VERSION = "3.7-final-release-baseline-1" as const;

export type ReleaseBaseline = {
  version: typeof RELEASE_BASELINE_VERSION;
  baselineId: string;
  generation: typeof V37_FINAL_RELEASE_GENERATION;
  baselineHash: string;
  layerCount: number;
  readyForProduction: boolean;
  summary: string;
};

export function buildReleaseBaseline(input?: { deploymentId?: string }): ReleaseBaseline {
  const deploymentId = input?.deploymentId ?? "release-baseline";
  const baselineId = `RBL-V37FINAL-${deploymentId.slice(0, 8)}`;
  const freeze = buildFreezeBaseline({ deploymentId });
  const stack = getEnterpriseStackSnapshot(deploymentId);

  return {
    version: RELEASE_BASELINE_VERSION,
    baselineId,
    generation: V37_FINAL_RELEASE_GENERATION,
    baselineHash: baselineHashFromLayers(),
    layerCount: freeze.layers.length,
    readyForProduction: freeze.intact && stack.manifest.readyForEnterprise,
    summary: `release-baseline id=${baselineId} generation=${V37_FINAL_RELEASE_GENERATION} layers=${freeze.layers.length} ready=${freeze.intact && stack.manifest.readyForEnterprise}`,
  };
}
