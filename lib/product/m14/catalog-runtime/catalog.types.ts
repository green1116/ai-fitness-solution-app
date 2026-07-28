/**
 * Product M14 — Intelligence Catalog domain types
 */

import type {
  INTELLIGENCE_CATALOG_BINDING_STATUSES,
  INTELLIGENCE_CATALOG_ENTRY_STATUSES,
  INTELLIGENCE_CATALOG_KINDS,
  INTELLIGENCE_CATALOG_READINESS_VERDICTS,
  INTELLIGENCE_CATALOG_STATUSES,
  PRODUCT_INTELLIGENCE_CATALOG_BASE,
  PRODUCT_INTELLIGENCE_CATALOG_FREEZE_VERSION,
  PRODUCT_INTELLIGENCE_CATALOG_ID,
  PRODUCT_INTELLIGENCE_CATALOG_VERSION,
} from "./catalog.constants";

export type IntelligenceCatalogKind =
  (typeof INTELLIGENCE_CATALOG_KINDS)[number];
export type IntelligenceCatalogStatus =
  (typeof INTELLIGENCE_CATALOG_STATUSES)[number];
export type IntelligenceCatalogEntryStatus =
  (typeof INTELLIGENCE_CATALOG_ENTRY_STATUSES)[number];
export type IntelligenceCatalogBindingStatus =
  (typeof INTELLIGENCE_CATALOG_BINDING_STATUSES)[number];
export type IntelligenceCatalogReadinessVerdict =
  (typeof INTELLIGENCE_CATALOG_READINESS_VERDICTS)[number];
export type IntelligenceCatalogMetadata = Record<string, unknown>;

/** Frozen intelligence catalog definition (in-memory). */
export type IntelligenceCatalog = {
  id: string;
  catalogKey: string;
  kind: IntelligenceCatalogKind;
  status: IntelligenceCatalogStatus;
  title: string;
  summary: string;
  detail: string;
  metadata: IntelligenceCatalogMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterIntelligenceCatalogInput = {
  id?: string;
  catalogKey: string;
  kind: IntelligenceCatalogKind;
  title: string;
  summary: string;
  metadata?: IntelligenceCatalogMetadata;
};

export type UpdateIntelligenceCatalogStatusInput = {
  catalogId: string;
  status: IntelligenceCatalogStatus;
};

/** Catalog entry — soft-ref to foundation lensKey. */
export type IntelligenceCatalogEntry = {
  id: string;
  catalogId: string;
  entryKey: string;
  sequence: number;
  status: IntelligenceCatalogEntryStatus;
  lensKeyRef: string;
  summary: string;
  detail: string;
  metadata: IntelligenceCatalogMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterIntelligenceCatalogEntryInput = {
  id?: string;
  catalogId: string;
  entryKey: string;
  sequence: number;
  lensKeyRef: string;
  summary: string;
  metadata?: IntelligenceCatalogMetadata;
};

export type UpdateIntelligenceCatalogEntryStatusInput = {
  entryId: string;
  status: IntelligenceCatalogEntryStatus;
};

/** Soft binding of catalog entry to analysis contract key. */
export type IntelligenceCatalogBinding = {
  id: string;
  catalogId: string;
  entryId: string;
  bindingKey: string;
  analysisContractKeyRef: string;
  status: IntelligenceCatalogBindingStatus;
  detail: string;
  metadata: IntelligenceCatalogMetadata;
  createdAt: string;
  updatedAt: string;
};

export type BindIntelligenceCatalogEntryInput = {
  id?: string;
  catalogId: string;
  entryId: string;
  bindingKey: string;
  analysisContractKeyRef: string;
  metadata?: IntelligenceCatalogMetadata;
};

export type IntelligenceCatalogReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type IntelligenceCatalogReadinessResult = {
  verdict: IntelligenceCatalogReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: IntelligenceCatalogReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type IntelligenceCatalogManifest = {
  catalogRuntimeId: typeof PRODUCT_INTELLIGENCE_CATALOG_ID;
  version: typeof PRODUCT_INTELLIGENCE_CATALOG_VERSION;
  freezeVersion: typeof PRODUCT_INTELLIGENCE_CATALOG_FREEZE_VERSION;
  base: typeof PRODUCT_INTELLIGENCE_CATALOG_BASE;
  catalogCount: number;
  entryCount: number;
  bindingCount: number;
  checksum: string;
  createdAt: string;
};
