/**
 * Product M13 — OS catalog binding registry (soft operationContractKeyRef)
 */

import { OS_CATALOG_BINDING_STATUSES } from "./catalog.constants";
import { getOsCatalog } from "./catalog.registry";
import { getOsCatalogEntry } from "./entry.registry";
import type {
  BindOsCatalogEntryInput,
  OsCatalogBinding,
  OsCatalogBindingStatus,
} from "./catalog.types";

const bindings = new Map<string, OsCatalogBinding>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneBinding(binding: OsCatalogBinding): OsCatalogBinding {
  return { ...binding, metadata: { ...binding.metadata } };
}

export function bindOsCatalogEntry(
  input: BindOsCatalogEntryInput,
): OsCatalogBinding {
  const catalogId = input.catalogId.trim();
  const entryId = input.entryId.trim();
  const bindingKey = input.bindingKey.trim().toUpperCase();
  const operationContractKeyRef = input.operationContractKeyRef
    .trim()
    .toUpperCase();
  if (!catalogId) throw new Error("binding.catalogId is required");
  if (!entryId) throw new Error("binding.entryId is required");
  if (!bindingKey) throw new Error("binding.bindingKey is required");
  if (!operationContractKeyRef) {
    throw new Error("binding.operationContractKeyRef is required");
  }

  const catalog = getOsCatalog(catalogId);
  if (!catalog) throw new Error(`catalog not found: ${catalogId}`);
  if (catalog.status !== "ACTIVE") {
    throw new Error(`catalog not active: ${catalogId}`);
  }

  const entry = getOsCatalogEntry(entryId);
  if (!entry) throw new Error(`entry not found: ${entryId}`);
  if (entry.catalogId !== catalogId) {
    throw new Error(`entry catalog mismatch: ${entryId}`);
  }
  if (entry.status !== "DECLARED") {
    throw new Error(`entry not declared: ${entryId}`);
  }

  const duplicate = [...bindings.values()].find(
    (b) => b.catalogId === catalogId && b.bindingKey === bindingKey,
  );
  if (duplicate) {
    throw new Error(`bindingKey already exists: ${bindingKey}`);
  }

  const id = input.id?.trim() || createId("oscatbind");
  if (bindings.has(id)) throw new Error(`binding already exists: ${id}`);

  const now = nowIso();
  const binding: OsCatalogBinding = {
    id,
    catalogId,
    entryId,
    bindingKey,
    operationContractKeyRef,
    status: OS_CATALOG_BINDING_STATUSES[0],
    detail: `contract=${operationContractKeyRef} status=BOUND`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  bindings.set(id, binding);
  return cloneBinding(binding);
}

export function getOsCatalogBinding(id: string): OsCatalogBinding | undefined {
  const binding = bindings.get(id.trim());
  return binding ? cloneBinding(binding) : undefined;
}

export function listOsCatalogBindings(filter?: {
  catalogId?: string;
  status?: OsCatalogBindingStatus;
}): OsCatalogBinding[] {
  let result = [...bindings.values()];
  if (filter?.catalogId) {
    const catalogId = filter.catalogId.trim();
    result = result.filter((b) => b.catalogId === catalogId);
  }
  if (filter?.status) {
    result = result.filter((b) => b.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.bindingKey.localeCompare(b.bindingKey))
    .map(cloneBinding);
}

export function clearOsCatalogBindings(): void {
  bindings.clear();
}
