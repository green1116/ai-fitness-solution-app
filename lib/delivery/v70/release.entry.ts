/**
 * V70 P1 — Release catalog entry (read-only)
 */
export {
  RELEASE_CATALOG,
  buildReleaseCatalogManifest,
  getReleaseById,
  getReleasesByChannel,
  getReleasesByStage,
} from "./release.catalog";
export { assertReleaseCatalogPass, buildReleaseCatalog } from "./release.builder";
export {
  V70_RELEASE_FREEZE_VERSION,
  V70_RELEASE_VERSION,
} from "./release.types";
export type { ReleaseCatalogReport, ReleaseCatalogSignals } from "./release.types";

import { buildReleaseCatalog } from "./release.builder";
import type { ReleaseCatalogReport, ReleaseCatalogSignals } from "./release.types";

export function runReleaseCatalog(input?: {
  deploymentId?: string;
  signals?: ReleaseCatalogSignals;
}): ReleaseCatalogReport {
  return buildReleaseCatalog(input);
}

export function formatReleaseCatalogSummary(report: ReleaseCatalogReport): string {
  const lines = [
    "V70 Release Catalog",
    `  ready: ${report.catalogReady}`,
    `  score: ${report.readinessScore}/100`,
    `  version: ${report.version}`,
    `  freeze: ${report.freezeVersion}`,
    `  releases: ${report.manifest.entryCount}`,
    `  channels: ${report.manifest.channelCount}`,
    `  stages: ${report.manifest.stageCount}`,
  ];
  return lines.join("\n");
}
