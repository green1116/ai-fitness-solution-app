/**
 * Product M12 — Agent Catalog domain types
 */

import type {
  AGENT_CATALOG_BINDING_STATUSES,
  AGENT_CATALOG_ENTRY_STATUSES,
  AGENT_CATALOG_KINDS,
  AGENT_CATALOG_READINESS_VERDICTS,
  AGENT_CATALOG_STATUSES,
  PRODUCT_AGENT_CATALOG_BASE,
  PRODUCT_AGENT_CATALOG_FREEZE_VERSION,
  PRODUCT_AGENT_CATALOG_ID,
  PRODUCT_AGENT_CATALOG_VERSION,
} from "./catalog.constants";

export type AgentCatalogKind = (typeof AGENT_CATALOG_KINDS)[number];
export type AgentCatalogStatus = (typeof AGENT_CATALOG_STATUSES)[number];
export type AgentCatalogEntryStatus =
  (typeof AGENT_CATALOG_ENTRY_STATUSES)[number];
export type AgentCatalogBindingStatus =
  (typeof AGENT_CATALOG_BINDING_STATUSES)[number];
export type AgentCatalogReadinessVerdict =
  (typeof AGENT_CATALOG_READINESS_VERDICTS)[number];
export type AgentCatalogMetadata = Record<string, unknown>;

/** Frozen agent catalog definition (in-memory). */
export type AgentCatalog = {
  id: string;
  catalogKey: string;
  kind: AgentCatalogKind;
  status: AgentCatalogStatus;
  title: string;
  summary: string;
  detail: string;
  metadata: AgentCatalogMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterAgentCatalogInput = {
  id?: string;
  catalogKey: string;
  kind: AgentCatalogKind;
  title: string;
  summary: string;
  metadata?: AgentCatalogMetadata;
};

export type UpdateAgentCatalogStatusInput = {
  catalogId: string;
  status: AgentCatalogStatus;
};

/** Catalog entry — soft-ref to foundation agentKey. */
export type AgentCatalogEntry = {
  id: string;
  catalogId: string;
  entryKey: string;
  sequence: number;
  status: AgentCatalogEntryStatus;
  agentKeyRef: string;
  summary: string;
  detail: string;
  metadata: AgentCatalogMetadata;
  createdAt: string;
  updatedAt: string;
};

export type RegisterAgentCatalogEntryInput = {
  id?: string;
  catalogId: string;
  entryKey: string;
  sequence: number;
  agentKeyRef: string;
  summary: string;
  metadata?: AgentCatalogMetadata;
};

export type UpdateAgentCatalogEntryStatusInput = {
  entryId: string;
  status: AgentCatalogEntryStatus;
};

/** Soft binding of catalog entry to invocation contract key. */
export type AgentCatalogBinding = {
  id: string;
  catalogId: string;
  entryId: string;
  bindingKey: string;
  invocationContractKeyRef: string;
  status: AgentCatalogBindingStatus;
  detail: string;
  metadata: AgentCatalogMetadata;
  createdAt: string;
  updatedAt: string;
};

export type BindAgentCatalogEntryInput = {
  id?: string;
  catalogId: string;
  entryId: string;
  bindingKey: string;
  invocationContractKeyRef: string;
  metadata?: AgentCatalogMetadata;
};

export type AgentCatalogReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type AgentCatalogReadinessResult = {
  verdict: AgentCatalogReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: AgentCatalogReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type AgentCatalogManifest = {
  catalogRuntimeId: typeof PRODUCT_AGENT_CATALOG_ID;
  version: typeof PRODUCT_AGENT_CATALOG_VERSION;
  freezeVersion: typeof PRODUCT_AGENT_CATALOG_FREEZE_VERSION;
  base: typeof PRODUCT_AGENT_CATALOG_BASE;
  catalogCount: number;
  entryCount: number;
  bindingCount: number;
  checksum: string;
  createdAt: string;
};
