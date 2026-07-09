/**
 * V69 P1 — Architecture catalog types (read-only)
 */

export const V69_ARCHITECTURE_CATALOG_VERSION = "v69-architecture-catalog-1" as const;
export const V69_ARCHITECTURE_CATALOG_FREEZE_VERSION = "v69-architecture-catalog-freeze-1" as const;

export type ArchitectureLayerKind =
  | "presentation"
  | "application"
  | "domain"
  | "integration"
  | "infrastructure"
  | "governance"
  | "data"
  | "security";

export type ArchitectureLifecycle = "active" | "deprecated" | "planned" | "retired";

export type ArchitectureCriticality = "tier-1" | "tier-2" | "tier-3" | "tier-4";

export type ArchitectureCatalogSignals = {
  upstreamPlatformClosed?: boolean;
  definitionsComplete?: boolean;
  layersComplete?: boolean;
  ownersComplete?: boolean;
  dependencyEntriesComplete?: boolean;
  refsAligned?: boolean;
  freezeLockIntact?: boolean;
};

export type ArchitectureDefinition = {
  id: string;
  name: string;
  layerRef: string;
  criticality: ArchitectureCriticality;
  lifecycle: ArchitectureLifecycle;
  platformServiceRef: string;
  required: boolean;
  description: string;
};

export type ArchitectureDefinitionManifest = {
  version: typeof V69_ARCHITECTURE_CATALOG_VERSION;
  entryCount: number;
  layerKindCount: number;
  catalogComplete: boolean;
  definitions: ArchitectureDefinition[];
  summary: string;
};

export type ArchitectureLayerEntry = {
  id: string;
  kind: ArchitectureLayerKind;
  label: string;
  stackOrder: number;
  required: boolean;
  description: string;
};

export type ArchitectureLayerManifest = {
  version: typeof V69_ARCHITECTURE_CATALOG_VERSION;
  entryCount: number;
  kindCount: number;
  catalogComplete: boolean;
  layers: ArchitectureLayerEntry[];
  summary: string;
};

export type ArchitectureOwnerEntry = {
  id: string;
  architectureDefRef: string;
  ownerRole: string;
  team: string;
  contactGroup: string;
  required: boolean;
  description: string;
};

export type ArchitectureOwnerManifest = {
  version: typeof V69_ARCHITECTURE_CATALOG_VERSION;
  entryCount: number;
  catalogComplete: boolean;
  owners: ArchitectureOwnerEntry[];
  summary: string;
};

export type DependencyEntry = {
  id: string;
  architectureDefRef: string;
  serviceDefRef: string;
  dependencyKind: "runtime" | "declarative" | "read-only";
  entryPath: string;
  required: boolean;
  description: string;
};

export type DependencyEntryManifest = {
  version: typeof V69_ARCHITECTURE_CATALOG_VERSION;
  entryCount: number;
  kindCount: number;
  catalogComplete: boolean;
  entries: DependencyEntry[];
  summary: string;
};

export type ArchitectureCatalogRegistry = {
  version: typeof V69_ARCHITECTURE_CATALOG_VERSION;
  definitionIds: string[];
  layerIds: string[];
  ownerIds: string[];
  dependencyEntryIds: string[];
  totalEntries: number;
  registryComplete: boolean;
  summary: string;
};

export type ArchitectureCatalogReport = {
  version: typeof V69_ARCHITECTURE_CATALOG_VERSION;
  reportId: string;
  generatedAt: string;
  deploymentId: string;
  upstreamPlatformSignoff: string;
  upstreamPlatformFreeze: string;
  upstreamPlatformClosed: boolean;
  definitions: ArchitectureDefinitionManifest;
  layers: ArchitectureLayerManifest;
  owners: ArchitectureOwnerManifest;
  dependencyEntries: DependencyEntryManifest;
  registry: ArchitectureCatalogRegistry;
  catalogReady: boolean;
  readinessScore: number;
  summary: string;
};
