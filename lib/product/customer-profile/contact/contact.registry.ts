/**
 * Product Customer Profile — Contact registry
 */

import { CONTACT_KINDS } from "../profile/profile.constants";
import { getIdentity } from "../identity/identity.registry";
import type {
  AddContactInput,
  ContactKind,
  CustomerProfileContact,
} from "./contact.types";

const contacts = new Map<string, CustomerProfileContact>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneContact(
  contact: CustomerProfileContact,
): CustomerProfileContact {
  return { ...contact, metadata: { ...contact.metadata } };
}

export function addContact(input: AddContactInput): CustomerProfileContact {
  const identityId = input.identityId.trim();
  const value = input.value.trim();
  if (!identityId) throw new Error("contact.identityId is required");
  if (!value) throw new Error("contact.value is required");
  if (!(CONTACT_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid contact kind: ${input.kind}`);
  }
  if (!getIdentity(identityId)) {
    throw new Error(`identity not found: ${identityId}`);
  }

  const duplicate = [...contacts.values()].find(
    (c) =>
      c.identityId === identityId &&
      c.kind === input.kind &&
      c.value === value,
  );
  if (duplicate) {
    throw new Error(
      `contact already exists: ${identityId}/${input.kind}/${value}`,
    );
  }

  const id = input.id?.trim() || createId("cprfct");
  if (contacts.has(id)) throw new Error(`contact already exists: ${id}`);

  const contact: CustomerProfileContact = {
    id,
    identityId,
    kind: input.kind,
    value,
    primary: input.primary === true,
    detail: `kind=${input.kind} primary=${input.primary === true}`,
    metadata: { ...(input.metadata ?? {}) },
    addedAt: nowIso(),
  };
  contacts.set(id, contact);
  return cloneContact(contact);
}

export function getContact(id: string): CustomerProfileContact | undefined {
  const contact = contacts.get(id.trim());
  return contact ? cloneContact(contact) : undefined;
}

export function listContacts(filter?: {
  identityId?: string;
  kind?: ContactKind;
}): CustomerProfileContact[] {
  let result = [...contacts.values()];
  if (filter?.identityId) {
    const identityId = filter.identityId.trim();
    result = result.filter((c) => c.identityId === identityId);
  }
  if (filter?.kind) result = result.filter((c) => c.kind === filter.kind);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneContact);
}

export function clearContacts(): void {
  contacts.clear();
}
