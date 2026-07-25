/**
 * Product Customer — Relationship types
 */

import type { RELATIONSHIP_KINDS } from "../foundation/foundation.constants";

export type RelationshipKind = (typeof RELATIONSHIP_KINDS)[number];
export type RelationshipMetadata = Record<string, unknown>;

export type CustomerRelationship = {
  id: string;
  customerId: string;
  accountId: string;
  kind: RelationshipKind;
  detail: string;
  metadata: RelationshipMetadata;
  linkedAt: string;
};

export type LinkRelationshipInput = {
  id?: string;
  customerId: string;
  accountId: string;
  kind?: RelationshipKind;
  metadata?: RelationshipMetadata;
};
