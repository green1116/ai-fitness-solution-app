/**
 * Product Relationship — Bond types
 */

import type {
  RELATIONSHIP_KINDS,
  RELATIONSHIP_STATUSES,
} from "../management/management.constants";

export type RelationshipKind = (typeof RELATIONSHIP_KINDS)[number];
export type RelationshipStatus = (typeof RELATIONSHIP_STATUSES)[number];
export type BondMetadata = Record<string, unknown>;

export type RelationshipBond = {
  id: string;
  customerId: string;
  relatedCustomerId: string;
  kind: RelationshipKind;
  status: RelationshipStatus;
  detail: string;
  metadata: BondMetadata;
  createdAt: string;
  updatedAt: string;
};

export type CreateBondInput = {
  id?: string;
  customerId: string;
  relatedCustomerId: string;
  kind: RelationshipKind;
  metadata?: BondMetadata;
};

export type UpdateBondStatusInput = {
  bondId: string;
  status: RelationshipStatus;
};
