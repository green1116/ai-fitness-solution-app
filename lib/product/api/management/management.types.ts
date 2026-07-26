/**
 * Product API — readiness / manifest types
 */

import type {
  API_MANAGER_STATUSES,
  API_READINESS_VERDICTS,
  PRODUCT_API_FOUNDATION_BASE,
  PRODUCT_API_FOUNDATION_FREEZE_VERSION,
  PRODUCT_API_FOUNDATION_ID,
  PRODUCT_API_FOUNDATION_VERSION,
} from "./management.constants";

export type ApiReadinessVerdict = (typeof API_READINESS_VERDICTS)[number];
export type ApiManagerStatus = (typeof API_MANAGER_STATUSES)[number];

export type ApiReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type ApiReadinessResult = {
  verdict: ApiReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: ApiReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type ApiRegistryManifest = {
  foundationId: typeof PRODUCT_API_FOUNDATION_ID;
  version: typeof PRODUCT_API_FOUNDATION_VERSION;
  freezeVersion: typeof PRODUCT_API_FOUNDATION_FREEZE_VERSION;
  base: typeof PRODUCT_API_FOUNDATION_BASE;
  apiCount: number;
  definitionCount: number;
  versionCount: number;
  lifecycleCount: number;
  policyCount: number;
  releaseCount: number;
};
