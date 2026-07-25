/**
 * Product BI — Catalog registry
 */

import { getConnector } from "../connector/connector.registry";
import type {
  BiCatalogEntry,
  RegisterCatalogEntryInput,
} from "./catalog.types";

const catalog = new Map<string, BiCatalogEntry>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneEntry(entry: BiCatalogEntry): BiCatalogEntry {
  return { ...entry, metadata: { ...entry.metadata } };
}

export function registerCatalogEntry(
  input: RegisterCatalogEntryInput,
): BiCatalogEntry {
  const connectorId = input.connectorId.trim();
  const datasetCode = input.datasetCode.trim().toUpperCase();
  const sourceRef = input.sourceRef.trim();
  if (!connectorId) throw new Error("catalog.connectorId is required");
  if (!datasetCode) throw new Error("catalog.datasetCode is required");
  if (!sourceRef) throw new Error("catalog.sourceRef is required");

  const connector = getConnector(connectorId);
  if (!connector) throw new Error(`connector not found: ${connectorId}`);
  if (connector.status !== "CONNECTED") {
    throw new Error(`connector not connected: ${connectorId}`);
  }

  const duplicate = [...catalog.values()].find(
    (e) =>
      e.connectorId === connectorId && e.datasetCode === datasetCode,
  );
  if (duplicate) {
    throw new Error(
      `catalog entry already exists: ${connectorId}/${datasetCode}`,
    );
  }

  const id = input.id?.trim() || createId("bicat");
  if (catalog.has(id)) throw new Error(`catalog entry already exists: ${id}`);

  const entry: BiCatalogEntry = {
    id,
    connectorId,
    datasetCode,
    sourceRef,
    detail: `dataset=${datasetCode} ref=${sourceRef}`,
    metadata: { ...(input.metadata ?? {}) },
    registeredAt: nowIso(),
  };
  catalog.set(id, entry);
  return cloneEntry(entry);
}

export function getCatalogEntry(id: string): BiCatalogEntry | undefined {
  const entry = catalog.get(id.trim());
  return entry ? cloneEntry(entry) : undefined;
}

export function listCatalogEntries(filter?: {
  connectorId?: string;
}): BiCatalogEntry[] {
  let result = [...catalog.values()];
  if (filter?.connectorId) {
    const connectorId = filter.connectorId.trim();
    result = result.filter((e) => e.connectorId === connectorId);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneEntry);
}

export function clearCatalogEntries(): void {
  catalog.clear();
}
