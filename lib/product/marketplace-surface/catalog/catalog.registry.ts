/**
 * Product Marketplace Surface — catalog registry
 */

import {
  SURFACE_CATALOG_KINDS,
  SURFACE_CATALOG_STATUSES,
} from "../management/management.constants";
import type {
  MarketplaceSurfaceCatalog,
  RegisterSurfaceCatalogInput,
  SurfaceCatalogKind,
  SurfaceCatalogStatus,
  UpdateSurfaceCatalogStatusInput,
} from "./catalog.types";

const catalogs = new Map<string, MarketplaceSurfaceCatalog>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneCatalog(
  catalog: MarketplaceSurfaceCatalog,
): MarketplaceSurfaceCatalog {
  return { ...catalog, metadata: { ...catalog.metadata } };
}

export function registerSurfaceCatalog(
  input: RegisterSurfaceCatalogInput,
): MarketplaceSurfaceCatalog {
  const catalogKey = input.catalogKey.trim().toUpperCase();
  const name = input.name.trim();
  if (!catalogKey) throw new Error("catalog.catalogKey is required");
  if (!name) throw new Error("catalog.name is required");
  if (!(SURFACE_CATALOG_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid catalog kind: ${input.kind}`);
  }
  if (keys.has(catalogKey)) {
    throw new Error(`catalogKey already exists: ${catalogKey}`);
  }

  const id = input.id?.trim() || createId("surfcatalog");
  if (catalogs.has(id)) throw new Error(`catalog already exists: ${id}`);

  const now = nowIso();
  const catalog: MarketplaceSurfaceCatalog = {
    id,
    catalogKey,
    name,
    kind: input.kind,
    status: SURFACE_CATALOG_STATUSES[0],
    detail: `kind=${input.kind} status=DRAFT`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  catalogs.set(id, catalog);
  keys.set(catalogKey, id);
  return cloneCatalog(catalog);
}

export function updateSurfaceCatalogStatus(
  input: UpdateSurfaceCatalogStatusInput,
): MarketplaceSurfaceCatalog {
  const catalogId = input.catalogId.trim();
  if (!catalogId) throw new Error("catalog.catalogId is required");
  if (
    !(SURFACE_CATALOG_STATUSES as readonly string[]).includes(input.status)
  ) {
    throw new Error(`invalid catalog status: ${input.status}`);
  }

  const existing = catalogs.get(catalogId);
  if (!existing) throw new Error(`catalog not found: ${catalogId}`);

  const updated: MarketplaceSurfaceCatalog = {
    ...existing,
    status: input.status,
    detail: `kind=${existing.kind} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  catalogs.set(catalogId, updated);
  return cloneCatalog(updated);
}

export function getSurfaceCatalog(
  id: string,
): MarketplaceSurfaceCatalog | undefined {
  const catalog = catalogs.get(id.trim());
  return catalog ? cloneCatalog(catalog) : undefined;
}

export function listSurfaceCatalogs(filter?: {
  kind?: SurfaceCatalogKind;
  status?: SurfaceCatalogStatus;
}): MarketplaceSurfaceCatalog[] {
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

export function clearSurfaceCatalogs(): void {
  catalogs.clear();
  keys.clear();
}
