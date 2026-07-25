/**
 * Product BI — Sync registry
 */

import { getCatalogEntry } from "../catalog/catalog.registry";
import { BI_SYNC_RESULTS } from "../integration/integration.constants";
import type {
  BiSyncResult,
  BiSyncRun,
  RunBiSyncInput,
} from "./sync.types";

const syncs = new Map<string, BiSyncRun>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneSync(sync: BiSyncRun): BiSyncRun {
  return { ...sync, metadata: { ...sync.metadata } };
}

export function runBiSync(input: RunBiSyncInput): BiSyncRun {
  const catalogId = input.catalogId.trim();
  if (!catalogId) throw new Error("sync.catalogId is required");
  if (!(BI_SYNC_RESULTS as readonly string[]).includes(input.result)) {
    throw new Error(`invalid bi sync result: ${input.result}`);
  }
  if (!Number.isFinite(input.rowCount) || input.rowCount < 0) {
    throw new Error("sync.rowCount must be a non-negative number");
  }
  if (!getCatalogEntry(catalogId)) {
    throw new Error(`catalog entry not found: ${catalogId}`);
  }

  const id = input.id?.trim() || createId("bisync");
  if (syncs.has(id)) throw new Error(`sync already exists: ${id}`);

  const sync: BiSyncRun = {
    id,
    catalogId,
    result: input.result,
    rowCount: input.rowCount,
    detail: `result=${input.result} rows=${input.rowCount}`,
    metadata: { ...(input.metadata ?? {}) },
    syncedAt: nowIso(),
  };
  syncs.set(id, sync);
  return cloneSync(sync);
}

export function getBiSync(id: string): BiSyncRun | undefined {
  const sync = syncs.get(id.trim());
  return sync ? cloneSync(sync) : undefined;
}

export function listBiSyncs(filter?: {
  catalogId?: string;
  result?: BiSyncResult;
}): BiSyncRun[] {
  let result = [...syncs.values()];
  if (filter?.catalogId) {
    const catalogId = filter.catalogId.trim();
    result = result.filter((s) => s.catalogId === catalogId);
  }
  if (filter?.result) {
    result = result.filter((s) => s.result === filter.result);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneSync);
}

export function clearBiSyncs(): void {
  syncs.clear();
}
