/**
 * V70 P5 — Upgrade governance builder (read-only)
 */
import { buildVersionCompatibility } from "./compatibility.builder";
import { V70_VERSION_COMPATIBILITY_VERSION } from "./version.compatibility";
import {
  buildPostCheckManifest,
  buildPreCheckManifest,
  buildRollbackPlanManifest,
  buildUpgradePathManifest,
  buildUpgradePlanManifest,
  isUpgradeGovernanceRefsAligned,
} from "./upgrade.plan";
import type { UpgradeGovernanceReport, UpgradeGovernanceSignals } from "./upgrade.governance";
import {
  V70_UPGRADE_GOVERNANCE_FREEZE_VERSION,
  V70_UPGRADE_GOVERNANCE_VERSION,
} from "./upgrade.governance";

const DEFAULT_SIGNALS: UpgradeGovernanceSignals = {
  versionCompatibilityReady: true,
  pathsComplete: true,
  plansComplete: true,
  preChecksComplete: true,
  postChecksComplete: true,
  rollbackPlansComplete: true,
  refsAligned: true,
  freezeVersionDeclared: true,
};

export function buildUpgradeGovernance(input?: {
  deploymentId?: string;
  signals?: UpgradeGovernanceSignals;
}): UpgradeGovernanceReport {
  const deploymentId = input?.deploymentId ?? "v70-upgrade-governance-default";

  const versionCompatibility = buildVersionCompatibility({ deploymentId });
  const paths = buildUpgradePathManifest();
  const plans = buildUpgradePlanManifest();
  const preChecks = buildPreCheckManifest();
  const postChecks = buildPostCheckManifest();
  const rollbackPlans = buildRollbackPlanManifest();
  const refsAligned = isUpgradeGovernanceRefsAligned();

  const signals: UpgradeGovernanceSignals = {
    ...DEFAULT_SIGNALS,
    versionCompatibilityReady: versionCompatibility.compatibilityReady,
    pathsComplete: paths.catalogComplete,
    plansComplete: plans.catalogComplete,
    preChecksComplete: preChecks.catalogComplete,
    postChecksComplete: postChecks.catalogComplete,
    rollbackPlansComplete: rollbackPlans.catalogComplete,
    refsAligned,
    freezeVersionDeclared: V70_UPGRADE_GOVERNANCE_FREEZE_VERSION.length > 0,
    ...input?.signals,
  };

  const governanceReady =
    versionCompatibility.compatibilityReady &&
    paths.catalogComplete &&
    plans.catalogComplete &&
    preChecks.catalogComplete &&
    postChecks.catalogComplete &&
    rollbackPlans.catalogComplete &&
    refsAligned &&
    signals.versionCompatibilityReady !== false;

  return {
    version: V70_UPGRADE_GOVERNANCE_VERSION,
    freezeVersion: V70_UPGRADE_GOVERNANCE_FREEZE_VERSION,
    reportId: `upgrade-governance-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    versionCompatibilityVersion: V70_VERSION_COMPATIBILITY_VERSION,
    versionCompatibilityReady: versionCompatibility.compatibilityReady,
    paths,
    plans,
    preChecks,
    postChecks,
    rollbackPlans,
    governanceReady,
    readinessScore: governanceReady ? 100 : 0,
    summary: [
      `upgrade-governance ready=${governanceReady}`,
      `plans=${plans.planCount}`,
      `paths=${paths.entryCount}`,
      `preChecks=${preChecks.entryCount}`,
      `postChecks=${postChecks.entryCount}`,
      `rollbackPlans=${rollbackPlans.entryCount}`,
      `refsAligned=${refsAligned}`,
      `compatibility=${versionCompatibility.compatibilityReady}`,
    ].join(" "),
  };
}

export function assertUpgradeGovernancePass(
  report: UpgradeGovernanceReport,
): asserts report is UpgradeGovernanceReport & { governanceReady: true } {
  if (!report.governanceReady) {
    throw new Error(`V70 upgrade governance not ready: ${report.summary}`);
  }
}
