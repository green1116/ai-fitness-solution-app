/**
 * V72 P3 — Intelligence policy builder (read-only)
 */
import { buildSignalDependency } from "./dependency.builder";
import { V72_SIGNAL_DEPENDENCY_VERSION } from "./signal.dependency";
import {
  buildAuditTrailManifest,
  buildPolicyExceptionManifest,
  buildPolicyRuleManifest,
  buildRequiredCheckManifest,
  isIntelligencePolicyRefsAligned,
} from "./policy.rules";
import type { IntelligencePolicyReport, IntelligencePolicySignals } from "./intelligence.policy";
import {
  V72_INTELLIGENCE_POLICY_FREEZE_VERSION,
  V72_INTELLIGENCE_POLICY_VERSION,
} from "./intelligence.policy";

const DEFAULT_SIGNALS: IntelligencePolicySignals = {
  signalDependencyReady: true,
  rulesComplete: true,
  checksComplete: true,
  exceptionsComplete: true,
  auditTrailsComplete: true,
  refsAligned: true,
  freezeVersionDeclared: true,
};

export function buildIntelligencePolicy(input?: {
  deploymentId?: string;
  signals?: IntelligencePolicySignals;
}): IntelligencePolicyReport {
  const deploymentId = input?.deploymentId ?? "v72-intelligence-policy-default";

  const signalDependency = buildSignalDependency({ deploymentId });
  const rules = buildPolicyRuleManifest();
  const requiredChecks = buildRequiredCheckManifest();
  const exceptions = buildPolicyExceptionManifest();
  const auditTrails = buildAuditTrailManifest();
  const refsAligned = isIntelligencePolicyRefsAligned();

  const signals: IntelligencePolicySignals = {
    ...DEFAULT_SIGNALS,
    signalDependencyReady: signalDependency.dependencyReady,
    rulesComplete: rules.catalogComplete,
    checksComplete: requiredChecks.catalogComplete,
    exceptionsComplete: exceptions.catalogComplete,
    auditTrailsComplete: auditTrails.catalogComplete,
    refsAligned,
    freezeVersionDeclared: V72_INTELLIGENCE_POLICY_FREEZE_VERSION.length > 0,
    ...input?.signals,
  };

  const policyReady =
    signalDependency.dependencyReady &&
    rules.catalogComplete &&
    requiredChecks.catalogComplete &&
    exceptions.catalogComplete &&
    auditTrails.catalogComplete &&
    refsAligned &&
    signals.signalDependencyReady !== false;

  return {
    version: V72_INTELLIGENCE_POLICY_VERSION,
    freezeVersion: V72_INTELLIGENCE_POLICY_FREEZE_VERSION,
    reportId: `intelligence-policy-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    signalDependencyVersion: V72_SIGNAL_DEPENDENCY_VERSION,
    signalDependencyReady: signalDependency.dependencyReady,
    rules,
    requiredChecks,
    exceptions,
    auditTrails,
    policyReady,
    readinessScore: policyReady ? 100 : 0,
    summary: [
      `intelligence-policy ready=${policyReady}`,
      `rules=${rules.ruleCount}`,
      `checks=${requiredChecks.entryCount}`,
      `exceptions=${exceptions.entryCount}`,
      `audits=${auditTrails.entryCount}`,
      `refsAligned=${refsAligned}`,
      `dependency=${signalDependency.dependencyReady}`,
    ].join(" "),
  };
}

export function assertIntelligencePolicyPass(
  report: IntelligencePolicyReport,
): asserts report is IntelligencePolicyReport & { policyReady: true } {
  if (!report.policyReady) {
    throw new Error(`V72 intelligence policy not ready: ${report.summary}`);
  }
}
