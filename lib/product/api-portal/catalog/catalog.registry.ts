/**
 * Product API Portal — catalog registry (no provider integration)
 */

import { PORTAL_CATALOG_STATUSES } from "../management/management.constants";
import { getPortal } from "../registry/portal.registry";
import type {
  PortalCatalogEntry,
  PortalCatalogStatus,
  RegisterPortalCatalogEntryInput,
  UpdatePortalCatalogStatusInput,
} from "./catalog.types";

const entries = new Map<string, PortalCatalogEntry>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function isSemver(value: string): boolean {
  return /^\d+\.\d+\.\d+$/.test(value);
}

function cloneEntry(entry: PortalCatalogEntry): PortalCatalogEntry {
  return { ...entry, metadata: { ...entry.metadata } };
}

export function registerPortalCatalogEntry(
  input: RegisterPortalCatalogEntryInput,
): PortalCatalogEntry {
  const portalId = input.portalId.trim();
  const catalogKey = input.catalogKey.trim().toUpperCase();
  const sdkPackageKeyRef = input.sdkPackageKeyRef.trim().toUpperCase();
  const sdkSemverRef = input.sdkSemverRef.trim();
  const title = input.title.trim();
  if (!portalId) throw new Error("catalog.portalId is required");
  if (!catalogKey) throw new Error("catalog.catalogKey is required");
  if (!sdkPackageKeyRef) {
    throw new Error("catalog.sdkPackageKeyRef is required");
  }
  if (!isSemver(sdkSemverRef)) {
    throw new Error(`invalid catalog sdkSemverRef: ${input.sdkSemverRef}`);
  }
  if (!title) throw new Error("catalog.title is required");

  const portal = getPortal(portalId);
  if (!portal) throw new Error(`portal not found: ${portalId}`);
  if (portal.status !== "ACTIVE") {
    throw new Error(`portal not active: ${portalId}`);
  }

  const duplicate = [...entries.values()].find(
    (e) => e.portalId === portalId && e.catalogKey === catalogKey,
  );
  if (duplicate) throw new Error(`catalogKey already exists: ${catalogKey}`);

  const id = input.id?.trim() || createId("apiportalcat");
  if (entries.has(id)) throw new Error(`catalog already exists: ${id}`);

  const now = nowIso();
  const entry: PortalCatalogEntry = {
    id,
    portalId,
    catalogKey,
    status: PORTAL_CATALOG_STATUSES[1],
    sdkPackageKeyRef,
    sdkSemverRef,
    title,
    detail: `${catalogKey} ${sdkPackageKeyRef}@${sdkSemverRef}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  entries.set(id, entry);
  return cloneEntry(entry);
}

export function updatePortalCatalogStatus(
  input: UpdatePortalCatalogStatusInput,
): PortalCatalogEntry {
  const catalogId = input.catalogId.trim();
  if (!catalogId) throw new Error("catalog.catalogId is required");
  if (!(PORTAL_CATALOG_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid catalog status: ${input.status}`);
  }

  const existing = entries.get(catalogId);
  if (!existing) throw new Error(`catalog not found: ${catalogId}`);

  const updated: PortalCatalogEntry = {
    ...existing,
    status: input.status,
    detail: `${existing.catalogKey} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  entries.set(catalogId, updated);
  return cloneEntry(updated);
}

export function getPortalCatalogEntry(
  id: string,
): PortalCatalogEntry | undefined {
  const entry = entries.get(id.trim());
  return entry ? cloneEntry(entry) : undefined;
}

export function listPortalCatalogEntries(filter?: {
  portalId?: string;
  status?: PortalCatalogStatus;
}): PortalCatalogEntry[] {
  let result = [...entries.values()];
  if (filter?.portalId) {
    const portalId = filter.portalId.trim();
    result = result.filter((e) => e.portalId === portalId);
  }
  if (filter?.status) {
    result = result.filter((e) => e.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.catalogKey.localeCompare(b.catalogKey))
    .map(cloneEntry);
}

export function clearPortalCatalogEntries(): void {
  entries.clear();
}
