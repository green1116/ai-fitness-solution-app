/**
 * Commercialization P2 — Package types
 */

import type {
  PACKAGE_KINDS,
  PACKAGE_STATUSES,
  TIER_LEVELS,
} from "../tier/tier.constants";

export type PackageKind = (typeof PACKAGE_KINDS)[number];
export type PackageStatus = (typeof PACKAGE_STATUSES)[number];
export type TierLevel = (typeof TIER_LEVELS)[number];
export type PackageMetadata = Record<string, unknown>;

export type ProductPackage = {
  id: string;
  name: string;
  productId: string;
  kind: PackageKind;
  tier: TierLevel;
  status: PackageStatus;
  includedFeatureIds: string[];
  detail: string;
  metadata: PackageMetadata;
  createdAt: string;
  updatedAt: string;
  composedAt?: string;
};

export type RegisterPackageInput = {
  id?: string;
  name: string;
  productId: string;
  kind: PackageKind;
  tier: TierLevel;
  includedFeatureIds?: string[];
  metadata?: PackageMetadata;
};

export type PackageComposition = {
  id: string;
  packageId: string;
  productId: string;
  tier: TierLevel;
  featureCount: number;
  entitlementScore: number;
  compositionNotes: string[];
  detail: string;
  composedAt: string;
};

export type ComposePackageInput = {
  id?: string;
  packageId: string;
  featureIds?: string[];
};
