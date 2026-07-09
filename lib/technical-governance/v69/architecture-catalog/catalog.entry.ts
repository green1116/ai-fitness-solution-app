/**
 * V69 P1 — Architecture catalog entry (read-only)
 */
import { buildArchitectureCatalogReport } from "./catalog.builder";
import type { ArchitectureCatalogReport, ArchitectureCatalogSignals } from "./catalog.types";

export type { ArchitectureCatalogSignals };

export function runArchitectureCatalog(input?: {
  deploymentId?: string;
  signals?: ArchitectureCatalogSignals;
}): ArchitectureCatalogReport {
  return buildArchitectureCatalogReport(input);
}

export function formatArchitectureCatalogSummary(report: ArchitectureCatalogReport): string {
  const lines = [
    "V69 Architecture Catalog",
    `  ready: ${report.catalogReady}`,
    `  score: ${report.readinessScore}/100`,
    `  upstream: ${report.upstreamPlatformSignoff} (closed=${report.upstreamPlatformClosed})`,
    `  definitions: ${report.definitions.entryCount}`,
    `  layers: ${report.layers.entryCount}`,
    `  owners: ${report.owners.entryCount}`,
    `  dependency entries: ${report.dependencyEntries.entryCount}`,
    `  registry total: ${report.registry.totalEntries}`,
  ];
  return lines.join("\n");
}
