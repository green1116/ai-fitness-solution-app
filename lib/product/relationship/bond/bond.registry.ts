/**
 * Product Relationship — Bond registry
 */

import {
  RELATIONSHIP_KINDS,
  RELATIONSHIP_STATUSES,
} from "../management/management.constants";
import type {
  CreateBondInput,
  RelationshipBond,
  RelationshipKind,
  RelationshipStatus,
  UpdateBondStatusInput,
} from "./bond.types";

const bonds = new Map<string, RelationshipBond>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneBond(bond: RelationshipBond): RelationshipBond {
  return { ...bond, metadata: { ...bond.metadata } };
}

export function createBond(input: CreateBondInput): RelationshipBond {
  const customerId = input.customerId.trim();
  const relatedCustomerId = input.relatedCustomerId.trim();
  if (!customerId) throw new Error("bond.customerId is required");
  if (!relatedCustomerId) {
    throw new Error("bond.relatedCustomerId is required");
  }
  if (customerId === relatedCustomerId) {
    throw new Error("bond customer and related must differ");
  }
  if (!(RELATIONSHIP_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid relationship kind: ${input.kind}`);
  }

  const duplicate = [...bonds.values()].find(
    (b) =>
      b.customerId === customerId &&
      b.relatedCustomerId === relatedCustomerId &&
      b.kind === input.kind &&
      b.status !== "CLOSED",
  );
  if (duplicate) {
    throw new Error(
      `bond already exists: ${customerId}/${relatedCustomerId}/${input.kind}`,
    );
  }

  const id = input.id?.trim() || createId("relbond");
  if (bonds.has(id)) throw new Error(`bond already exists: ${id}`);

  const now = nowIso();
  const bond: RelationshipBond = {
    id,
    customerId,
    relatedCustomerId,
    kind: input.kind,
    status: RELATIONSHIP_STATUSES[0],
    detail: `kind=${input.kind} status=PROSPECT`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  bonds.set(id, bond);
  return cloneBond(bond);
}

export function updateBondStatus(
  input: UpdateBondStatusInput,
): RelationshipBond {
  const bondId = input.bondId.trim();
  if (!bondId) throw new Error("bond.bondId is required");
  if (!(RELATIONSHIP_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid relationship status: ${input.status}`);
  }

  const existing = bonds.get(bondId);
  if (!existing) throw new Error(`bond not found: ${bondId}`);

  const updated: RelationshipBond = {
    ...existing,
    status: input.status,
    detail: `kind=${existing.kind} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  bonds.set(bondId, updated);
  return cloneBond(updated);
}

export function getBond(id: string): RelationshipBond | undefined {
  const bond = bonds.get(id.trim());
  return bond ? cloneBond(bond) : undefined;
}

export function listBonds(filter?: {
  customerId?: string;
  kind?: RelationshipKind;
  status?: RelationshipStatus;
}): RelationshipBond[] {
  let result = [...bonds.values()];
  if (filter?.customerId) {
    const customerId = filter.customerId.trim();
    result = result.filter(
      (b) =>
        b.customerId === customerId || b.relatedCustomerId === customerId,
    );
  }
  if (filter?.kind) result = result.filter((b) => b.kind === filter.kind);
  if (filter?.status) {
    result = result.filter((b) => b.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneBond);
}

export function clearBonds(): void {
  bonds.clear();
}
