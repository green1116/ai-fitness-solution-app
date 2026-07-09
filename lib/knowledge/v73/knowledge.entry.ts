/**
 * V73 P1 — Knowledge catalog entry (read-only)
 */
export {
  KNOWLEDGE_CATALOG,
  buildKnowledgeCatalogManifest,
  getKnowledgeByAccess,
  getKnowledgeByCategory,
  getKnowledgeById,
  getKnowledgeBySource,
} from "./knowledge.catalog";
export { assertKnowledgeCatalogPass, buildKnowledgeCatalog } from "./knowledge.builder";
export { V73_KNOWLEDGE_FREEZE_VERSION, V73_KNOWLEDGE_VERSION } from "./knowledge.types";
export type { KnowledgeCatalogReport, KnowledgeCatalogSignals, KnowledgeItem } from "./knowledge.types";

import { buildKnowledgeCatalog } from "./knowledge.builder";
import type { KnowledgeCatalogReport, KnowledgeCatalogSignals } from "./knowledge.types";

export function runKnowledgeCatalog(input?: {
  deploymentId?: string;
  signals?: KnowledgeCatalogSignals;
}): KnowledgeCatalogReport {
  return buildKnowledgeCatalog(input);
}

export function formatKnowledgeCatalogSummary(report: KnowledgeCatalogReport): string {
  const lines = [
    "V73 Knowledge Catalog",
    `  ready: ${report.catalogReady}`,
    `  score: ${report.readinessScore}/100`,
    `  version: ${report.version}`,
    `  freeze: ${report.freezeVersion}`,
    `  items: ${report.manifest.entryCount}`,
    `  categories: ${report.manifest.categoryCount}`,
    `  sources: ${report.manifest.sourceCount}`,
  ];
  return lines.join("\n");
}
