/**
 * V70 P3 — Release policy builder (read-only)
 */
import { buildReleaseDependency } from "./dependency.builder";
import { V70_RELEASE_DEPENDENCY_VERSION } from "./release.dependency";
import {
  buildAuditTrailManifest,
  buildPolicyExceptionManifest,
  buildPolicyRuleManifest,
  buildRequiredCheckManifest,
  isReleasePolicyRefsAligned,
} from "./policy.rules";
import type { ReleasePolicyReport, ReleasePolicySignals } from "./release.policy";
import {
  V70_RELEASE_POLICY_FREEZE_VERSION,
  V70_RELEASE_POLICY_VERSION,
} from "./release.policy";

const DEFAULT_SIGNALS: ReleasePolicySignals = {
  releaseDependencyReady: true,
  rulesComplete: true,
  checksComplete: true,
  exceptionsComplete: true,
  auditTrailsComplete: true,
  refsAligned: true,
  freezeVersionDeclared: true,
};

export function buildReleasePolicy(input?: {
  deploymentId?: string;
  signals?: ReleasePolicySignals;
}): ReleasePolicyReport {
  const deploymentId = input?.deploymentId ?? "v70-release-policy-default";

  const releaseDependency = buildReleaseDependency({ deploymentId });
  const rules = buildPolicyRuleManifest();
  const requiredChecks = buildRequiredCheckManifest();
  const exceptions = buildPolicyExceptionManifest();
  const auditTrails = buildAuditTrailManifest();
  const refsAligned = isReleasePolicyRefsAligned();

  const signals: ReleasePolicySignals = {
    ...DEFAULT_SIGNALS,
    releaseDependencyReady: releaseDependency.dependencyReady,
    rulesComplete: rules.catalogComplete,
    checksComplete: requiredChecks.catalogComplete,
    exceptionsComplete: exceptions.catalogComplete,
    auditTrailsComplete: auditTrails.catalogComplete,
    refsAligned,
    freezeVersionDeclared: V70_RELEASE_POLICY_FREEZE_VERSION.length > 0,
    ...input?.signals,
  };

  const policyReady =
    releaseDependency.dependencyReady &&
    rules.catalogComplete &&
    requiredChecks.catalogComplete &&
    exceptions.catalogComplete &&
    auditTrails.catalogComplete &&
    refsAligned &&
    signals.releaseDependencyReady !== false;

  return {
    version: V70_RELEASE_POLICY_VERSION,
    freezeVersion: V70_RELEASE_POLICY_FREEZE_VERSION,
    reportId: `release-policy-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    releaseDependencyVersion: V70_RELEASE_DEPENDENCY_VERSION,
    releaseDependencyReady: releaseDependency.dependencyReady,
    rules,
    requiredChecks,
    exceptions,
    auditTrails,
    policyReady,
    readinessScore: policyReady ? 100 : 0,
    summary: [
      `release-policy ready=${policyReady}`,
      `rules=${rules.ruleCount}`,
      `checks=${requiredChecks.entryCount}`,
      `exceptions=${exceptions.entryCount}`,
      `audits=${auditTrails.entryCount}`,
      `refsAligned=${refsAligned}`,
      `dependency=${releaseDependency.dependencyReady}`,
    ].join(" "),
  };
}

export function assertReleasePolicyPass(
  report: ReleasePolicyReport,
): asserts report is ReleasePolicyReport & { policyReady: true } {
  if (!report.policyReady) {
    throw new Error(`V70 release policy not ready: ${report.summary}`);
  }
}
