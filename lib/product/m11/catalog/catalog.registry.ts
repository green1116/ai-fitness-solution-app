/**
 * Product M11 — Knowledge catalog definition registry (in-memory)
 */

import {
  KNOWLEDGE_CATALOG_KINDS,
  KNOWLEDGE_CATALOG_STATUSES,
} from "./catalog.constants";
import type {
  KnowledgeCatalog,
  KnowledgeCatalogKind,
  KnowledgeCatalogStatus,
  RegisterKnowledgeCatalogInput,
  UpdateKnowledgeCatalogStatusInput,
} from "./catalog.types";

const catalogs = new Map<string, KnowledgeCatalog>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneCatalog(catalog: KnowledgeCatalog): KnowledgeCatalog {
  return { ...catalog, metadata: { ...catalog.metadata } };
}

export function registerKnowledgeCatalog(
  input: RegisterKnowledgeCatalogInput,
): KnowledgeCatalog {
  const catalogKey = input.catalogKey.trim().toUpperCase();
  const title = input.title.trim();
  const summary = input.summary.trim();
  if (!catalogKey) throw new Error("catalog.catalogKey is required");
  if (!title) throw new Error("catalog.title is required");
  if (!summary) throw new Error("catalog.summary is required");
  if (!(KNOWLEDGE_CATALOG_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid catalog kind: ${input.kind}`);
  }
  if (keys.has(catalogKey)) {
    throw new Error(`catalogKey already exists: ${catalogKey}`);
  }

  const id = input.id?.trim() || createId("knwcat");
  if (catalogs.has(id)) throw new Error(`catalog already exists: ${id}`);

  const now = nowIso();
  const catalog: KnowledgeCatalog = {
    id,
    catalogKey,
    kind: input.kind,
    status: KNOWLEDGE_CATALOG_STATUSES[0],
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

export function updateKnowledgeCatalogStatus(
  input: UpdateKnowledgeCatalogStatusInput,
): KnowledgeCatalog {
  const catalogId = input.catalogId.trim();
  if (!catalogId) throw new Error("catalog.catalogId is required");
  if (
    !(KNOWLEDGE_CATALOG_STATUSES as readonly string[]).includes(input.status)
  ) {
    throw new Error(`invalid catalog status: ${input.status}`);
  }

  const existing = catalogs.get(catalogId);
  if (!existing) throw new Error(`catalog not found: ${catalogId}`);

  const updated: KnowledgeCatalog = {
    ...existing,
    status: input.status,
    detail: `kind=${existing.kind} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  catalogs.set(catalogId, updated);
  return cloneCatalog(updated);
}

export function getKnowledgeCatalog(id: string): KnowledgeCatalog | undefined {
  const catalog = catalogs.get(id.trim());
  return catalog ? cloneCatalog(catalog) : undefined;
}

export function getKnowledgeCatalogByKey(
  catalogKey: string,
): KnowledgeCatalog | undefined {
  const id = keys.get(catalogKey.trim().toUpperCase());
  return id ? getKnowledgeCatalog(id) : undefined;
}

export function listKnowledgeCatalogs(filter?: {
  kind?: KnowledgeCatalogKind;
  status?: KnowledgeCatalogStatus;
}): KnowledgeCatalog[] {
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

export function clearKnowledgeCatalogs(): void {
  catalogs.clear();
  keys.clear();
}
