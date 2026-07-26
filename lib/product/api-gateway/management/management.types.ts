/**
 * Product API Gateway — readiness / manifest types
 */

import type {
  GATEWAY_MANAGER_STATUSES,
  GATEWAY_READINESS_VERDICTS,
  PRODUCT_API_GATEWAY_BASE,
  PRODUCT_API_GATEWAY_FREEZE_VERSION,
  PRODUCT_API_GATEWAY_ID,
  PRODUCT_API_GATEWAY_VERSION,
} from "./management.constants";

export type GatewayReadinessVerdict =
  (typeof GATEWAY_READINESS_VERDICTS)[number];
export type GatewayManagerStatus = (typeof GATEWAY_MANAGER_STATUSES)[number];

export type GatewayReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type GatewayReadinessResult = {
  verdict: GatewayReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: GatewayReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type GatewayRegistryManifest = {
  gatewayLayerId: typeof PRODUCT_API_GATEWAY_ID;
  version: typeof PRODUCT_API_GATEWAY_VERSION;
  freezeVersion: typeof PRODUCT_API_GATEWAY_FREEZE_VERSION;
  base: typeof PRODUCT_API_GATEWAY_BASE;
  gatewayCount: number;
  routeCount: number;
  policyCount: number;
  validationCount: number;
  releaseCount: number;
};
