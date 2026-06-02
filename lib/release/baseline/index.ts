/**
 * V3.7 FINAL Release Baseline Layer
 */

export {
  RELEASE_BASELINE_VERSION,
  buildReleaseBaseline,
  type ReleaseBaseline,
} from "./release-baseline";

export {
  RELEASE_BASELINE_REGISTRY_VERSION,
  buildReleaseBaselineRegistry,
  type ReleaseBaselineRegistry,
  type BaselineRegistryEntry,
} from "./release-baseline-registry";

export {
  RELEASE_BASELINE_ARCHIVE_VERSION,
  buildReleaseBaselineArchive,
  type ReleaseBaselineArchive,
  type BaselineArchiveRecord,
} from "./release-baseline-archive";

export {
  RELEASE_BASELINE_HISTORY_VERSION,
  buildReleaseBaselineHistory,
  type ReleaseBaselineHistory,
  type BaselineHistoryNode,
} from "./release-baseline-history";

export {
  RELEASE_BASELINE_SUMMARY_VERSION,
  buildReleaseBaselineSummary,
  type ReleaseBaselineSummaryBundle,
} from "./release-baseline-summary";
