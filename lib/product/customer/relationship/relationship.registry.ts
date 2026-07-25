/**
 * Product Customer — Relationship registry
 */

import { RELATIONSHIP_KINDS } from "../foundation/foundation.constants";
import { getCustomer } from "../profile/profile.registry";
import type {
  CustomerRelationship,
  LinkRelationshipInput,
  RelationshipKind,
} from "./relationship.types";

const relationships = new Map<string, CustomerRelationship>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneRelationship(
  relationship: CustomerRelationship,
): CustomerRelationship {
  return { ...relationship, metadata: { ...relationship.metadata } };
}

export function linkRelationship(
  input: LinkRelationshipInput,
): CustomerRelationship {
  const customerId = input.customerId.trim();
  const accountId = input.accountId.trim();
  if (!customerId) throw new Error("relationship.customerId is required");
  if (!accountId) throw new Error("relationship.accountId is required");

  const kind = input.kind ?? RELATIONSHIP_KINDS[0];
  if (!(RELATIONSHIP_KINDS as readonly string[]).includes(kind)) {
    throw new Error(`invalid relationship kind: ${kind}`);
  }
  if (!getCustomer(customerId)) {
    throw new Error(`customer not found: ${customerId}`);
  }

  const duplicate = [...relationships.values()].find(
    (r) =>
      r.customerId === customerId &&
      r.accountId === accountId &&
      r.kind === kind,
  );
  if (duplicate) {
    throw new Error(
      `relationship already linked: ${customerId}/${accountId}/${kind}`,
    );
  }

  const id = input.id?.trim() || createId("cusrel");
  if (relationships.has(id)) {
    throw new Error(`relationship already exists: ${id}`);
  }

  const relationship: CustomerRelationship = {
    id,
    customerId,
    accountId,
    kind,
    detail: `kind=${kind} account=${accountId}`,
    metadata: { ...(input.metadata ?? {}) },
    linkedAt: nowIso(),
  };
  relationships.set(id, relationship);
  return cloneRelationship(relationship);
}

export function getRelationship(
  id: string,
): CustomerRelationship | undefined {
  const relationship = relationships.get(id.trim());
  return relationship ? cloneRelationship(relationship) : undefined;
}

export function listRelationships(filter?: {
  customerId?: string;
  kind?: RelationshipKind;
}): CustomerRelationship[] {
  let result = [...relationships.values()];
  if (filter?.customerId) {
    const customerId = filter.customerId.trim();
    result = result.filter((r) => r.customerId === customerId);
  }
  if (filter?.kind) result = result.filter((r) => r.kind === filter.kind);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneRelationship);
}

export function clearRelationships(): void {
  relationships.clear();
}
