/**
 * V68 P6 — Reliability policy report builder (read-only)
 */
import { buildCapacityPlanningReport } from "../capacity-planning/governance.builder";
import { V68_CAPACITY_PLANNING_VERSION } from "../capacity-planning/governance.types";

import { isReliabilityPolicyRefsAligned } from "./alignment.catalog";
import { buildDegradationStrategyManifest } from "./degradation.strategy.catalog";
import { buildFailureSeverityManifest } from "./failure.severity.catalog";
import type { ReliabilityPolicyReport, ReliabilityPolicySignals } from "./governance.types";
import { V68_RELIABILITY_POLICY_VERSION } from "./governance.types";
import { buildRecoveryStrategyManifest } from "./recovery.strategy.catalog";
import { buildReliabilityObjectiveManifest } from "./reliability.objective.catalog";

const DEFAULT_SIGNALS: ReliabilityPolicySignals = {
  capacityPlanningReady: true,
  objectiveCatalogComplete: true,
  failureSeverityComplete: true,
  degradationStrategyComplete: true,
  recoveryStrategyComplete: true,
  refsAligned: true,
};

export function buildReliabilityPolicyReport(input?: {
  deploymentId?: string;
  signals?: ReliabilityPolicySignals;
}): ReliabilityPolicyReport {
  const deploymentId = input?.deploymentId ?? "v68-reliability-policy-default";

  const capacity = buildCapacityPlanningReport({ deploymentId });
  const objectives = buildReliabilityObjectiveManifest();
  const failureSeverities = buildFailureSeverityManifest();
  const degradationStrategies = buildDegradationStrategyManifest();
  const recoveryStrategies = buildRecoveryStrategyManifest();
  const refsAligned = isReliabilityPolicyRefsAligned();

  const signals: ReliabilityPolicySignals = {
    ...DEFAULT_SIGNALS,
    capacityPlanningReady: capacity.planningReady,
    objectiveCatalogComplete: objectives.catalogComplete,
    failureSeverityComplete: failureSeverities.catalogComplete,
    degradationStrategyComplete: degradationStrategies.catalogComplete,
    recoveryStrategyComplete: recoveryStrategies.catalogComplete,
    refsAligned,
    ...input?.signals,
  };

  const policyReady =
    capacity.planningReady &&
    objectives.catalogComplete &&
    failureSeverities.catalogComplete &&
    degradationStrategies.catalogComplete &&
    recoveryStrategies.catalogComplete &&
    refsAligned &&
    signals.capacityPlanningReady !== false;

  return {
    version: V68_RELIABILITY_POLICY_VERSION,
    reportId: `reliability-policy-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    capacityPlanningVersion: V68_CAPACITY_PLANNING_VERSION,
    capacityPlanningReady: capacity.planningReady,
    objectives,
    failureSeverities,
    degradationStrategies,
    recoveryStrategies,
    policyReady,
    readinessScore: policyReady ? 100 : 0,
    summary: [
      `reliability-policy ready=${policyReady}`,
      `objectives=${objectives.entryCount}`,
      `severities=${failureSeverities.entryCount}`,
      `degradation=${degradationStrategies.entryCount}`,
      `recovery=${recoveryStrategies.entryCount}`,
      `refsAligned=${refsAligned}`,
    ].join(" "),
  };
}

export function assertReliabilityPolicyPass(
  report: ReliabilityPolicyReport,
): asserts report is ReliabilityPolicyReport & { policyReady: true } {
  if (!report.policyReady) {
    throw new Error(`V68 reliability policy not ready: ${report.summary}`);
  }
}
