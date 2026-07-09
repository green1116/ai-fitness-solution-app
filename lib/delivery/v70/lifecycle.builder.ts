/**
 * V70 P6 — Lifecycle management builder (read-only)
 */
import {
  buildLifecycleStateManifest,
  buildLifecycleTransitionManifest,
  buildSupportPolicyManifest,
  isLifecycleManagementRefsAligned,
} from "./lifecycle.states";
import type {
  LifecycleManagementReport,
  LifecycleManagementSignals,
} from "./lifecycle.management";
import {
  V70_LIFECYCLE_MANAGEMENT_FREEZE_VERSION,
  V70_LIFECYCLE_MANAGEMENT_VERSION,
} from "./lifecycle.management";
import { buildUpgradeGovernance } from "./upgrade.builder";
import { V70_UPGRADE_GOVERNANCE_VERSION } from "./upgrade.governance";

const DEFAULT_SIGNALS: LifecycleManagementSignals = {
  upgradeGovernanceReady: true,
  statesComplete: true,
  transitionsComplete: true,
  supportPoliciesComplete: true,
  refsAligned: true,
  freezeVersionDeclared: true,
};

export function buildLifecycleManagement(input?: {
  deploymentId?: string;
  signals?: LifecycleManagementSignals;
}): LifecycleManagementReport {
  const deploymentId = input?.deploymentId ?? "v70-lifecycle-management-default";

  const upgradeGovernance = buildUpgradeGovernance({ deploymentId });
  const states = buildLifecycleStateManifest();
  const transitions = buildLifecycleTransitionManifest();
  const supportPolicies = buildSupportPolicyManifest();
  const refsAligned = isLifecycleManagementRefsAligned();

  const signals: LifecycleManagementSignals = {
    ...DEFAULT_SIGNALS,
    upgradeGovernanceReady: upgradeGovernance.governanceReady,
    statesComplete: states.catalogComplete,
    transitionsComplete: transitions.catalogComplete,
    supportPoliciesComplete: supportPolicies.catalogComplete,
    refsAligned,
    freezeVersionDeclared: V70_LIFECYCLE_MANAGEMENT_FREEZE_VERSION.length > 0,
    ...input?.signals,
  };

  const managementReady =
    upgradeGovernance.governanceReady &&
    states.catalogComplete &&
    transitions.catalogComplete &&
    supportPolicies.catalogComplete &&
    refsAligned &&
    signals.upgradeGovernanceReady !== false;

  return {
    version: V70_LIFECYCLE_MANAGEMENT_VERSION,
    freezeVersion: V70_LIFECYCLE_MANAGEMENT_FREEZE_VERSION,
    reportId: `lifecycle-management-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    upgradeGovernanceVersion: V70_UPGRADE_GOVERNANCE_VERSION,
    upgradeGovernanceReady: upgradeGovernance.governanceReady,
    states,
    transitions,
    supportPolicies,
    managementReady,
    readinessScore: managementReady ? 100 : 0,
    summary: [
      `lifecycle-management ready=${managementReady}`,
      `states=${states.stateCount}`,
      `transitions=${transitions.entryCount}`,
      `supportPolicies=${supportPolicies.entryCount}`,
      `refsAligned=${refsAligned}`,
      `upgrade=${upgradeGovernance.governanceReady}`,
    ].join(" "),
  };
}

export function assertLifecycleManagementPass(
  report: LifecycleManagementReport,
): asserts report is LifecycleManagementReport & { managementReady: true } {
  if (!report.managementReady) {
    throw new Error(`V70 lifecycle management not ready: ${report.summary}`);
  }
}
