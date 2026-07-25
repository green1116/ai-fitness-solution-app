/**
 * Product P9 — Expansion registry
 */

import { EXPANSION_STATUSES } from "../customer-health/health.constants";
import { getCustomerHealth } from "../customer-health/health.registry";
import type {
  CreateExpansionInput,
  ExpansionOpportunity,
  UpdateExpansionStatusInput,
} from "./expansion.types";

const expansions = new Map<string, ExpansionOpportunity>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneExpansion(
  expansion: ExpansionOpportunity,
): ExpansionOpportunity {
  return { ...expansion, metadata: { ...expansion.metadata } };
}

export function createExpansion(
  input: CreateExpansionInput,
): ExpansionOpportunity {
  const healthId = input.healthId.trim();
  const title = input.title.trim();
  if (!healthId) throw new Error("expansion.healthId is required");
  if (!title) throw new Error("expansion.title is required");
  if (!Number.isFinite(input.estimatedArr) || input.estimatedArr < 0) {
    throw new Error("expansion.estimatedArr must be a non-negative number");
  }
  if (!getCustomerHealth(healthId)) {
    throw new Error(`customer health not found: ${healthId}`);
  }

  const id = input.id?.trim() || createId("p9exp");
  if (expansions.has(id)) {
    throw new Error(`expansion already exists: ${id}`);
  }

  const now = nowIso();
  const status = EXPANSION_STATUSES[0];
  const expansion: ExpansionOpportunity = {
    id,
    healthId,
    title,
    estimatedArr: input.estimatedArr,
    status,
    detail: `status=${status} arr=${input.estimatedArr}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  expansions.set(id, expansion);
  return cloneExpansion(expansion);
}

export function updateExpansionStatus(
  input: UpdateExpansionStatusInput,
): ExpansionOpportunity {
  const expansionId = input.expansionId.trim();
  if (!expansionId) throw new Error("expansion.expansionId is required");
  if (!(EXPANSION_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid expansion status: ${input.status}`);
  }
  const existing = expansions.get(expansionId);
  if (!existing) throw new Error(`expansion not found: ${expansionId}`);

  const updated: ExpansionOpportunity = {
    ...existing,
    status: input.status,
    detail: `status=${input.status} arr=${existing.estimatedArr}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  expansions.set(expansionId, updated);
  return cloneExpansion(updated);
}

export function getExpansion(id: string): ExpansionOpportunity | undefined {
  const expansion = expansions.get(id.trim());
  return expansion ? cloneExpansion(expansion) : undefined;
}

export function listExpansions(filter?: {
  healthId?: string;
}): ExpansionOpportunity[] {
  let result = [...expansions.values()];
  if (filter?.healthId) {
    const hid = filter.healthId.trim();
    result = result.filter((e) => e.healthId === hid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneExpansion);
}

export function clearExpansions(): void {
  expansions.clear();
}
