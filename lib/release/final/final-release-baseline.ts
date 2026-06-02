/**
 * V3.7 FINAL —final release baseline anchor
 */

import { baselineHashFromLayers, V37_FINAL_RELEASE_GENERATION } from "../shared";
import { buildReleaseBaselineSummary } from "../baseline/release-baseline-summary";
import { buildProductionFreezeManifest } from "../freeze/freeze-manifest";

export const FINAL_RELEASE_BASELINE_VERSION = "3.7-final-release-baseline-1" as const;

export type FinalReleaseBaselineAnchor = {
  version: typeof FINAL_RELEASE_BASELINE_VERSION;
  anchorId: string;
  generation: typeof V37_FINAL_RELEASE_GENERATION;
  baselineHash: string;
  freezeId: string;
  baselineSummary: ReturnType<typeof buildReleaseBaselineSummary>;
  anchored: boolean;
  summary: string;
};

export function buildFinalReleaseBaselineAnchor(input?: { deploymentId?: string }): FinalReleaseBaselineAnchor {
  const deploymentId = input?.deploymentId ?? "final-baseline";
  const anchorId = `FBA-V37FINAL-${deploymentId.slice(0, 8)}`;
  const freeze = buildProductionFreezeManifest({ deploymentId });
  const baselineSummary = buildReleaseBaselineSummary({ deploymentId });

  const anchored = freeze.integrityState === "sealed" && baselineSummary.baseline.readyForProduction;

  return {
    version: FINAL_RELEASE_BASELINE_VERSION,
    anchorId,
    generation: V37_FINAL_RELEASE_GENERATION,
    baselineHash: baselineHashFromLayers(),
    freezeId: freeze.freezeId,
    baselineSummary,
    anchored,
    summary: `final-release-baseline id=${anchorId} anchored=${anchored} hash=${baselineHashFromLayers()}`,
  };
}
