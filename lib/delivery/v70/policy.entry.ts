/**
 * V70 P3 — Release policy entry (read-only)
 */
export {
  AUDIT_TRAIL_CATALOG,
  POLICY_EXCEPTION_CATALOG,
  POLICY_RULE_CATALOG,
  REQUIRED_CHECK_CATALOG,
  buildAuditTrailManifest,
  buildPolicyExceptionManifest,
  buildPolicyRuleManifest,
  buildRequiredCheckManifest,
  computeDeclarativeEnforcementBlock,
  getAuditTrailByRuleRef,
  getExceptionByRuleRef,
  getPolicyRuleById,
  getPolicyRulesByScope,
  getRequiredCheckByRuleRef,
  isReleasePolicyRefsAligned,
} from "./policy.rules";
export { assertReleasePolicyPass, buildReleasePolicy } from "./policy.builder";
export {
  V70_RELEASE_POLICY_FREEZE_VERSION,
  V70_RELEASE_POLICY_VERSION,
} from "./release.policy";
export type {
  AuditTrail,
  PolicyConstraint,
  PolicyException,
  PolicyRule,
  PolicyScope,
  ReleasePolicyReport,
  ReleasePolicySignals,
  RequiredCheck,
} from "./release.policy";

import { buildReleasePolicy } from "./policy.builder";
import type { ReleasePolicyReport, ReleasePolicySignals } from "./release.policy";

export function runReleasePolicy(input?: {
  deploymentId?: string;
  signals?: ReleasePolicySignals;
}): ReleasePolicyReport {
  return buildReleasePolicy(input);
}

export function formatReleasePolicySummary(report: ReleasePolicyReport): string {
  const lines = [
    "V70 Release Policy",
    `  ready: ${report.policyReady}`,
    `  score: ${report.readinessScore}/100`,
    `  version: ${report.version}`,
    `  freeze: ${report.freezeVersion}`,
    `  release-dependency: ${report.releaseDependencyVersion} (ready=${report.releaseDependencyReady})`,
    `  rules: ${report.rules.ruleCount}`,
    `  required checks: ${report.requiredChecks.entryCount}`,
    `  exceptions: ${report.exceptions.entryCount}`,
    `  audit trails: ${report.auditTrails.entryCount}`,
  ];
  return lines.join("\n");
}
