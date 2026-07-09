/**
 * V70 P6 — Lifecycle management entry (read-only)
 */
export {
  LIFECYCLE_STATE_CATALOG,
  LIFECYCLE_TRANSITION_CATALOG,
  SUPPORT_POLICY_CATALOG,
  buildLifecycleStateManifest,
  buildLifecycleTransitionManifest,
  buildSupportPolicyManifest,
  computeDeclarativeLifecycleTerminal,
  getLifecycleStateById,
  getLifecycleStateByReleaseRef,
  getLifecycleStatesByKind,
  getSupportPolicyById,
  getTransitionsByReleaseRef,
  isLifecycleManagementRefsAligned,
} from "./lifecycle.states";
export {
  assertLifecycleManagementPass,
  buildLifecycleManagement,
} from "./lifecycle.builder";
export {
  V70_LIFECYCLE_MANAGEMENT_FREEZE_VERSION,
  V70_LIFECYCLE_MANAGEMENT_VERSION,
} from "./lifecycle.management";
export type {
  LifecycleManagementReport,
  LifecycleManagementSignals,
  LifecycleState,
  LifecycleTransition,
  SupportPolicy,
} from "./lifecycle.management";

import { buildLifecycleManagement } from "./lifecycle.builder";
import type {
  LifecycleManagementReport,
  LifecycleManagementSignals,
} from "./lifecycle.management";

export function runLifecycleManagement(input?: {
  deploymentId?: string;
  signals?: LifecycleManagementSignals;
}): LifecycleManagementReport {
  return buildLifecycleManagement(input);
}

export function formatLifecycleManagementSummary(
  report: LifecycleManagementReport,
): string {
  const lines = [
    "V70 Lifecycle Management",
    `  ready: ${report.managementReady}`,
    `  score: ${report.readinessScore}/100`,
    `  version: ${report.version}`,
    `  freeze: ${report.freezeVersion}`,
    `  upgrade-governance: ${report.upgradeGovernanceVersion} (ready=${report.upgradeGovernanceReady})`,
    `  states: ${report.states.stateCount}`,
    `  transitions: ${report.transitions.entryCount}`,
    `  support policies: ${report.supportPolicies.entryCount}`,
  ];
  return lines.join("\n");
}
