/**
 * Product M14 — Intelligence catalog entry registry (soft lensKeyRef)
 */

import { INTELLIGENCE_CATALOG_ENTRY_STATUSES } from "./catalog.constants";
import { getIntelligenceCatalog } from "./catalog.registry";
import type {
  IntelligenceCatalogEntry,
  IntelligenceCatalogEntryStatus,
  RegisterIntelligenceCatalogEntryInput,
  UpdateIntelligenceCatalogEntryStatusInput,
} from "./catalog.types";

const entries = new Map<string, IntelligenceCatalogEntry>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneEntry(entry: IntelligenceCatalogEntry): IntelligenceCatalogEntry {
  return { ...entry, metadata: { ...entry.metadata } };
}

export function registerIntelligenceCatalogEntry(
  input: RegisterIntelligenceCatalogEntryInput,
): IntelligenceCatalogEntry {
  const catalogId = input.catalogId.trim();
  const entryKey = input.entryKey.trim().toUpperCase();
  const lensKeyRef = input.lensKeyRef.trim().toUpperCase();
  const summary = input.summary.trim();
  if (!catalogId) throw new Error("entry.catalogId is required");
  if (!entryKey) throw new Error("entry.entryKey is required");
  if (!lensKeyRef) throw new Error("entry.lensKeyRef is required");
  if (!summary) throw new Error("entry.summary is required");
  if (!Number.isInteger(input.sequence) || input.sequence < 1) {
    throw new Error("entry.sequence must be a positive integer");
  }

  const catalog = getIntelligenceCatalog(catalogId);
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

  const id = input.id?.trim() || createId("intentry");
  if (entries.has(id)) throw new Error(`entry already exists: ${id}`);

  const now = nowIso();
  const entry: IntelligenceCatalogEntry = {
    id,
    catalogId,
    entryKey,
    sequence: input.sequence,
    status: INTELLIGENCE_CATALOG_ENTRY_STATUSES[0],
    lensKeyRef,
    summary,
    detail: `seq=${input.sequence} status=DRAFT`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  entries.set(id, entry);
  return cloneEntry(entry);
}

export function updateIntelligenceCatalogEntryStatus(
  input: UpdateIntelligenceCatalogEntryStatusInput,
): IntelligenceCatalogEntry {
  const entryId = input.entryId.trim();
  if (!entryId) throw new Error("entry.entryId is required");
  if (
    !(INTELLIGENCE_CATALOG_ENTRY_STATUSES as readonly string[]).includes(
      input.status,
    )
  ) {
    throw new Error(`invalid entry status: ${input.status}`);
  }

  const existing = entries.get(entryId);
  if (!existing) throw new Error(`entry not found: ${entryId}`);

  const updated: IntelligenceCatalogEntry = {
    ...existing,
    status: input.status,
    detail: `seq=${existing.sequence} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  entries.set(entryId, updated);
  return cloneEntry(updated);
}

export function getIntelligenceCatalogEntry(
  id: string,
): IntelligenceCatalogEntry | undefined {
  const entry = entries.get(id.trim());
  return entry ? cloneEntry(entry) : undefined;
}

export function listIntelligenceCatalogEntries(filter?: {
  catalogId?: string;
  status?: IntelligenceCatalogEntryStatus;
}): IntelligenceCatalogEntry[] {
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
    .sort((a, b) => a.sequence - b.sequence || a.entryKey.localeCompare(b.entryKey))
    .map(cloneEntry);
}

export function clearIntelligenceCatalogEntries(): void {
  entries.clear();
}
