/**
 * V3.7 FINAL —release baseline summary
 */

import { buildReleaseBaseline } from "./release-baseline";
import { buildReleaseBaselineHistory } from "./release-baseline-history";
import { buildReleaseBaselineArchive } from "./release-baseline-archive";
import { buildReleaseBaselineRegistry } from "./release-baseline-registry";

export const RELEASE_BASELINE_SUMMARY_VERSION = "3.7-final-baseline-summary-1" as const;

export type ReleaseBaselineSummaryBundle = {
  version: typeof RELEASE_BASELINE_SUMMARY_VERSION;
  summaryId: string;
  baseline: ReturnType<typeof buildReleaseBaseline>;
  registry: ReturnType<typeof buildReleaseBaselineRegistry>;
  archive: ReturnType<typeof buildReleaseBaselineArchive>;
  history: ReturnType<typeof buildReleaseBaselineHistory>;
  summary: string;
};

export function buildReleaseBaselineSummary(input?: { deploymentId?: string }): ReleaseBaselineSummaryBundle {
  const deploymentId = input?.deploymentId ?? "baseline-summary";
  const summaryId = `RBS-V37FINAL-${deploymentId.slice(0, 8)}`;

  const baseline = buildReleaseBaseline({ deploymentId });
  const registry = buildReleaseBaselineRegistry({ deploymentId });
  const archive = buildReleaseBaselineArchive({ deploymentId });
  const history = buildReleaseBaselineHistory({ deploymentId });

  return {
    version: RELEASE_BASELINE_SUMMARY_VERSION,
    summaryId,
    baseline,
    registry,
    archive,
    history,
    summary: `baseline-summary id=${summaryId} ready=${baseline.readyForProduction} registry=${registry.registeredCount} archive=${archive.recordCount} lineage=${history.lineage.length}`,
  };
}
