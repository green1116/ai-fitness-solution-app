/**
 * V68 P1 — Service catalog entry (read-only)
 */
import { buildServiceCatalogReport } from "./catalog.builder";
import type { ServiceCatalogReport, ServiceCatalogSignals } from "./catalog.types";

export type { ServiceCatalogSignals };

export function runServiceCatalog(input?: {
  deploymentId?: string;
  signals?: ServiceCatalogSignals;
}): ServiceCatalogReport {
  return buildServiceCatalogReport(input);
}

export function formatServiceCatalogSummary(report: ServiceCatalogReport): string {
  const lines = [
    "V68 Service Catalog",
    `  ready: ${report.catalogReady}`,
    `  score: ${report.readinessScore}/100`,
    `  upstream: ${report.upstreamMonitoringSignoff} (closed=${report.upstreamMonitoringClosed})`,
    `  definitions: ${report.definitions.serviceCount}`,
    `  metadata: ${report.metadata.entryCount}`,
    `  statuses: ${report.statuses.entryCount}`,
    `  owners: ${report.owners.entryCount}`,
  ];
  return lines.join("\n");
}
