/**
 * Product Routing — readiness / manifest types
 */

import type {
  PRODUCT_ROUTING_ENGINE_BASE,
  PRODUCT_ROUTING_ENGINE_FREEZE_VERSION,
  PRODUCT_ROUTING_ENGINE_ID,
  PRODUCT_ROUTING_ENGINE_VERSION,
  ROUTING_MANAGER_STATUSES,
  ROUTING_READINESS_VERDICTS,
} from "./management.constants";

export type RoutingReadinessVerdict =
  (typeof ROUTING_READINESS_VERDICTS)[number];
export type RoutingManagerStatus = (typeof ROUTING_MANAGER_STATUSES)[number];

export type RoutingReadinessCheck = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type RoutingReadinessResult = {
  verdict: RoutingReadinessVerdict;
  passCount: number;
  failCount: number;
  checks: RoutingReadinessCheck[];
  summary: string;
  evaluatedAt: string;
};

export type RoutingRegistryManifest = {
  engineId: typeof PRODUCT_ROUTING_ENGINE_ID;
  version: typeof PRODUCT_ROUTING_ENGINE_VERSION;
  freezeVersion: typeof PRODUCT_ROUTING_ENGINE_FREEZE_VERSION;
  base: typeof PRODUCT_ROUTING_ENGINE_BASE;
  routeCount: number;
  ruleCount: number;
  strategyCount: number;
  fallbackCount: number;
  resolutionCount: number;
  releaseCount: number;
};
