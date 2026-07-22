/**
 * Commercialization P2 — Packaging shared types (readiness / manifest)
 */

import type {
  COMMERCIALIZATION_PRODUCT_PACKAGING_BASE,
  COMMERCIALIZATION_PRODUCT_PACKAGING_FREEZE_VERSION,
  COMMERCIALIZATION_PRODUCT_PACKAGING_ID,
  COMMERCIALIZATION_PRODUCT_PACKAGING_VERSION,
  PACKAGING_MANAGER_STATUSES,
  PACKAGING_READINESS_VERDICTS,
} from "./tier/tier.constants";

export type PackagingReadinessVerdict =
  (typeof PACKAGING_READINESS_VERDICTS)[number];
export type PackagingManagerStatus =
  (typeof PACKAGING_MANAGER_STATUSES)[number];

export type PackagingReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type PackagingReadinessResult = {
  verdict: PackagingReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: PackagingReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type PackagingRegistryManifest = {
  foundationId: typeof COMMERCIALIZATION_PRODUCT_PACKAGING_ID;
  version: typeof COMMERCIALIZATION_PRODUCT_PACKAGING_VERSION;
  freezeVersion: typeof COMMERCIALIZATION_PRODUCT_PACKAGING_FREEZE_VERSION;
  base: typeof COMMERCIALIZATION_PRODUCT_PACKAGING_BASE;
  productCount: number;
  catalogCount: number;
  packageCount: number;
  compositionCount: number;
  scopeCount: number;
  modelCount: number;
};
