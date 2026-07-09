/**
 * V68 P5 — Capacity planning report builder (read-only)
 */
import { buildFeatureFlagGovernanceReport } from "../feature-flag/governance.builder";
import { V68_FEATURE_FLAG_GOVERNANCE_VERSION } from "../feature-flag/governance.types";

import { isCapacityPlanningRefsAligned } from "./alignment.catalog";
import { buildCapacityBaselineManifest } from "./capacity.baseline.catalog";
import type { CapacityPlanningReport, CapacityPlanningSignals } from "./governance.types";
import { V68_CAPACITY_PLANNING_VERSION } from "./governance.types";
import { buildResourceLimitManifest } from "./resource.limit.catalog";
import { buildStressRiskManifest } from "./stress.risk.catalog";
import { buildThresholdDefinitionManifest } from "./threshold.definition.catalog";

const DEFAULT_SIGNALS: CapacityPlanningSignals = {
  featureFlagGovernanceReady: true,
  baselineCatalogComplete: true,
  thresholdCatalogComplete: true,
  resourceLimitComplete: true,
  stressRiskComplete: true,
  refsAligned: true,
};

export function buildCapacityPlanningReport(input?: {
  deploymentId?: string;
  signals?: CapacityPlanningSignals;
}): CapacityPlanningReport {
  const deploymentId = input?.deploymentId ?? "v68-capacity-planning-default";

  const featureFlags = buildFeatureFlagGovernanceReport({ deploymentId });
  const baselines = buildCapacityBaselineManifest();
  const thresholds = buildThresholdDefinitionManifest();
  const resourceLimits = buildResourceLimitManifest();
  const stressRisks = buildStressRiskManifest();
  const refsAligned = isCapacityPlanningRefsAligned();

  const signals: CapacityPlanningSignals = {
    ...DEFAULT_SIGNALS,
    featureFlagGovernanceReady: featureFlags.governanceReady,
    baselineCatalogComplete: baselines.catalogComplete,
    thresholdCatalogComplete: thresholds.catalogComplete,
    resourceLimitComplete: resourceLimits.catalogComplete,
    stressRiskComplete: stressRisks.catalogComplete,
    refsAligned,
    ...input?.signals,
  };

  const planningReady =
    featureFlags.governanceReady &&
    baselines.catalogComplete &&
    thresholds.catalogComplete &&
    resourceLimits.catalogComplete &&
    stressRisks.catalogComplete &&
    refsAligned &&
    signals.featureFlagGovernanceReady !== false;

  return {
    version: V68_CAPACITY_PLANNING_VERSION,
    reportId: `capacity-planning-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    featureFlagGovernanceVersion: V68_FEATURE_FLAG_GOVERNANCE_VERSION,
    featureFlagGovernanceReady: featureFlags.governanceReady,
    baselines,
    thresholds,
    resourceLimits,
    stressRisks,
    planningReady,
    readinessScore: planningReady ? 100 : 0,
    summary: [
      `capacity-planning ready=${planningReady}`,
      `baselines=${baselines.entryCount}`,
      `thresholds=${thresholds.entryCount}`,
      `limits=${resourceLimits.entryCount}`,
      `risks=${stressRisks.entryCount}`,
      `refsAligned=${refsAligned}`,
    ].join(" "),
  };
}

export function assertCapacityPlanningPass(
  report: CapacityPlanningReport,
): asserts report is CapacityPlanningReport & { planningReady: true } {
  if (!report.planningReady) {
    throw new Error(`V68 capacity planning not ready: ${report.summary}`);
  }
}
