/**
 * Product API Authentication — readiness / manifest types
 */

import type {
  API_AUTH_MANAGER_STATUSES,
  API_AUTH_READINESS_VERDICTS,
  PRODUCT_API_AUTHENTICATION_BASE,
  PRODUCT_API_AUTHENTICATION_FREEZE_VERSION,
  PRODUCT_API_AUTHENTICATION_ID,
  PRODUCT_API_AUTHENTICATION_VERSION,
} from "./management.constants";

export type ApiAuthReadinessVerdict =
  (typeof API_AUTH_READINESS_VERDICTS)[number];
export type ApiAuthManagerStatus = (typeof API_AUTH_MANAGER_STATUSES)[number];

export type ApiAuthReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type ApiAuthReadinessResult = {
  verdict: ApiAuthReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: ApiAuthReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type ApiAuthRegistryManifest = {
  authenticationId: typeof PRODUCT_API_AUTHENTICATION_ID;
  version: typeof PRODUCT_API_AUTHENTICATION_VERSION;
  freezeVersion: typeof PRODUCT_API_AUTHENTICATION_FREEZE_VERSION;
  base: typeof PRODUCT_API_AUTHENTICATION_BASE;
  credentialCount: number;
  keyCount: number;
  tokenValidationCount: number;
  identityCount: number;
  contextCount: number;
  releaseCount: number;
};
