/**
 * V72 P4 — Intelligence compatibility entry (read-only)
 */
export {
  COMPATIBILITY_CONSTRAINT_CATALOG,
  INTELLIGENCE_VERSION_PAIR_CATALOG,
  buildCompatibilityConstraintManifest,
  buildCompatibilityMatrix,
  buildVersionPairManifest,
  computeDeclarativeCompatibilityPass,
  getCompatibilityConstraintById,
  getVersionPairById,
  getVersionPairsBySourceRef,
  isIntelligenceCompatibilityRefsAligned,
} from "./compatibility.matrix";
export {
  assertIntelligenceCompatibilityPass,
  buildIntelligenceCompatibility,
} from "./compatibility.builder";
export {
  V72_INTELLIGENCE_COMPATIBILITY_FREEZE_VERSION,
  V72_INTELLIGENCE_COMPATIBILITY_VERSION,
} from "./intelligence.compatibility";
export type {
  Constraint,
  IntelligenceCompatibilityReport,
  IntelligenceCompatibilitySignals,
  Matrix,
  VersionPair,
} from "./intelligence.compatibility";

import { buildIntelligenceCompatibility } from "./compatibility.builder";
import type {
  IntelligenceCompatibilityReport,
  IntelligenceCompatibilitySignals,
} from "./intelligence.compatibility";

export function runIntelligenceCompatibility(input?: {
  deploymentId?: string;
  signals?: IntelligenceCompatibilitySignals;
}): IntelligenceCompatibilityReport {
  return buildIntelligenceCompatibility(input);
}

export function formatIntelligenceCompatibilitySummary(
  report: IntelligenceCompatibilityReport,
): string {
  const lines = [
    "V72 Intelligence Compatibility",
    `  ready: ${report.compatibilityReady}`,
    `  score: ${report.readinessScore}/100`,
    `  version: ${report.version}`,
    `  freeze: ${report.freezeVersion}`,
    `  intelligence-policy: ${report.intelligencePolicyVersion} (ready=${report.intelligencePolicyReady})`,
    `  pairs: ${report.pairs.pairCount}`,
    `  constraints: ${report.constraints.entryCount}`,
    `  matrix rows: ${report.matrix.rowCount}`,
    `  compatible: ${report.matrix.compatibleCount}`,
    `  incompatible: ${report.matrix.incompatibleCount}`,
  ];
  return lines.join("\n");
}
