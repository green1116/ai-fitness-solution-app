/**
 * V68 P1 — Service catalog report builder (read-only)
 */
import { closeV67Monitoring } from "@/lib/monitoring/v67/signoff/signoff.entry";
import {
  V67_MONITORING_FREEZE_VERSION,
  V67_MONITORING_SIGNOFF_VERSION,
} from "@/lib/monitoring/v67/signoff/signoff.types";

import {
  isUpstreamFrozenPlatformLockIntact,
  V68_UPSTREAM_FROZEN_PLATFORM_LOCK,
} from "./catalog.constants";
import type { ServiceCatalogReport, ServiceCatalogSignals } from "./catalog.types";
import { V68_SERVICE_CATALOG_VERSION } from "./catalog.types";
import { isServiceCatalogCrossRefsAligned } from "./alignment.catalog";
import { buildServiceDefinitionManifest } from "./service.definition.catalog";
import { buildServiceMetadataManifest } from "./service.metadata.catalog";
import { buildServiceOwnerManifest } from "./service.owner.catalog";
import { buildServiceStatusManifest } from "./service.status.catalog";

const DEFAULT_SIGNALS: ServiceCatalogSignals = {
  upstreamMonitoringClosed: true,
  definitionsComplete: true,
  metadataComplete: true,
  statusComplete: true,
  ownersComplete: true,
  monitoringRefsAligned: true,
};

export function buildServiceCatalogReport(input?: {
  deploymentId?: string;
  signals?: ServiceCatalogSignals;
}): ServiceCatalogReport {
  const deploymentId = input?.deploymentId ?? "v68-service-catalog-default";

  const monitoringSignoff = closeV67Monitoring({ deploymentId });
  const definitions = buildServiceDefinitionManifest();
  const metadata = buildServiceMetadataManifest();
  const statuses = buildServiceStatusManifest();
  const owners = buildServiceOwnerManifest();
  const refsAligned = isServiceCatalogCrossRefsAligned();
  const upstreamIntact = isUpstreamFrozenPlatformLockIntact();

  const signals: ServiceCatalogSignals = {
    ...DEFAULT_SIGNALS,
    upstreamMonitoringClosed: monitoringSignoff.signedOff && upstreamIntact,
    definitionsComplete: definitions.catalogComplete,
    metadataComplete: metadata.catalogComplete,
    statusComplete: statuses.catalogComplete,
    ownersComplete: owners.catalogComplete,
    monitoringRefsAligned: refsAligned,
    ...input?.signals,
  };

  const catalogReady =
    monitoringSignoff.signedOff &&
    upstreamIntact &&
    definitions.catalogComplete &&
    metadata.catalogComplete &&
    statuses.catalogComplete &&
    owners.catalogComplete &&
    refsAligned &&
    signals.upstreamMonitoringClosed !== false;

  return {
    version: V68_SERVICE_CATALOG_VERSION,
    reportId: `service-catalog-${deploymentId}`,
    generatedAt: new Date().toISOString(),
    deploymentId,
    upstreamMonitoringSignoff: V67_MONITORING_SIGNOFF_VERSION,
    upstreamMonitoringFreeze: V67_MONITORING_FREEZE_VERSION,
    upstreamMonitoringClosed: monitoringSignoff.signedOff && upstreamIntact,
    definitions,
    metadata,
    statuses,
    owners,
    catalogReady,
    readinessScore: catalogReady ? 100 : 0,
    summary: [
      `service-catalog ready=${catalogReady}`,
      `services=${definitions.serviceCount}`,
      `metadata=${metadata.entryCount}`,
      `statuses=${statuses.entryCount}`,
      `owners=${owners.entryCount}`,
      `refsAligned=${refsAligned}`,
      `upstream=${V68_UPSTREAM_FROZEN_PLATFORM_LOCK.v67MonitoringSignoff}`,
    ].join(" "),
  };
}

export function assertServiceCatalogPass(
  report: ServiceCatalogReport,
): asserts report is ServiceCatalogReport & { catalogReady: true } {
  if (!report.catalogReady) {
    throw new Error(`V68 service catalog not ready: ${report.summary}`);
  }
}
