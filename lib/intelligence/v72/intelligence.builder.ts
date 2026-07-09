/**
 * V72 P1 — Intelligence catalog builder (read-only)
 */
import { buildIntelligenceCatalogManifest } from "./intelligence.catalog";
import type { IntelligenceCatalogReport, IntelligenceCatalogSignals } from "./intelligence.types";
import { V72_INTELLIGENCE_FREEZE_VERSION, V72_INTELLIGENCE_VERSION } from "./intelligence.types";

const DEFAULT_SIGNALS: IntelligenceCatalogSignals = {
  catalogComplete: true,
  freezeVersionDeclared: true,
};

export function buildIntelligenceCatalog(input?: {
  deploymentId?: string;
  signals?: IntelligenceCatalogSignals;
}): IntelligenceCatalogReport {
  const deploymentId = input?.deploymentId ?? "v72-intelligence-catalog-default";
  const manifest = buildIntelligenceCatalogManifest();

  const signals: IntelligenceCatalogSignals = {
    ...DEFAULT_SIGNALS,
    catalogComplete: manifest.catalogComplete,
    freezeVersionDeclared: V72_INTELLIGENCE_FREEZE_VERSION.length > 0,
    ...input?.signals,
  };

  const catalogReady =
    manifest.catalogComplete &&
    signals.catalogComplete !== false &&
    signals.freezeVersionDeclared !== false;

  return {
    version: V72_INTELLIGENCE_VERSION,
    freezeVersion: V72_INTELLIGENCE_FREEZE_VERSION,
    reportId: `intelligence-catalog-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    manifest,
    catalogReady,
    readinessScore: catalogReady ? 100 : 0,
    summary: [
      `intelligence-catalog ready=${catalogReady}`,
      `insights=${manifest.entryCount}`,
      `sources=${manifest.sourceCount}`,
      `severities=${manifest.severityCount}`,
      `freeze=${V72_INTELLIGENCE_FREEZE_VERSION}`,
    ].join(" "),
  };
}

export function assertIntelligenceCatalogPass(
  report: IntelligenceCatalogReport,
): asserts report is IntelligenceCatalogReport & { catalogReady: true } {
  if (!report.catalogReady) {
    throw new Error(`V72 intelligence catalog not ready: ${report.summary}`);
  }
}
