/**
 * Product Relationship — Party types
 */

import type { PARTY_ROLES } from "../management/management.constants";

export type PartyRole = (typeof PARTY_ROLES)[number];
export type PartyMetadata = Record<string, unknown>;

export type RelationshipParty = {
  id: string;
  bondId: string;
  subjectId: string;
  role: PartyRole;
  detail: string;
  metadata: PartyMetadata;
  attachedAt: string;
};

export type AttachPartyInput = {
  id?: string;
  bondId: string;
  subjectId: string;
  role: PartyRole;
  metadata?: PartyMetadata;
};
