/**
 * Product Routing — Engine constants
 * MODULE: Routing (M06-P6)
 * BASE: enterprise-product-preference-management-v1
 * Isolated namespace: lib/product/routing
 */

export const PRODUCT_ROUTING_ENGINE_ID =
  "enterprise-product-routing-engine-v1" as const;

export const PRODUCT_ROUTING_ENGINE_VERSION =
  "product-routing-1" as const;

export const PRODUCT_ROUTING_ENGINE_FREEZE_VERSION =
  "product-routing-engine-freeze-1" as const;

export const PRODUCT_ROUTING_ENGINE_BASE =
  "enterprise-product-preference-management-v1" as const;

export const PRODUCT_ROUTING_FREEZE_VERSION =
  "product-routing-engine-freeze-1" as const;

export const ROUTING_KINDS = [
  "TRANSACTIONAL",
  "ALERT",
  "MARKETING",
  "SYSTEM",
] as const;

export const ROUTING_STRATEGIES = [
  "PRIMARY_ONLY",
  "FAILOVER",
  "ROUND_ROBIN",
  "PRIORITY_ORDER",
] as const;

export const ROUTING_FALLBACK_MODES = [
  "NONE",
  "NEXT_CHANNEL",
  "SAFE_DEFAULT",
] as const;

export const ROUTING_RESOLUTION_VERDICTS = [
  "ROUTED",
  "FALLBACK",
  "UNROUTEABLE",
] as const;

export const ROUTING_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const ROUTING_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
