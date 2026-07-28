/**
 * Product M14 — Intelligence catalog binding registry (soft analysisContractKeyRef)
 */

import { INTELLIGENCE_CATALOG_BINDING_STATUSES } from "./catalog.constants";
import { getIntelligenceCatalog } from "./catalog.registry";
import { getIntelligenceCatalogEntry } from "./entry.registry";
import type {
  BindIntelligenceCatalogEntryInput,
  IntelligenceCatalogBinding,
  IntelligenceCatalogBindingStatus,
} from "./catalog.types";

const bindings = new Map<string, IntelligenceCatalogBinding>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneBinding(
  binding: IntelligenceCatalogBinding,
): IntelligenceCatalogBinding {
  return { ...binding, metadata: { ...binding.metadata } };
}

export function bindIntelligenceCatalogEntry(
  input: BindIntelligenceCatalogEntryInput,
): IntelligenceCatalogBinding {
  const catalogId = input.catalogId.trim();
  const entryId = input.entryId.trim();
  const bindingKey = input.bindingKey.trim().toUpperCase();
  const analysisContractKeyRef = input.analysisContractKeyRef
    .trim()
    .toUpperCase();
  if (!catalogId) throw new Error("binding.catalogId is required");
  if (!entryId) throw new Error("binding.entryId is required");
  if (!bindingKey) throw new Error("binding.bindingKey is required");
  if (!analysisContractKeyRef) {
    throw new Error("binding.analysisContractKeyRef is required");
  }

  const catalog = getIntelligenceCatalog(catalogId);
  if (!catalog) throw new Error(`catalog not found: ${catalogId}`);
  if (catalog.status !== "ACTIVE") {
    throw new Error(`catalog not active: ${catalogId}`);
  }

  const entry = getIntelligenceCatalogEntry(entryId);
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

  const id = input.id?.trim() || createId("intcatbind");
  if (bindings.has(id)) throw new Error(`binding already exists: ${id}`);

  const now = nowIso();
  const binding: IntelligenceCatalogBinding = {
    id,
    catalogId,
    entryId,
    bindingKey,
    analysisContractKeyRef,
    status: INTELLIGENCE_CATALOG_BINDING_STATUSES[0],
    detail: `contract=${analysisContractKeyRef} status=BOUND`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  bindings.set(id, binding);
  return cloneBinding(binding);
}

export function getIntelligenceCatalogBinding(
  id: string,
): IntelligenceCatalogBinding | undefined {
  const binding = bindings.get(id.trim());
  return binding ? cloneBinding(binding) : undefined;
}

export function listIntelligenceCatalogBindings(filter?: {
  catalogId?: string;
  status?: IntelligenceCatalogBindingStatus;
}): IntelligenceCatalogBinding[] {
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

export function clearIntelligenceCatalogBindings(): void {
  bindings.clear();
}
