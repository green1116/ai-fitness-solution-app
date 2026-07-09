/**
 * V70 P4 — Version compatibility entry (read-only)
 */
export {
  COMPATIBILITY_CONSTRAINT_CATALOG,
  VERSION_PAIR_CATALOG,
  buildCompatibilityConstraintManifest,
  buildCompatibilityMatrix,
  buildVersionPairManifest,
  computeDeclarativeCompatibilityPass,
  getCompatibilityConstraintById,
  getVersionPairById,
  getVersionPairsBySourceRef,
  isVersionCompatibilityRefsAligned,
} from "./compatibility.matrix";
export {
  assertVersionCompatibilityPass,
  buildVersionCompatibility,
} from "./compatibility.builder";
export {
  V70_VERSION_COMPATIBILITY_FREEZE_VERSION,
  V70_VERSION_COMPATIBILITY_VERSION,
} from "./version.compatibility";
export type {
  CompatibilityConstraint,
  CompatibilityMatrix,
  VersionCompatibilityReport,
  VersionCompatibilitySignals,
  VersionPair,
} from "./version.compatibility";

import { buildVersionCompatibility } from "./compatibility.builder";
import type {
  VersionCompatibilityReport,
  VersionCompatibilitySignals,
} from "./version.compatibility";

export function runVersionCompatibility(input?: {
  deploymentId?: string;
  signals?: VersionCompatibilitySignals;
}): VersionCompatibilityReport {
  return buildVersionCompatibility(input);
}

export function formatVersionCompatibilitySummary(
  report: VersionCompatibilityReport,
): string {
  const lines = [
    "V70 Version Compatibility",
    `  ready: ${report.compatibilityReady}`,
    `  score: ${report.readinessScore}/100`,
    `  version: ${report.version}`,
    `  freeze: ${report.freezeVersion}`,
    `  release-policy: ${report.releasePolicyVersion} (ready=${report.releasePolicyReady})`,
    `  pairs: ${report.pairs.pairCount}`,
    `  constraints: ${report.constraints.entryCount}`,
    `  matrix rows: ${report.matrix.rowCount}`,
    `  compatible: ${report.matrix.compatibleCount}`,
    `  incompatible: ${report.matrix.incompatibleCount}`,
  ];
  return lines.join("\n");
}
