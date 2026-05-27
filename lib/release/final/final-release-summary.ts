/**
 * V3.7 FINAL —final release summary
 */

import { V37_FINAL_RELEASE_GENERATION } from "../shared";
import { buildFinalReleaseReadiness } from "./final-release-readiness";
import { buildProductionFreezeManifest } from "../freeze/freeze-manifest";

export const FINAL_RELEASE_SUMMARY_VERSION = "3.7-final-summary-1" as const;

export type FinalReleaseSummary = {
  version: typeof FINAL_RELEASE_SUMMARY_VERSION;
  summaryId: string;
  generation: typeof V37_FINAL_RELEASE_GENERATION;
  freezeId: string;
  readiness: ReturnType<typeof buildFinalReleaseReadiness>;
  productionReady: boolean;
  summary: string;
};

export function buildFinalReleaseSummary(input?: { deploymentId?: string }): FinalReleaseSummary {
  const deploymentId = input?.deploymentId ?? "final-summary";
  const summaryId = `FRS-V37FINAL-${deploymentId.slice(0, 8)}`;
  const freeze = buildProductionFreezeManifest({ deploymentId });
  const readiness = buildFinalReleaseReadiness({ deploymentId });

  const productionReady =
    freeze.integrityState === "sealed" &&
    readiness.confidenceScore >= 80 &&
    readiness.preservationReadiness;

  return {
    version: FINAL_RELEASE_SUMMARY_VERSION,
    summaryId,
    generation: V37_FINAL_RELEASE_GENERATION,
    freezeId: freeze.freezeId,
    readiness,
    productionReady,
    summary: `final-release-summary id=${summaryId} generation=${V37_FINAL_RELEASE_GENERATION} productionReady=${productionReady} confidence=${readiness.confidenceScore}`,
  };
}
