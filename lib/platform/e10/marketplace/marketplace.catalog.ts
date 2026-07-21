/**
 * E10-P6 — Catalog Registry
 */

import {
  CATALOG_ENTRY_KINDS,
  CATALOG_ENTRY_STATUSES,
  E10_MARKETPLACE_BASE,
  E10_MARKETPLACE_FREEZE_VERSION,
  E10_MARKETPLACE_ID,
  E10_MARKETPLACE_VERSION,
} from "./marketplace.constants";
import type {
  CatalogEntry,
  CatalogEntryKind,
  CatalogEntryStatus,
  MarketplaceRegistryManifest,
  RegisterCatalogEntryInput,
  SearchResult,
} from "./marketplace.types";

const catalog = new Map<string, CatalogEntry>();

function nowIso(): string {
  return new Date().toISOString();
}

function cloneEntry(entry: CatalogEntry): CatalogEntry {
  return {
    ...entry,
    tags: [...entry.tags],
    metadata: { ...entry.metadata },
  };
}

function assertKind(kind: string): asserts kind is CatalogEntryKind {
  if (!(CATALOG_ENTRY_KINDS as readonly string[]).includes(kind)) {
    throw new Error(`invalid catalog entry kind: ${kind}`);
  }
}

export function registerCatalogEntry(
  input: RegisterCatalogEntryInput,
): CatalogEntry {
  const id = input.id.trim();
  const name = input.name.trim();
  const version = input.version.trim();
  const description = input.description.trim();
  if (!id) throw new Error("catalog.id is required");
  if (!name) throw new Error("catalog.name is required");
  if (!version) throw new Error("catalog.version is required");
  if (!description) throw new Error("catalog.description is required");
  assertKind(input.kind);

  if (catalog.has(id)) {
    throw new Error(`catalog entry already registered: ${id}`);
  }

  const entry: CatalogEntry = {
    id,
    name,
    kind: input.kind,
    version,
    description,
    status: "LISTED",
    tags: [...(input.tags ?? [])],
    routeId: input.routeId?.trim() || undefined,
    metadata: { ...(input.metadata ?? {}) },
    listedAt: nowIso(),
  };
  catalog.set(id, entry);
  return cloneEntry(entry);
}

export function getCatalogEntry(id: string): CatalogEntry | undefined {
  const entry = catalog.get(id.trim());
  return entry ? cloneEntry(entry) : undefined;
}

export function listCatalogEntries(filter?: {
  kind?: CatalogEntryKind;
  status?: CatalogEntryStatus;
  tag?: string;
}): CatalogEntry[] {
  let result = [...catalog.values()];
  if (filter?.kind) {
    result = result.filter((e) => e.kind === filter.kind);
  }
  if (filter?.status) {
    result = result.filter((e) => e.status === filter.status);
  }
  if (filter?.tag) {
    const tag = filter.tag.trim().toLowerCase();
    result = result.filter((e) =>
      e.tags.some((t) => t.toLowerCase() === tag),
    );
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneEntry);
}

export function setCatalogEntryStatus(
  id: string,
  status: CatalogEntryStatus,
): CatalogEntry {
  const entry = catalog.get(id.trim());
  if (!entry) throw new Error(`catalog entry not found: ${id}`);
  if (!(CATALOG_ENTRY_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid catalog status: ${status}`);
  }
  entry.status = status;
  catalog.set(entry.id, entry);
  return cloneEntry(entry);
}

export function removeCatalogEntry(id: string): boolean {
  return catalog.delete(id.trim());
}

/** Listing/search stub — in-memory text match on name, description, tags. */
export function searchCatalog(input: {
  query: string;
  kind?: CatalogEntryKind;
  status?: CatalogEntryStatus;
}): SearchResult {
  const query = input.query.trim().toLowerCase();
  let entries = listCatalogEntries({
    kind: input.kind,
    status: input.status ?? "LISTED",
  });

  if (query) {
    entries = entries.filter((e) => {
      const haystack = [
        e.name,
        e.description,
        ...e.tags,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }

  return {
    query: input.query,
    total: entries.length,
    entries,
    searchedAt: nowIso(),
  };
}

export function buildMarketplaceRegistryManifest(stats: {
  pluginCount: number;
  packageCount: number;
  installedCount: number;
}): MarketplaceRegistryManifest {
  return {
    marketplaceId: E10_MARKETPLACE_ID,
    version: E10_MARKETPLACE_VERSION,
    freezeVersion: E10_MARKETPLACE_FREEZE_VERSION,
    base: E10_MARKETPLACE_BASE,
    catalogCount: catalog.size,
    pluginCount: stats.pluginCount,
    packageCount: stats.packageCount,
    installedCount: stats.installedCount,
  };
}

export function clearCatalog(): void {
  catalog.clear();
}
