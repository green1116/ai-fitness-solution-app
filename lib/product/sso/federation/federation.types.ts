/**
 * Product SSO — readiness / manifest types
 */

import type {
  PRODUCT_SSO_FEDERATION_BASE,
  PRODUCT_SSO_FEDERATION_FREEZE_VERSION,
  PRODUCT_SSO_FEDERATION_ID,
  PRODUCT_SSO_FEDERATION_VERSION,
  SSO_MANAGER_STATUSES,
  SSO_READINESS_VERDICTS,
} from "./federation.constants";

export type SsoReadinessVerdict = (typeof SSO_READINESS_VERDICTS)[number];
export type SsoManagerStatus = (typeof SSO_MANAGER_STATUSES)[number];

export type SsoReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type SsoReadinessResult = {
  verdict: SsoReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: SsoReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type SsoRegistryManifest = {
  foundationId: typeof PRODUCT_SSO_FEDERATION_ID;
  version: typeof PRODUCT_SSO_FEDERATION_VERSION;
  freezeVersion: typeof PRODUCT_SSO_FEDERATION_FREEZE_VERSION;
  base: typeof PRODUCT_SSO_FEDERATION_BASE;
  providerCount: number;
  connectionCount: number;
  assertionCount: number;
  exchangeCount: number;
};
