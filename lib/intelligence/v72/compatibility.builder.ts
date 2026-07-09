/**
 * V72 P4 — Intelligence compatibility builder (read-only)
 */
import {
  buildCompatibilityConstraintManifest,
  buildCompatibilityMatrix,
  buildVersionPairManifest,
  isIntelligenceCompatibilityRefsAligned,
} from "./compatibility.matrix";
import { buildIntelligencePolicy } from "./policy.builder";
import { V72_INTELLIGENCE_POLICY_VERSION } from "./intelligence.policy";
import type {
  IntelligenceCompatibilityReport,
  IntelligenceCompatibilitySignals,
} from "./intelligence.compatibility";
import {
  V72_INTELLIGENCE_COMPATIBILITY_FREEZE_VERSION,
  V72_INTELLIGENCE_COMPATIBILITY_VERSION,
} from "./intelligence.compatibility";

const DEFAULT_SIGNALS: IntelligenceCompatibilitySignals = {
  intelligencePolicyReady: true,
  pairsComplete: true,
  constraintsComplete: true,
  matrixComplete: true,
  refsAligned: true,
  freezeVersionDeclared: true,
};

export function buildIntelligenceCompatibility(input?: {
  deploymentId?: string;
  signals?: IntelligenceCompatibilitySignals;
}): IntelligenceCompatibilityReport {
  const deploymentId = input?.deploymentId ?? "v72-intelligence-compatibility-default";

  const intelligencePolicy = buildIntelligencePolicy({ deploymentId });
  const pairs = buildVersionPairManifest();
  const constraints = buildCompatibilityConstraintManifest();
  const matrix = buildCompatibilityMatrix();
  const refsAligned = isIntelligenceCompatibilityRefsAligned();

  const signals: IntelligenceCompatibilitySignals = {
    ...DEFAULT_SIGNALS,
    intelligencePolicyReady: intelligencePolicy.policyReady,
    pairsComplete: pairs.catalogComplete,
    constraintsComplete: constraints.catalogComplete,
    matrixComplete: matrix.matrixComplete,
    refsAligned,
    freezeVersionDeclared: V72_INTELLIGENCE_COMPATIBILITY_FREEZE_VERSION.length > 0,
    ...input?.signals,
  };

  const compatibilityReady =
    intelligencePolicy.policyReady &&
    pairs.catalogComplete &&
    constraints.catalogComplete &&
    matrix.matrixComplete &&
    refsAligned &&
    signals.intelligencePolicyReady !== false;

  return {
    version: V72_INTELLIGENCE_COMPATIBILITY_VERSION,
    freezeVersion: V72_INTELLIGENCE_COMPATIBILITY_FREEZE_VERSION,
    reportId: `intelligence-compatibility-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    intelligencePolicyVersion: V72_INTELLIGENCE_POLICY_VERSION,
    intelligencePolicyReady: intelligencePolicy.policyReady,
    pairs,
    constraints,
    matrix,
    compatibilityReady,
    readinessScore: compatibilityReady ? 100 : 0,
    summary: [
      `intelligence-compatibility ready=${compatibilityReady}`,
      `pairs=${pairs.pairCount}`,
      `constraints=${constraints.entryCount}`,
      `matrix=${matrix.rowCount}`,
      `compatible=${matrix.compatibleCount}`,
      `refsAligned=${refsAligned}`,
      `policy=${intelligencePolicy.policyReady}`,
    ].join(" "),
  };
}

export function assertIntelligenceCompatibilityPass(
  report: IntelligenceCompatibilityReport,
): asserts report is IntelligenceCompatibilityReport & { compatibilityReady: true } {
  if (!report.compatibilityReady) {
    throw new Error(`V72 intelligence compatibility not ready: ${report.summary}`);
  }
}
