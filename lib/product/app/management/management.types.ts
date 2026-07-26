/**
 * Product App — readiness / manifest types
 */

import type {
  APP_MANAGER_STATUSES,
  APP_READINESS_VERDICTS,
  PRODUCT_APP_REGISTRY_BASE,
  PRODUCT_APP_REGISTRY_FREEZE_VERSION,
  PRODUCT_APP_REGISTRY_ID,
  PRODUCT_APP_REGISTRY_VERSION,
} from "./management.constants";

export type AppReadinessVerdict = (typeof APP_READINESS_VERDICTS)[number];
export type AppManagerStatus = (typeof APP_MANAGER_STATUSES)[number];

export type AppReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type AppReadinessResult = {
  verdict: AppReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: AppReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type AppRegistryManifest = {
  managementId: typeof PRODUCT_APP_REGISTRY_ID;
  version: typeof PRODUCT_APP_REGISTRY_VERSION;
  freezeVersion: typeof PRODUCT_APP_REGISTRY_FREEZE_VERSION;
  base: typeof PRODUCT_APP_REGISTRY_BASE;
  appCount: number;
  definitionCount: number;
  versionCount: number;
  ownershipCount: number;
  releaseCount: number;
};
