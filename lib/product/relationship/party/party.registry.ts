/**
 * Product Relationship — Party registry
 */

import { PARTY_ROLES } from "../management/management.constants";
import { getBond } from "../bond/bond.registry";
import type {
  AttachPartyInput,
  PartyRole,
  RelationshipParty,
} from "./party.types";

const parties = new Map<string, RelationshipParty>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneParty(party: RelationshipParty): RelationshipParty {
  return { ...party, metadata: { ...party.metadata } };
}

export function attachParty(input: AttachPartyInput): RelationshipParty {
  const bondId = input.bondId.trim();
  const subjectId = input.subjectId.trim();
  if (!bondId) throw new Error("party.bondId is required");
  if (!subjectId) throw new Error("party.subjectId is required");
  if (!(PARTY_ROLES as readonly string[]).includes(input.role)) {
    throw new Error(`invalid party role: ${input.role}`);
  }
  if (!getBond(bondId)) throw new Error(`bond not found: ${bondId}`);

  const duplicate = [...parties.values()].find(
    (p) =>
      p.bondId === bondId &&
      p.subjectId === subjectId &&
      p.role === input.role,
  );
  if (duplicate) {
    throw new Error(
      `party already attached: ${bondId}/${subjectId}/${input.role}`,
    );
  }

  const id = input.id?.trim() || createId("relpty");
  if (parties.has(id)) throw new Error(`party already exists: ${id}`);

  const party: RelationshipParty = {
    id,
    bondId,
    subjectId,
    role: input.role,
    detail: `role=${input.role} subject=${subjectId}`,
    metadata: { ...(input.metadata ?? {}) },
    attachedAt: nowIso(),
  };
  parties.set(id, party);
  return cloneParty(party);
}

export function getParty(id: string): RelationshipParty | undefined {
  const party = parties.get(id.trim());
  return party ? cloneParty(party) : undefined;
}

export function listParties(filter?: {
  bondId?: string;
  role?: PartyRole;
}): RelationshipParty[] {
  let result = [...parties.values()];
  if (filter?.bondId) {
    const bondId = filter.bondId.trim();
    result = result.filter((p) => p.bondId === bondId);
  }
  if (filter?.role) result = result.filter((p) => p.role === filter.role);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneParty);
}

export function clearParties(): void {
  parties.clear();
}
