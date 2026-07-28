/**
 * Product M13 — OS catalog entry registry (soft surfaceKeyRef)
 */

import { OS_CATALOG_ENTRY_STATUSES } from "./catalog.constants";
import { getOsCatalog } from "./catalog.registry";
import type {
  OsCatalogEntry,
  OsCatalogEntryStatus,
  RegisterOsCatalogEntryInput,
  UpdateOsCatalogEntryStatusInput,
} from "./catalog.types";

const entries = new Map<string, OsCatalogEntry>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneEntry(entry: OsCatalogEntry): OsCatalogEntry {
  return { ...entry, metadata: { ...entry.metadata } };
}

export function registerOsCatalogEntry(
  input: RegisterOsCatalogEntryInput,
): OsCatalogEntry {
  const catalogId = input.catalogId.trim();
  const entryKey = input.entryKey.trim().toUpperCase();
  const surfaceKeyRef = input.surfaceKeyRef.trim().toUpperCase();
  const summary = input.summary.trim();
  if (!catalogId) throw new Error("entry.catalogId is required");
  if (!entryKey) throw new Error("entry.entryKey is required");
  if (!surfaceKeyRef) throw new Error("entry.surfaceKeyRef is required");
  if (!summary) throw new Error("entry.summary is required");
  if (!Number.isInteger(input.sequence) || input.sequence < 1) {
    throw new Error("entry.sequence must be a positive integer");
  }

  const catalog = getOsCatalog(catalogId);
  if (!catalog) throw new Error(`catalog not found: ${catalogId}`);
  if (catalog.status !== "ACTIVE" && catalog.status !== "DRAFT") {
    throw new Error(`catalog not editable: ${catalogId}`);
  }

  const duplicateKey = [...entries.values()].find(
    (e) => e.catalogId === catalogId && e.entryKey === entryKey,
  );
  if (duplicateKey) throw new Error(`entryKey already exists: ${entryKey}`);

  const duplicateSeq = [...entries.values()].find(
    (e) => e.catalogId === catalogId && e.sequence === input.sequence,
  );
  if (duplicateSeq) {
    throw new Error(`entry sequence already exists: ${input.sequence}`);
  }

  const id = input.id?.trim() || createId("osentry");
  if (entries.has(id)) throw new Error(`entry already exists: ${id}`);

  const now = nowIso();
  const entry: OsCatalogEntry = {
    id,
    catalogId,
    entryKey,
    sequence: input.sequence,
    status: OS_CATALOG_ENTRY_STATUSES[0],
    surfaceKeyRef,
    summary,
    detail: `seq=${input.sequence} status=DRAFT`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  entries.set(id, entry);
  return cloneEntry(entry);
}

export function updateOsCatalogEntryStatus(
  input: UpdateOsCatalogEntryStatusInput,
): OsCatalogEntry {
  const entryId = input.entryId.trim();
  if (!entryId) throw new Error("entry.entryId is required");
  if (
    !(OS_CATALOG_ENTRY_STATUSES as readonly string[]).includes(input.status)
  ) {
    throw new Error(`invalid entry status: ${input.status}`);
  }

  const existing = entries.get(entryId);
  if (!existing) throw new Error(`entry not found: ${entryId}`);

  const updated: OsCatalogEntry = {
    ...existing,
    status: input.status,
    detail: `seq=${existing.sequence} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  entries.set(entryId, updated);
  return cloneEntry(updated);
}

export function getOsCatalogEntry(id: string): OsCatalogEntry | undefined {
  const entry = entries.get(id.trim());
  return entry ? cloneEntry(entry) : undefined;
}

export function listOsCatalogEntries(filter?: {
  catalogId?: string;
  status?: OsCatalogEntryStatus;
}): OsCatalogEntry[] {
  let result = [...entries.values()];
  if (filter?.catalogId) {
    const catalogId = filter.catalogId.trim();
    result = result.filter((e) => e.catalogId === catalogId);
  }
  if (filter?.status) {
    result = result.filter((e) => e.status === filter.status);
  }
  return result
    .slice()
    .sort(
      (a, b) =>
        a.sequence - b.sequence || a.entryKey.localeCompare(b.entryKey),
    )
    .map(cloneEntry);
}

export function clearOsCatalogEntries(): void {
  entries.clear();
}
