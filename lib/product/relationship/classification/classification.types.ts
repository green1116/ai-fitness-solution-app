/**
 * Product Relationship — Classification types
 */

import type { CLASSIFICATION_TIERS } from "../management/management.constants";

export type ClassificationTier = (typeof CLASSIFICATION_TIERS)[number];
export type ClassificationMetadata = Record<string, unknown>;

export type RelationshipClassification = {
  id: string;
  bondId: string;
  tier: ClassificationTier;
  detail: string;
  metadata: ClassificationMetadata;
  classifiedAt: string;
};

export type ClassifyBondInput = {
  id?: string;
  bondId: string;
  tier: ClassificationTier;
  metadata?: ClassificationMetadata;
};
