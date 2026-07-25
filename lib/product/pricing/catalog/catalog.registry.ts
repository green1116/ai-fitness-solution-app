/**
 * Product Pricing — Catalog registry
 */

import { PRICING_CATALOG_STATUSES } from "../management/management.constants";
import type {
  ArchiveCatalogInput,
  CreateCatalogInput,
  PricingCatalog,
  PricingCatalogStatus,
  PublishCatalogInput,
} from "./catalog.types";

const catalogs = new Map<string, PricingCatalog>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneCatalog(catalog: PricingCatalog): PricingCatalog {
  return { ...catalog, metadata: { ...catalog.metadata } };
}

export function createCatalog(input: CreateCatalogInput): PricingCatalog {
  const code = input.code.trim().toUpperCase();
  const name = input.name.trim();
  if (!code) throw new Error("catalog.code is required");
  if (!name) throw new Error("catalog.name is required");

  const id = input.id?.trim() || createId("pricat");
  if (catalogs.has(id)) throw new Error(`catalog already exists: ${id}`);

  const status = PRICING_CATALOG_STATUSES[0];
  const catalog: PricingCatalog = {
    id,
    code,
    name,
    status,
    detail: `status=${status} code=${code}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  catalogs.set(id, catalog);
  return cloneCatalog(catalog);
}

export function publishCatalog(input: PublishCatalogInput): PricingCatalog {
  const catalogId = input.catalogId.trim();
  if (!catalogId) throw new Error("catalog.catalogId is required");
  const existing = catalogs.get(catalogId);
  if (!existing) throw new Error(`catalog not found: ${catalogId}`);
  if (existing.status === "PUBLISHED") {
    throw new Error(`catalog already published: ${catalogId}`);
  }
  if (existing.status === "ARCHIVED") {
    throw new Error(`catalog archived: ${catalogId}`);
  }

  const now = nowIso();
  const updated: PricingCatalog = {
    ...existing,
    status: "PUBLISHED",
    detail: `status=PUBLISHED code=${existing.code}`,
    metadata: { ...existing.metadata },
    publishedAt: now,
  };
  catalogs.set(catalogId, updated);
  return cloneCatalog(updated);
}

export function archiveCatalog(input: ArchiveCatalogInput): PricingCatalog {
  const catalogId = input.catalogId.trim();
  if (!catalogId) throw new Error("catalog.catalogId is required");
  const existing = catalogs.get(catalogId);
  if (!existing) throw new Error(`catalog not found: ${catalogId}`);
  if (existing.status === "ARCHIVED") {
    throw new Error(`catalog already archived: ${catalogId}`);
  }

  const updated: PricingCatalog = {
    ...existing,
    status: "ARCHIVED",
    detail: `status=ARCHIVED code=${existing.code}`,
    metadata: { ...existing.metadata },
  };
  catalogs.set(catalogId, updated);
  return cloneCatalog(updated);
}

export function getCatalog(id: string): PricingCatalog | undefined {
  const catalog = catalogs.get(id.trim());
  return catalog ? cloneCatalog(catalog) : undefined;
}

export function listCatalogs(filter?: {
  status?: PricingCatalogStatus;
}): PricingCatalog[] {
  let result = [...catalogs.values()];
  if (filter?.status) {
    result = result.filter((c) => c.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneCatalog);
}

export function clearCatalogs(): void {
  catalogs.clear();
}
