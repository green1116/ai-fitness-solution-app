/**
 * Product BI — readiness / manifest types
 */

import type {
  BI_MANAGER_STATUSES,
  BI_READINESS_VERDICTS,
  PRODUCT_BI_INTEGRATION_BASE,
  PRODUCT_BI_INTEGRATION_FREEZE_VERSION,
  PRODUCT_BI_INTEGRATION_ID,
  PRODUCT_BI_INTEGRATION_VERSION,
} from "./integration.constants";

export type BiReadinessVerdict = (typeof BI_READINESS_VERDICTS)[number];
export type BiManagerStatus = (typeof BI_MANAGER_STATUSES)[number];

export type BiReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type BiReadinessResult = {
  verdict: BiReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: BiReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type BiRegistryManifest = {
  integrationId: typeof PRODUCT_BI_INTEGRATION_ID;
  version: typeof PRODUCT_BI_INTEGRATION_VERSION;
  freezeVersion: typeof PRODUCT_BI_INTEGRATION_FREEZE_VERSION;
  base: typeof PRODUCT_BI_INTEGRATION_BASE;
  connectorCount: number;
  catalogCount: number;
  syncCount: number;
  queryCount: number;
};
