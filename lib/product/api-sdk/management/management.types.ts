/**
 * Product API SDK — readiness / manifest types
 */

import type {
  PRODUCT_API_SDK_BASE,
  PRODUCT_API_SDK_FREEZE_VERSION,
  PRODUCT_API_SDK_ID,
  PRODUCT_API_SDK_VERSION,
  SDK_MANAGER_STATUSES,
  SDK_READINESS_VERDICTS,
} from "./management.constants";

export type SdkReadinessVerdict = (typeof SDK_READINESS_VERDICTS)[number];
export type SdkManagerStatus = (typeof SDK_MANAGER_STATUSES)[number];

export type SdkReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type SdkReadinessResult = {
  verdict: SdkReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: SdkReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type SdkRegistryManifest = {
  sdkId: typeof PRODUCT_API_SDK_ID;
  version: typeof PRODUCT_API_SDK_VERSION;
  freezeVersion: typeof PRODUCT_API_SDK_FREEZE_VERSION;
  base: typeof PRODUCT_API_SDK_BASE;
  clientCount: number;
  operationCount: number;
  schemaCount: number;
  packageCount: number;
  releaseCount: number;
};
