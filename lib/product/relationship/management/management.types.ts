/**
 * Product Relationship — readiness / manifest types
 */

import type {
  PRODUCT_RELATIONSHIP_MANAGEMENT_BASE,
  PRODUCT_RELATIONSHIP_MANAGEMENT_FREEZE_VERSION,
  PRODUCT_RELATIONSHIP_MANAGEMENT_ID,
  PRODUCT_RELATIONSHIP_MANAGEMENT_VERSION,
  RELATIONSHIP_MANAGER_STATUSES,
  RELATIONSHIP_READINESS_VERDICTS,
} from "./management.constants";

export type RelationshipReadinessVerdict =
  (typeof RELATIONSHIP_READINESS_VERDICTS)[number];
export type RelationshipManagerStatus =
  (typeof RELATIONSHIP_MANAGER_STATUSES)[number];

export type RelationshipReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type RelationshipReadinessResult = {
  verdict: RelationshipReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: RelationshipReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type RelationshipRegistryManifest = {
  managementId: typeof PRODUCT_RELATIONSHIP_MANAGEMENT_ID;
  version: typeof PRODUCT_RELATIONSHIP_MANAGEMENT_VERSION;
  freezeVersion: typeof PRODUCT_RELATIONSHIP_MANAGEMENT_FREEZE_VERSION;
  base: typeof PRODUCT_RELATIONSHIP_MANAGEMENT_BASE;
  bondCount: number;
  partyCount: number;
  classificationCount: number;
  lifecycleCount: number;
};
