/**
 * V72 P3 — Intelligence policy entry (read-only)
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
  isIntelligencePolicyRefsAligned,
} from "./policy.rules";
export { assertIntelligencePolicyPass, buildIntelligencePolicy } from "./policy.builder";
export {
  V72_INTELLIGENCE_POLICY_FREEZE_VERSION,
  V72_INTELLIGENCE_POLICY_VERSION,
} from "./intelligence.policy";
export type {
  AuditTrail,
  IntelligencePolicyReport,
  IntelligencePolicySignals,
  PolicyConstraint,
  PolicyException,
  PolicyRule,
  PolicyScope,
  RequiredCheck,
} from "./intelligence.policy";

import { buildIntelligencePolicy } from "./policy.builder";
import type { IntelligencePolicyReport, IntelligencePolicySignals } from "./intelligence.policy";

export function runIntelligencePolicy(input?: {
  deploymentId?: string;
  signals?: IntelligencePolicySignals;
}): IntelligencePolicyReport {
  return buildIntelligencePolicy(input);
}

export function formatIntelligencePolicySummary(report: IntelligencePolicyReport): string {
  const lines = [
    "V72 Intelligence Policy",
    `  ready: ${report.policyReady}`,
    `  score: ${report.readinessScore}/100`,
    `  version: ${report.version}`,
    `  freeze: ${report.freezeVersion}`,
    `  signal-dependency: ${report.signalDependencyVersion} (ready=${report.signalDependencyReady})`,
    `  rules: ${report.rules.ruleCount}`,
    `  required checks: ${report.requiredChecks.entryCount}`,
    `  exceptions: ${report.exceptions.entryCount}`,
    `  audit trails: ${report.auditTrails.entryCount}`,
  ];
  return lines.join("\n");
}
