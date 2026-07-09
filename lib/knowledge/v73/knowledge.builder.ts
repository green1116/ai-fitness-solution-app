/**
 * V73 P1 — Knowledge catalog builder (read-only)
 */
import { buildKnowledgeCatalogManifest } from "./knowledge.catalog";
import type { KnowledgeCatalogReport, KnowledgeCatalogSignals } from "./knowledge.types";
import { V73_KNOWLEDGE_FREEZE_VERSION, V73_KNOWLEDGE_VERSION } from "./knowledge.types";

const DEFAULT_SIGNALS: KnowledgeCatalogSignals = {
  catalogComplete: true,
  freezeVersionDeclared: true,
};

export function buildKnowledgeCatalog(input?: {
  deploymentId?: string;
  signals?: KnowledgeCatalogSignals;
}): KnowledgeCatalogReport {
  const deploymentId = input?.deploymentId ?? "v73-knowledge-catalog-default";
  const manifest = buildKnowledgeCatalogManifest();

  const signals: KnowledgeCatalogSignals = {
    ...DEFAULT_SIGNALS,
    catalogComplete: manifest.catalogComplete,
    freezeVersionDeclared: V73_KNOWLEDGE_FREEZE_VERSION.length > 0,
    ...input?.signals,
  };

  const catalogReady =
    manifest.catalogComplete &&
    signals.catalogComplete !== false &&
    signals.freezeVersionDeclared !== false;

  return {
    version: V73_KNOWLEDGE_VERSION,
    freezeVersion: V73_KNOWLEDGE_FREEZE_VERSION,
    reportId: `knowledge-catalog-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    manifest,
    catalogReady,
    readinessScore: catalogReady ? 100 : 0,
    summary: [
      `knowledge-catalog ready=${catalogReady}`,
      `items=${manifest.entryCount}`,
      `categories=${manifest.categoryCount}`,
      `sources=${manifest.sourceCount}`,
      `freeze=${V73_KNOWLEDGE_FREEZE_VERSION}`,
    ].join(" "),
  };
}

export function assertKnowledgeCatalogPass(
  report: KnowledgeCatalogReport,
): asserts report is KnowledgeCatalogReport & { catalogReady: true } {
  if (!report.catalogReady) {
    throw new Error(`V73 knowledge catalog not ready: ${report.summary}`);
  }
}
