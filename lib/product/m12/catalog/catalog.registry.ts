/**
 * Product M12 — Agent catalog definition registry (in-memory)
 */

import {
  AGENT_CATALOG_KINDS,
  AGENT_CATALOG_STATUSES,
} from "./catalog.constants";
import type {
  AgentCatalog,
  AgentCatalogKind,
  AgentCatalogStatus,
  RegisterAgentCatalogInput,
  UpdateAgentCatalogStatusInput,
} from "./catalog.types";

const catalogs = new Map<string, AgentCatalog>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneCatalog(catalog: AgentCatalog): AgentCatalog {
  return { ...catalog, metadata: { ...catalog.metadata } };
}

export function registerAgentCatalog(
  input: RegisterAgentCatalogInput,
): AgentCatalog {
  const catalogKey = input.catalogKey.trim().toUpperCase();
  const title = input.title.trim();
  const summary = input.summary.trim();
  if (!catalogKey) throw new Error("catalog.catalogKey is required");
  if (!title) throw new Error("catalog.title is required");
  if (!summary) throw new Error("catalog.summary is required");
  if (!(AGENT_CATALOG_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid catalog kind: ${input.kind}`);
  }
  if (keys.has(catalogKey)) {
    throw new Error(`catalogKey already exists: ${catalogKey}`);
  }

  const id = input.id?.trim() || createId("agtcat");
  if (catalogs.has(id)) throw new Error(`catalog already exists: ${id}`);

  const now = nowIso();
  const catalog: AgentCatalog = {
    id,
    catalogKey,
    kind: input.kind,
    status: AGENT_CATALOG_STATUSES[0],
    title,
    summary,
    detail: `kind=${input.kind} status=DRAFT`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  catalogs.set(id, catalog);
  keys.set(catalogKey, id);
  return cloneCatalog(catalog);
}

export function updateAgentCatalogStatus(
  input: UpdateAgentCatalogStatusInput,
): AgentCatalog {
  const catalogId = input.catalogId.trim();
  if (!catalogId) throw new Error("catalog.catalogId is required");
  if (!(AGENT_CATALOG_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid catalog status: ${input.status}`);
  }

  const existing = catalogs.get(catalogId);
  if (!existing) throw new Error(`catalog not found: ${catalogId}`);

  const updated: AgentCatalog = {
    ...existing,
    status: input.status,
    detail: `kind=${existing.kind} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  catalogs.set(catalogId, updated);
  return cloneCatalog(updated);
}

export function getAgentCatalog(id: string): AgentCatalog | undefined {
  const catalog = catalogs.get(id.trim());
  return catalog ? cloneCatalog(catalog) : undefined;
}

export function getAgentCatalogByKey(
  catalogKey: string,
): AgentCatalog | undefined {
  const id = keys.get(catalogKey.trim().toUpperCase());
  return id ? getAgentCatalog(id) : undefined;
}

export function listAgentCatalogs(filter?: {
  kind?: AgentCatalogKind;
  status?: AgentCatalogStatus;
}): AgentCatalog[] {
  let result = [...catalogs.values()];
  if (filter?.kind) result = result.filter((c) => c.kind === filter.kind);
  if (filter?.status) {
    result = result.filter((c) => c.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.catalogKey.localeCompare(b.catalogKey))
    .map(cloneCatalog);
}

export function clearAgentCatalogs(): void {
  catalogs.clear();
  keys.clear();
}
