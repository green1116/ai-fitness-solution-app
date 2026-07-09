/**
 * V80 CODE P4 — Release entry
 */
export { assertCodeReleasePass, buildCodeRelease } from "./release.builder";
export { RELEASE_OPS_REGISTRY, getReleaseOpsByKind } from "./release.registry";
export { V80_CODE_RELEASE_FREEZE_VERSION, V80_CODE_RELEASE_VERSION } from "./release.types";
export type { ReleaseReport } from "./release.types";

import { buildCodeRelease } from "./release.builder";
import type { ReleaseReport } from "./release.types";

export function runCodeRelease(input?: { deploymentId?: string }): ReleaseReport {
  return buildCodeRelease(input);
}

export function formatCodeReleaseSummary(report: ReleaseReport): string {
  return [
    "V80 CODE Release",
    `  ready: ${report.releaseReady}`,
    `  score: ${report.readinessScore}/100`,
    `  hardened: ${report.hardenedReady}`,
    `  production: ${report.productionReady}`,
    `  deployment: ${report.manifest.deploymentBindings}`,
    `  commercial gates: ${report.manifest.commercialGates}`,
  ].join("\n");
}
