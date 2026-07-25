/**
 * Product Customer Profile — Attribute registry
 */

import { ATTRIBUTE_KINDS } from "../profile/profile.constants";
import { getIdentity } from "../identity/identity.registry";
import type {
  AssignAttributeInput,
  AttributeKind,
  CustomerProfileAttribute,
} from "./attribute.types";

const attributes = new Map<string, CustomerProfileAttribute>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneAttribute(
  attribute: CustomerProfileAttribute,
): CustomerProfileAttribute {
  return { ...attribute, metadata: { ...attribute.metadata } };
}

export function assignAttribute(
  input: AssignAttributeInput,
): CustomerProfileAttribute {
  const identityId = input.identityId.trim();
  const key = input.key.trim();
  const value = input.value.trim();
  if (!identityId) throw new Error("attribute.identityId is required");
  if (!key) throw new Error("attribute.key is required");
  if (!value) throw new Error("attribute.value is required");
  if (!(ATTRIBUTE_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid attribute kind: ${input.kind}`);
  }
  if (!getIdentity(identityId)) {
    throw new Error(`identity not found: ${identityId}`);
  }

  const duplicate = [...attributes.values()].find(
    (a) =>
      a.identityId === identityId &&
      a.kind === input.kind &&
      a.key === key,
  );
  if (duplicate) {
    throw new Error(
      `attribute already assigned: ${identityId}/${input.kind}/${key}`,
    );
  }

  const id = input.id?.trim() || createId("cprfat");
  if (attributes.has(id)) {
    throw new Error(`attribute already exists: ${id}`);
  }

  const attribute: CustomerProfileAttribute = {
    id,
    identityId,
    kind: input.kind,
    key,
    value,
    detail: `kind=${input.kind} key=${key}`,
    metadata: { ...(input.metadata ?? {}) },
    assignedAt: nowIso(),
  };
  attributes.set(id, attribute);
  return cloneAttribute(attribute);
}

export function getAttribute(
  id: string,
): CustomerProfileAttribute | undefined {
  const attribute = attributes.get(id.trim());
  return attribute ? cloneAttribute(attribute) : undefined;
}

export function listAttributes(filter?: {
  identityId?: string;
  kind?: AttributeKind;
}): CustomerProfileAttribute[] {
  let result = [...attributes.values()];
  if (filter?.identityId) {
    const identityId = filter.identityId.trim();
    result = result.filter((a) => a.identityId === identityId);
  }
  if (filter?.kind) result = result.filter((a) => a.kind === filter.kind);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneAttribute);
}

export function clearAttributes(): void {
  attributes.clear();
}
