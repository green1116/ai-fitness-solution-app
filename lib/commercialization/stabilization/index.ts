/**
 * V3.7 Final stabilization — consolidation / freeze boundary / regression / release readiness
 */

export {
  V37_STABILIZATION_FOUNDATION_VERSION,
  runCommercialV37StabilizationFoundation,
  formatConsolidationReadyHook,
  formatFreezeBoundaryReadyHook,
  formatRegressionBaselineReadyHook,
  formatStabilizationReleaseReadyHook,
  formatStabilizationSurfaceReadyHook,
  type CommercialV37StabilizationFoundationInput,
  type CommercialV37StabilizationFoundationResult,
} from "./stabilization-surface-summary";

export {
  CONSOLIDATION_SUMMARY_VERSION,
  buildConsolidationSummary,
  type ConsolidationSummary,
} from "./consolidation-summary";

export {
  FREEZE_BOUNDARY_SUMMARY_VERSION,
  buildFreezeBoundarySummary,
  type FreezeBoundarySummary,
} from "./freeze-boundary-summary";

export {
  REGRESSION_BASELINE_SUMMARY_VERSION,
  buildRegressionBaselineSummary,
  type RegressionBaselineSummary,
} from "./regression-baseline-summary";

export {
  STABILIZATION_RELEASE_READINESS_VERSION,
  buildStabilizationReleaseReadiness,
  type StabilizationReleaseReadiness,
} from "./stabilization-release-readiness";

export {
  MAINTAINABILITY_SUMMARY_VERSION,
  buildMaintainabilitySummary,
  type MaintainabilitySummary,
} from "./maintainability-summary";

export {
  BUILD_FREEZE_VERSION,
  BUILD_FREEZE_MANIFEST,
  formatBuildFreezeSummary,
  type BuildFreezeManifest,
} from "./build-freeze";
