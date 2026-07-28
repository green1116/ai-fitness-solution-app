/**
 * Product M11 — Knowledge Catalog domain types
 */

import type {
  KNOWLEDGE_CATALOG_BINDING_STATUSES,
  KNOWLEDGE_CATALOG_ENTRY_STATUSES,
  KNOWLEDGE_CATALOG_KINDS,
  KNOWLEDGE_CATALOG_READINESS_VERDICTS,
  KNOWLEDGE_CATALOG_STATUSES,
  PRODUCT_KNOWLEDGE_CATALOG_BASE,
  PRODUCT_KNOWLEDGE_CATALOG_FREEZE_VERSION,
  PRODUCT_KNOWLEDGE_CATALOG_ID,
  PRODUCT_KNOWLEDGE_CATALOG_VERSION,
} from "./catalog.constants";

export type KnowledgeCatalogKind = (typeof KNOWLEDGE_CATALOG_KINDS)[number];
export type KnowledgeCatalogStatus =
  (typeof KNOWLEDGE_CATALOG_STATUSES)[number];
export type KnowledgeCatalogEntryStatus =
  (typeof KNOWLEDGE_CATALOG_ENTRY_STATUSES)[number];
export type KnowledgeCatalogBindingStatus =
  (typeof KNOWLEDGE_CATALOG_BINDING_STATUSES)[number];
export type KnowledgeCatalogReadinessVerdict =
  (typeof KNOWLEDGE_CATALOG_READINESS_VERDICTS)[number];
export type KnowledgeCatalogMetadata = Record<string, unknown>;

/** Frozen knowledge catalog definition (in-memory). */
export type KnowledgeCatalog = {
  id: string;
  catalogKey: string;
  kind: KnowledgeCatalogKind;
  status: KnowledgeCatalogStatus;
  title: string;
  summary: string;
  detail: string;
  metadata: KnowledgeCatalogMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterKnowledgeCatalogInput = {
  id?: string;
  catalogKey: string;
  kind: KnowledgeCatalogKind;
  title: string;
  summary: string;
  metadata?: KnowledgeCatalogMetadata;
};

export type UpdateKnowledgeCatalogStatusInput = {
  catalogId: string;
  status: KnowledgeCatalogStatus;
};

/** Catalog entry — soft-ref to foundation entityKey. */
export type KnowledgeCatalogEntry = {
  id: string;
  catalogId: string;
  entryKey: string;
  sequence: number;
  status: KnowledgeCatalogEntryStatus;
  entityKeyRef: string;
  summary: string;
  detail: string;
  metadata: KnowledgeCatalogMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterKnowledgeCatalogEntryInput = {
  id?: string;
  catalogId: string;
  entryKey: string;
  sequence: number;
  entityKeyRef: string;
  summary: string;
  metadata?: KnowledgeCatalogMetadata;
};

export type UpdateKnowledgeCatalogEntryStatusInput = {
  entryId: string;
  status: KnowledgeCatalogEntryStatus;
};

/** Soft binding of catalog entry to retrieval contract key. */
export type KnowledgeCatalogBinding = {
  id: string;
  catalogId: string;
  entryId: string;
  bindingKey: string;
  retrievalContractKeyRef: string;
  status: KnowledgeCatalogBindingStatus;
  detail: string;
  metadata: KnowledgeCatalogMetadata;
  createdAt: string;
  updatedAt: string;
};

export type BindKnowledgeCatalogEntryInput = {
  id?: string;
  catalogId: string;
  entryId: string;
  bindingKey: string;
  retrievalContractKeyRef: string;
  metadata?: KnowledgeCatalogMetadata;
};

export type KnowledgeCatalogReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type KnowledgeCatalogReadinessResult = {
  verdict: KnowledgeCatalogReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: KnowledgeCatalogReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type KnowledgeCatalogManifest = {
  catalogRuntimeId: typeof PRODUCT_KNOWLEDGE_CATALOG_ID;
  version: typeof PRODUCT_KNOWLEDGE_CATALOG_VERSION;
  freezeVersion: typeof PRODUCT_KNOWLEDGE_CATALOG_FREEZE_VERSION;
  base: typeof PRODUCT_KNOWLEDGE_CATALOG_BASE;
  catalogCount: number;
  entryCount: number;
  bindingCount: number;
  checksum: string;
  createdAt: string;
};
