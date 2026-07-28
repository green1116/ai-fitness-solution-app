/**
 * Product M13 — OS compatibility binding registry
 */

import {
  OS_COMPATIBILITY_BINDING_STATUSES,
  OS_COMPATIBILITY_CONSTRAINTS,
} from "./compatibility.constants";
import { getOsCompatibilityMatrix } from "./matrix.registry";
import { getOsCompatibilityPair } from "./pair.registry";
import type {
  BindOsCompatibilityPairInput,
  OsCompatibilityBinding,
  OsCompatibilityBindingStatus,
} from "./compatibility.types";

const bindings = new Map<string, OsCompatibilityBinding>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneBinding(
  binding: OsCompatibilityBinding,
): OsCompatibilityBinding {
  return { ...binding, metadata: { ...binding.metadata } };
}

export function bindOsCompatibilityPair(
  input: BindOsCompatibilityPairInput,
): OsCompatibilityBinding {
  const matrixId = input.matrixId.trim();
  const pairId = input.pairId.trim();
  const bindingKey = input.bindingKey.trim().toUpperCase();
  const fallbackVersionRef = input.fallbackVersionRef.trim().toLowerCase();
  if (!matrixId) throw new Error("binding.matrixId is required");
  if (!pairId) throw new Error("binding.pairId is required");
  if (!bindingKey) throw new Error("binding.bindingKey is required");
  if (!fallbackVersionRef) {
    throw new Error("binding.fallbackVersionRef is required");
  }
  if (
    !(OS_COMPATIBILITY_CONSTRAINTS as readonly string[]).includes(
      input.constraint,
    )
  ) {
    throw new Error(`invalid binding constraint: ${input.constraint}`);
  }

  const matrix = getOsCompatibilityMatrix(matrixId);
  if (!matrix) throw new Error(`matrix not found: ${matrixId}`);
  if (matrix.status !== "ACTIVE") {
    throw new Error(`matrix not active: ${matrixId}`);
  }

  const pair = getOsCompatibilityPair(pairId);
  if (!pair) throw new Error(`pair not found: ${pairId}`);
  if (pair.matrixId !== matrixId) {
    throw new Error(`pair matrix mismatch: ${pairId}`);
  }
  if (pair.status !== "DECLARED") {
    throw new Error(`pair not declared: ${pairId}`);
  }

  const duplicate = [...bindings.values()].find(
    (b) => b.matrixId === matrixId && b.bindingKey === bindingKey,
  );
  if (duplicate) {
    throw new Error(`bindingKey already exists: ${bindingKey}`);
  }

  const id = input.id?.trim() || createId("oscmpbind");
  if (bindings.has(id)) throw new Error(`binding already exists: ${id}`);

  const now = nowIso();
  const binding: OsCompatibilityBinding = {
    id,
    matrixId,
    pairId,
    bindingKey,
    constraint: input.constraint,
    fallbackVersionRef,
    status: OS_COMPATIBILITY_BINDING_STATUSES[0],
    detail: `constraint=${input.constraint} status=BOUND`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  bindings.set(id, binding);
  return cloneBinding(binding);
}

export function getOsCompatibilityBinding(
  id: string,
): OsCompatibilityBinding | undefined {
  const binding = bindings.get(id.trim());
  return binding ? cloneBinding(binding) : undefined;
}

export function listOsCompatibilityBindings(filter?: {
  matrixId?: string;
  status?: OsCompatibilityBindingStatus;
}): OsCompatibilityBinding[] {
  let result = [...bindings.values()];
  if (filter?.matrixId) {
    const matrixId = filter.matrixId.trim();
    result = result.filter((b) => b.matrixId === matrixId);
  }
  if (filter?.status) {
    result = result.filter((b) => b.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.bindingKey.localeCompare(b.bindingKey))
    .map(cloneBinding);
}

export function clearOsCompatibilityBindings(): void {
  bindings.clear();
}
