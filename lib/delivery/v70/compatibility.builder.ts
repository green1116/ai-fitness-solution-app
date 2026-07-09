/**
 * V70 P4 — Version compatibility builder (read-only)
 */
import {
  buildCompatibilityConstraintManifest,
  buildCompatibilityMatrix,
  buildVersionPairManifest,
  isVersionCompatibilityRefsAligned,
} from "./compatibility.matrix";
import { buildReleasePolicy } from "./policy.builder";
import { V70_RELEASE_POLICY_VERSION } from "./release.policy";
import type {
  VersionCompatibilityReport,
  VersionCompatibilitySignals,
} from "./version.compatibility";
import {
  V70_VERSION_COMPATIBILITY_FREEZE_VERSION,
  V70_VERSION_COMPATIBILITY_VERSION,
} from "./version.compatibility";

const DEFAULT_SIGNALS: VersionCompatibilitySignals = {
  releasePolicyReady: true,
  pairsComplete: true,
  constraintsComplete: true,
  matrixComplete: true,
  refsAligned: true,
  freezeVersionDeclared: true,
};

export function buildVersionCompatibility(input?: {
  deploymentId?: string;
  signals?: VersionCompatibilitySignals;
}): VersionCompatibilityReport {
  const deploymentId = input?.deploymentId ?? "v70-version-compatibility-default";

  const releasePolicy = buildReleasePolicy({ deploymentId });
  const pairs = buildVersionPairManifest();
  const constraints = buildCompatibilityConstraintManifest();
  const matrix = buildCompatibilityMatrix();
  const refsAligned = isVersionCompatibilityRefsAligned();

  const signals: VersionCompatibilitySignals = {
    ...DEFAULT_SIGNALS,
    releasePolicyReady: releasePolicy.policyReady,
    pairsComplete: pairs.catalogComplete,
    constraintsComplete: constraints.catalogComplete,
    matrixComplete: matrix.matrixComplete,
    refsAligned,
    freezeVersionDeclared: V70_VERSION_COMPATIBILITY_FREEZE_VERSION.length > 0,
    ...input?.signals,
  };

  const compatibilityReady =
    releasePolicy.policyReady &&
    pairs.catalogComplete &&
    constraints.catalogComplete &&
    matrix.matrixComplete &&
    refsAligned &&
    signals.releasePolicyReady !== false;

  return {
    version: V70_VERSION_COMPATIBILITY_VERSION,
    freezeVersion: V70_VERSION_COMPATIBILITY_FREEZE_VERSION,
    reportId: `version-compatibility-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    releasePolicyVersion: V70_RELEASE_POLICY_VERSION,
    releasePolicyReady: releasePolicy.policyReady,
    pairs,
    constraints,
    matrix,
    compatibilityReady,
    readinessScore: compatibilityReady ? 100 : 0,
    summary: [
      `version-compatibility ready=${compatibilityReady}`,
      `pairs=${pairs.pairCount}`,
      `constraints=${constraints.entryCount}`,
      `matrix=${matrix.rowCount}`,
      `compatible=${matrix.compatibleCount}`,
      `refsAligned=${refsAligned}`,
      `policy=${releasePolicy.policyReady}`,
    ].join(" "),
  };
}

export function assertVersionCompatibilityPass(
  report: VersionCompatibilityReport,
): asserts report is VersionCompatibilityReport & { compatibilityReady: true } {
  if (!report.compatibilityReady) {
    throw new Error(`V70 version compatibility not ready: ${report.summary}`);
  }
}
