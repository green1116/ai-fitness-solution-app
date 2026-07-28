/**
 * Product M13 — OS Catalog domain types
 */

import type {
  OS_CATALOG_BINDING_STATUSES,
  OS_CATALOG_ENTRY_STATUSES,
  OS_CATALOG_KINDS,
  OS_CATALOG_READINESS_VERDICTS,
  OS_CATALOG_STATUSES,
  PRODUCT_OS_CATALOG_BASE,
  PRODUCT_OS_CATALOG_FREEZE_VERSION,
  PRODUCT_OS_CATALOG_ID,
  PRODUCT_OS_CATALOG_VERSION,
} from "./catalog.constants";

export type OsCatalogKind = (typeof OS_CATALOG_KINDS)[number];
export type OsCatalogStatus = (typeof OS_CATALOG_STATUSES)[number];
export type OsCatalogEntryStatus = (typeof OS_CATALOG_ENTRY_STATUSES)[number];
export type OsCatalogBindingStatus =
  (typeof OS_CATALOG_BINDING_STATUSES)[number];
export type OsCatalogReadinessVerdict =
  (typeof OS_CATALOG_READINESS_VERDICTS)[number];
export type OsCatalogMetadata = Record<string, unknown>;

/** Frozen OS catalog definition (in-memory). */
export type OsCatalog = {
  id: string;
  catalogKey: string;
  kind: OsCatalogKind;
  status: OsCatalogStatus;
  title: string;
  summary: string;
  detail: string;
  metadata: OsCatalogMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterOsCatalogInput = {
  id?: string;
  catalogKey: string;
  kind: OsCatalogKind;
  title: string;
  summary: string;
  metadata?: OsCatalogMetadata;
};

export type UpdateOsCatalogStatusInput = {
  catalogId: string;
  status: OsCatalogStatus;
};

/** Catalog entry — soft-ref to foundation surfaceKey. */
export type OsCatalogEntry = {
  id: string;
  catalogId: string;
  entryKey: string;
  sequence: number;
  status: OsCatalogEntryStatus;
  surfaceKeyRef: string;
  summary: string;
  detail: string;
  metadata: OsCatalogMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterOsCatalogEntryInput = {
  id?: string;
  catalogId: string;
  entryKey: string;
  sequence: number;
  surfaceKeyRef: string;
  summary: string;
  metadata?: OsCatalogMetadata;
};

export type UpdateOsCatalogEntryStatusInput = {
  entryId: string;
  status: OsCatalogEntryStatus;
};

/** Soft binding of catalog entry to operation contract key. */
export type OsCatalogBinding = {
  id: string;
  catalogId: string;
  entryId: string;
  bindingKey: string;
  operationContractKeyRef: string;
  status: OsCatalogBindingStatus;
  detail: string;
  metadata: OsCatalogMetadata;
  createdAt: string;
  updatedAt: string;
};

export type BindOsCatalogEntryInput = {
  id?: string;
  catalogId: string;
  entryId: string;
  bindingKey: string;
  operationContractKeyRef: string;
  metadata?: OsCatalogMetadata;
};

export type OsCatalogReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type OsCatalogReadinessResult = {
  verdict: OsCatalogReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: OsCatalogReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type OsCatalogManifest = {
  catalogRuntimeId: typeof PRODUCT_OS_CATALOG_ID;
  version: typeof PRODUCT_OS_CATALOG_VERSION;
  freezeVersion: typeof PRODUCT_OS_CATALOG_FREEZE_VERSION;
  base: typeof PRODUCT_OS_CATALOG_BASE;
  catalogCount: number;
  entryCount: number;
  bindingCount: number;
  checksum: string;
  createdAt: string;
};
