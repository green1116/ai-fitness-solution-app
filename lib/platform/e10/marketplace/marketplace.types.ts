/**
 * E10-P6 — Platform Marketplace types
 * Marketplace layer above E10 Platform API Gateway
 */

import type { PlatformMetadata } from "../core/platform.types";
import {
  CATALOG_ENTRY_KINDS,
  CATALOG_ENTRY_STATUSES,
  E10_MARKETPLACE_BASE,
  E10_MARKETPLACE_FREEZE_VERSION,
  E10_MARKETPLACE_ID,
  E10_MARKETPLACE_VERSION,
  INSTALL_STATUSES,
  MARKETPLACE_MANAGER_STATUSES,
  PACKAGE_STATUSES,
  PLUGIN_STATUSES,
} from "./marketplace.constants";

export type CatalogEntryKind = (typeof CATALOG_ENTRY_KINDS)[number];
export type CatalogEntryStatus = (typeof CATALOG_ENTRY_STATUSES)[number];
export type PluginStatus = (typeof PLUGIN_STATUSES)[number];
export type PackageStatus = (typeof PACKAGE_STATUSES)[number];
export type InstallStatus = (typeof INSTALL_STATUSES)[number];
export type MarketplaceManagerStatus =
  (typeof MARKETPLACE_MANAGER_STATUSES)[number];

export type { PlatformMetadata };

/** Catalog listing entry. */
export type CatalogEntry = {
  id: string;
  name: string;
  kind: CatalogEntryKind;
  version: string;
  description: string;
  status: CatalogEntryStatus;
  tags: string[];
  /** Optional E10-P5 gateway route id binding */
  routeId?: string;
  metadata: PlatformMetadata;
  listedAt: string;
};

export type RegisterCatalogEntryInput = {
  id: string;
  name: string;
  kind: CatalogEntryKind;
  version: string;
  description: string;
  tags?: string[];
  routeId?: string;
  metadata?: PlatformMetadata;
};

/** Plugin definition. */
export type PluginDefinition = {
  id: string;
  name: string;
  catalogId: string;
  version: string;
  status: PluginStatus;
  entryPoint: string;
  metadata: PlatformMetadata;
  registeredAt: string;
  enabledAt?: string;
};

export type RegisterPluginInput = {
  id: string;
  name: string;
  catalogId: string;
  version: string;
  entryPoint: string;
  metadata?: PlatformMetadata;
};

/** Package definition. */
export type PackageDefinition = {
  id: string;
  name: string;
  catalogId: string;
  version: string;
  status: PackageStatus;
  artifactRef: string;
  metadata: PlatformMetadata;
  registeredAt: string;
};

export type RegisterPackageInput = {
  id: string;
  name: string;
  catalogId: string;
  version: string;
  artifactRef: string;
  metadata?: PlatformMetadata;
};

/** Install record. */
export type InstallRecord = {
  id: string;
  packageId: string;
  status: InstallStatus;
  installedAt?: string;
  uninstalledAt?: string;
  error?: string;
};

export type InstallPackageInput = {
  packageId: string;
  installId?: string;
};

/** Search stub result. */
export type SearchResult = {
  query: string;
  total: number;
  entries: CatalogEntry[];
  searchedAt: string;
};

/** Marketplace registry manifest. */
export type MarketplaceRegistryManifest = {
  marketplaceId: typeof E10_MARKETPLACE_ID;
  version: typeof E10_MARKETPLACE_VERSION;
  freezeVersion: typeof E10_MARKETPLACE_FREEZE_VERSION;
  base: typeof E10_MARKETPLACE_BASE;
  catalogCount: number;
  pluginCount: number;
  packageCount: number;
  installedCount: number;
};
