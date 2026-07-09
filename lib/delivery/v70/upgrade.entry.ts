/**
 * V70 P5 — Upgrade governance entry (read-only)
 */
export {
  POST_CHECK_CATALOG,
  PRE_CHECK_CATALOG,
  ROLLBACK_PLAN_CATALOG,
  UPGRADE_PATH_CATALOG,
  UPGRADE_PLAN_CATALOG,
  buildPostCheckManifest,
  buildPreCheckManifest,
  buildRollbackPlanManifest,
  buildUpgradePathManifest,
  buildUpgradePlanManifest,
  computeDeclarativeUpgradeRiskBlock,
  getPostCheckByPlanRef,
  getPreCheckByPlanRef,
  getRollbackPlanByPlanRef,
  getUpgradePathById,
  getUpgradePlanById,
  getUpgradePlansByRiskLevel,
  isUpgradeGovernanceRefsAligned,
} from "./upgrade.plan";
export { assertUpgradeGovernancePass, buildUpgradeGovernance } from "./upgrade.builder";
export {
  V70_UPGRADE_GOVERNANCE_FREEZE_VERSION,
  V70_UPGRADE_GOVERNANCE_VERSION,
} from "./upgrade.governance";
export type {
  PostCheck,
  PreCheck,
  RollbackPlan,
  UpgradeGovernanceReport,
  UpgradeGovernanceSignals,
  UpgradePath,
  UpgradePlan,
} from "./upgrade.governance";

import { buildUpgradeGovernance } from "./upgrade.builder";
import type { UpgradeGovernanceReport, UpgradeGovernanceSignals } from "./upgrade.governance";

export function runUpgradeGovernance(input?: {
  deploymentId?: string;
  signals?: UpgradeGovernanceSignals;
}): UpgradeGovernanceReport {
  return buildUpgradeGovernance(input);
}

export function formatUpgradeGovernanceSummary(report: UpgradeGovernanceReport): string {
  const lines = [
    "V70 Upgrade Governance",
    `  ready: ${report.governanceReady}`,
    `  score: ${report.readinessScore}/100`,
    `  version: ${report.version}`,
    `  freeze: ${report.freezeVersion}`,
    `  version-compatibility: ${report.versionCompatibilityVersion} (ready=${report.versionCompatibilityReady})`,
    `  upgrade plans: ${report.plans.planCount}`,
    `  upgrade paths: ${report.paths.entryCount}`,
    `  pre-checks: ${report.preChecks.entryCount}`,
    `  post-checks: ${report.postChecks.entryCount}`,
    `  rollback plans: ${report.rollbackPlans.entryCount}`,
  ];
  return lines.join("\n");
}
