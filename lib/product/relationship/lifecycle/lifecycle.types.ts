/**
 * Product Relationship — Lifecycle types
 */

import type { RELATIONSHIP_STATUSES } from "../management/management.constants";
import type { RelationshipStatus } from "../bond/bond.types";

export type LifecycleMetadata = Record<string, unknown>;

export type RelationshipLifecycleEvent = {
  id: string;
  bondId: string;
  fromStatus: RelationshipStatus;
  toStatus: (typeof RELATIONSHIP_STATUSES)[number];
  detail: string;
  metadata: LifecycleMetadata;
  transitionedAt: string;
};

export type TransitionBondLifecycleInput = {
  id?: string;
  bondId: string;
  toStatus: RelationshipStatus;
  metadata?: LifecycleMetadata;
};
