/**
 * V68 P1 — Service catalog types (read-only)
 */

export const V68_SERVICE_CATALOG_VERSION = "v68-service-catalog-1" as const;

export type ServiceTier = "critical" | "standard" | "internal" | "best-effort";

export type ServiceLifecycle = "active" | "deprecated" | "retired" | "planned";

export type ServiceStatusKind = "operational" | "degraded" | "maintenance" | "unknown";

export type ServiceCatalogSignals = {
  upstreamMonitoringClosed?: boolean;
  definitionsComplete?: boolean;
  metadataComplete?: boolean;
  statusComplete?: boolean;
  ownersComplete?: boolean;
  monitoringRefsAligned?: boolean;
};

export type ServiceDefinition = {
  id: string;
  name: string;
  tier: ServiceTier;
  lifecycle: ServiceLifecycle;
  monitoringRef: string;
  required: boolean;
  description: string;
};

export type ServiceDefinitionManifest = {
  version: typeof V68_SERVICE_CATALOG_VERSION;
  serviceCount: number;
  tierCount: number;
  catalogComplete: boolean;
  definitions: ServiceDefinition[];
  summary: string;
};

export type ServiceMetadataEntry = {
  id: string;
  serviceDefRef: string;
  displayName: string;
  tags: string[];
  repository: string;
  docsPath: string;
  dependencies: string[];
  required: boolean;
  description: string;
};

export type ServiceMetadataManifest = {
  version: typeof V68_SERVICE_CATALOG_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  metadata: ServiceMetadataEntry[];
  summary: string;
};

export type ServiceStatusEntry = {
  id: string;
  serviceDefRef: string;
  statusKind: ServiceStatusKind;
  healthRef: string;
  declarativeState: string;
  required: boolean;
  description: string;
};

export type ServiceStatusManifest = {
  version: typeof V68_SERVICE_CATALOG_VERSION;
  entryCount: number;
  statusKindCount: number;
  catalogComplete: boolean;
  statuses: ServiceStatusEntry[];
  summary: string;
};

export type ServiceOwnerEntry = {
  id: string;
  serviceDefRef: string;
  ownerRole: string;
  team: string;
  oncallRef: string;
  required: boolean;
  description: string;
};

export type ServiceOwnerManifest = {
  version: typeof V68_SERVICE_CATALOG_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  owners: ServiceOwnerEntry[];
  summary: string;
};

export type ServiceCatalogReport = {
  version: typeof V68_SERVICE_CATALOG_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  upstreamMonitoringSignoff: string;
  upstreamMonitoringFreeze: string;
  upstreamMonitoringClosed: boolean;
  definitions: ServiceDefinitionManifest;
  metadata: ServiceMetadataManifest;
  statuses: ServiceStatusManifest;
  owners: ServiceOwnerManifest;
  catalogReady: boolean;
  readinessScore: number;
  summary: string;
};
