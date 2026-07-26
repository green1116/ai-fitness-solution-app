/**
 * Product Delivery — readiness / manifest types
 */

import type {
  DELIVERY_MANAGER_STATUSES,
  DELIVERY_READINESS_VERDICTS,
  PRODUCT_DELIVERY_ENGINE_BASE,
  PRODUCT_DELIVERY_ENGINE_FREEZE_VERSION,
  PRODUCT_DELIVERY_ENGINE_ID,
  PRODUCT_DELIVERY_ENGINE_VERSION,
} from "./management.constants";

export type DeliveryReadinessVerdict =
  (typeof DELIVERY_READINESS_VERDICTS)[number];
export type DeliveryManagerStatus = (typeof DELIVERY_MANAGER_STATUSES)[number];

export type DeliveryReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type DeliveryReadinessResult = {
  verdict: DeliveryReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: DeliveryReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type DeliveryRegistryManifest = {
  engineId: typeof PRODUCT_DELIVERY_ENGINE_ID;
  version: typeof PRODUCT_DELIVERY_ENGINE_VERSION;
  freezeVersion: typeof PRODUCT_DELIVERY_ENGINE_FREEZE_VERSION;
  base: typeof PRODUCT_DELIVERY_ENGINE_BASE;
  requestCount: number;
  pipelineCount: number;
  statusCount: number;
  retryPolicyCount: number;
  dispatchCount: number;
  releaseCount: number;
};
