/**
 * Product M12 — Agent catalog entry registry (soft agentKeyRef)
 */

import { AGENT_CATALOG_ENTRY_STATUSES } from "./catalog.constants";
import { getAgentCatalog } from "./catalog.registry";
import type {
  AgentCatalogEntry,
  AgentCatalogEntryStatus,
  RegisterAgentCatalogEntryInput,
  UpdateAgentCatalogEntryStatusInput,
} from "./catalog.types";

const entries = new Map<string, AgentCatalogEntry>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneEntry(entry: AgentCatalogEntry): AgentCatalogEntry {
  return { ...entry, metadata: { ...entry.metadata } };
}

export function registerAgentCatalogEntry(
  input: RegisterAgentCatalogEntryInput,
): AgentCatalogEntry {
  const catalogId = input.catalogId.trim();
  const entryKey = input.entryKey.trim().toUpperCase();
  const agentKeyRef = input.agentKeyRef.trim().toUpperCase();
  const summary = input.summary.trim();
  if (!catalogId) throw new Error("entry.catalogId is required");
  if (!entryKey) throw new Error("entry.entryKey is required");
  if (!agentKeyRef) throw new Error("entry.agentKeyRef is required");
  if (!summary) throw new Error("entry.summary is required");
  if (!Number.isInteger(input.sequence) || input.sequence < 1) {
    throw new Error("entry.sequence must be a positive integer");
  }

  const catalog = getAgentCatalog(catalogId);
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

  const id = input.id?.trim() || createId("agtentry");
  if (entries.has(id)) throw new Error(`entry already exists: ${id}`);

  const now = nowIso();
  const entry: AgentCatalogEntry = {
    id,
    catalogId,
    entryKey,
    sequence: input.sequence,
    status: AGENT_CATALOG_ENTRY_STATUSES[0],
    agentKeyRef,
    summary,
    detail: `seq=${input.sequence} status=DRAFT`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  entries.set(id, entry);
  return cloneEntry(entry);
}

export function updateAgentCatalogEntryStatus(
  input: UpdateAgentCatalogEntryStatusInput,
): AgentCatalogEntry {
  const entryId = input.entryId.trim();
  if (!entryId) throw new Error("entry.entryId is required");
  if (
    !(AGENT_CATALOG_ENTRY_STATUSES as readonly string[]).includes(input.status)
  ) {
    throw new Error(`invalid entry status: ${input.status}`);
  }

  const existing = entries.get(entryId);
  if (!existing) throw new Error(`entry not found: ${entryId}`);

  const updated: AgentCatalogEntry = {
    ...existing,
    status: input.status,
    detail: `seq=${existing.sequence} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  entries.set(entryId, updated);
  return cloneEntry(updated);
}

export function getAgentCatalogEntry(
  id: string,
): AgentCatalogEntry | undefined {
  const entry = entries.get(id.trim());
  return entry ? cloneEntry(entry) : undefined;
}

export function listAgentCatalogEntries(filter?: {
  catalogId?: string;
  status?: AgentCatalogEntryStatus;
}): AgentCatalogEntry[] {
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

export function clearAgentCatalogEntries(): void {
  entries.clear();
}
