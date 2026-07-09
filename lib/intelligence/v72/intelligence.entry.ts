/**
 * V72 P1 — Intelligence catalog entry (read-only)
 */
export {
  INTELLIGENCE_CATALOG,
  buildIntelligenceCatalogManifest,
  getIntelligenceById,
  getIntelligenceBySeverity,
  getIntelligenceBySource,
  getIntelligenceWithAnomalies,
} from "./intelligence.catalog";
export { assertIntelligenceCatalogPass, buildIntelligenceCatalog } from "./intelligence.builder";
export { V72_INTELLIGENCE_FREEZE_VERSION, V72_INTELLIGENCE_VERSION } from "./intelligence.types";
export type { IntelligenceCatalogReport, IntelligenceCatalogSignals } from "./intelligence.types";

import { buildIntelligenceCatalog } from "./intelligence.builder";
import type { IntelligenceCatalogReport, IntelligenceCatalogSignals } from "./intelligence.types";

export function runIntelligenceCatalog(input?: {
  deploymentId?: string;
  signals?: IntelligenceCatalogSignals;
}): IntelligenceCatalogReport {
  return buildIntelligenceCatalog(input);
}

export function formatIntelligenceCatalogSummary(report: IntelligenceCatalogReport): string {
  const lines = [
    "V72 Intelligence Catalog",
    `  ready: ${report.catalogReady}`,
    `  score: ${report.readinessScore}/100`,
    `  version: ${report.version}`,
    `  freeze: ${report.freezeVersion}`,
    `  insights: ${report.manifest.entryCount}`,
    `  sources: ${report.manifest.sourceCount}`,
    `  severities: ${report.manifest.severityCount}`,
  ];
  return lines.join("\n");
}
