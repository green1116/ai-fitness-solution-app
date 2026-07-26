/**
 * Product API Portal — catalog types (definition only)
 */

import type { PORTAL_CATALOG_STATUSES } from "../management/management.constants";

export type PortalCatalogStatus = (typeof PORTAL_CATALOG_STATUSES)[number];
export type PortalCatalogMetadata = Record<string, unknown>;

export type PortalCatalogEntry = {
  id: string;
  portalId: string;
  catalogKey: string;
  status: PortalCatalogStatus;
  sdkPackageKeyRef: string;
  sdkSemverRef: string;
  title: string;
  detail: string;
  metadata: PortalCatalogMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterPortalCatalogEntryInput = {
  id?: string;
  portalId: string;
  catalogKey: string;
  sdkPackageKeyRef: string;
  sdkSemverRef: string;
  title: string;
  metadata?: PortalCatalogMetadata;
};

export type UpdatePortalCatalogStatusInput = {
  catalogId: string;
  status: PortalCatalogStatus;
};
