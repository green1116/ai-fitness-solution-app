/**
 * V3.7 FINAL —final release report
 */

import { buildFinalReleaseSummary } from "./final-release-summary";
import { buildReleaseBaselineSummary } from "../baseline/release-baseline-summary";
import { buildSnapshotManifest } from "../snapshot/snapshot-manifest";

export const FINAL_RELEASE_REPORT_VERSION = "3.7-final-report-1" as const;

export type FinalReleaseReport = {
  version: typeof FINAL_RELEASE_REPORT_VERSION;
  reportId: string;
  summary: ReturnType<typeof buildFinalReleaseSummary>;
  baseline: ReturnType<typeof buildReleaseBaselineSummary>;
  snapshots: ReturnType<typeof buildSnapshotManifest>;
  reportSummary: string;
};

export function buildFinalReleaseReport(input?: { deploymentId?: string }): FinalReleaseReport {
  const deploymentId = input?.deploymentId ?? "final-report";
  const reportId = `FRP-V37FINAL-${deploymentId.slice(0, 8)}`;
  const summary = buildFinalReleaseSummary({ deploymentId });
  const baseline = buildReleaseBaselineSummary({ deploymentId });
  const snapshots = buildSnapshotManifest({ deploymentId });

  return {
    version: FINAL_RELEASE_REPORT_VERSION,
    reportId,
    summary,
    baseline,
    snapshots,
    reportSummary: `final-release-report id=${reportId} productionReady=${summary.productionReady} baseline=${baseline.baseline.readyForProduction} snapshots=${snapshots.snapshotCount}`,
  };
}
