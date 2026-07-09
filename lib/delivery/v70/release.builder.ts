/**
 * V70 P1 — Release catalog builder (read-only)
 */
import { buildReleaseCatalogManifest } from "./release.catalog";
import type { ReleaseCatalogReport, ReleaseCatalogSignals } from "./release.types";
import { V70_RELEASE_FREEZE_VERSION, V70_RELEASE_VERSION } from "./release.types";

const DEFAULT_SIGNALS: ReleaseCatalogSignals = {
  catalogComplete: true,
  freezeVersionDeclared: true,
};

export function buildReleaseCatalog(input?: {
  deploymentId?: string;
  signals?: ReleaseCatalogSignals;
}): ReleaseCatalogReport {
  const deploymentId = input?.deploymentId ?? "v70-release-catalog-default";
  const manifest = buildReleaseCatalogManifest();

  const signals: ReleaseCatalogSignals = {
    ...DEFAULT_SIGNALS,
    catalogComplete: manifest.catalogComplete,
    freezeVersionDeclared: V70_RELEASE_FREEZE_VERSION.length > 0,
    ...input?.signals,
  };

  const catalogReady =
    manifest.catalogComplete &&
    signals.catalogComplete !== false &&
    signals.freezeVersionDeclared !== false;

  return {
    version: V70_RELEASE_VERSION,
    freezeVersion: V70_RELEASE_FREEZE_VERSION,
    reportId: `release-catalog-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    manifest,
    catalogReady,
    readinessScore: catalogReady ? 100 : 0,
    summary: [
      `release-catalog ready=${catalogReady}`,
      `releases=${manifest.entryCount}`,
      `channels=${manifest.channelCount}`,
      `stages=${manifest.stageCount}`,
      `freeze=${V70_RELEASE_FREEZE_VERSION}`,
    ].join(" "),
  };
}

export function assertReleaseCatalogPass(
  report: ReleaseCatalogReport,
): asserts report is ReleaseCatalogReport & { catalogReady: true } {
  if (!report.catalogReady) {
    throw new Error(`V70 release catalog not ready: ${report.summary}`);
  }
}
