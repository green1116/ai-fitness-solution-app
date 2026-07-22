/**
 * Evolution P5 — Global Deployment Network constants
 * BASE: enterprise-evolution-p4-enterprise-intelligence-dashboard-v1
 */

export const EVOLUTION_GLOBAL_DEPLOYMENT_NETWORK_ID =
  "enterprise-evolution-p5-global-deployment-network-v1" as const;

export const EVOLUTION_GLOBAL_DEPLOYMENT_NETWORK_VERSION =
  "evolution-p5-1" as const;
export const EVOLUTION_GLOBAL_DEPLOYMENT_NETWORK_FREEZE_VERSION =
  "evolution-global-deployment-network-freeze-1" as const;

export const EVOLUTION_GLOBAL_DEPLOYMENT_NETWORK_BASE =
  "enterprise-evolution-p4-enterprise-intelligence-dashboard-v1" as const;

export const EVOLUTION_P5_GLOBAL_FREEZE_VERSION =
  "evolution-p5-global-deployment-network-freeze-1" as const;

export const GLOBAL_REGIONS = [
  "US_EAST",
  "US_WEST",
  "EU_WEST",
  "APAC_EAST",
  "APAC_SOUTH",
] as const;

export const REGION_ROLES = [
  "PRIMARY",
  "SECONDARY",
  "EDGE",
  "DR",
] as const;

export const DEPLOYMENT_INTELLIGENCE_MODES = [
  "OBSERVE",
  "ADVISE",
  "OPTIMIZE",
] as const;

export const REGIONAL_HEALTH_LEVELS = [
  "HEALTHY",
  "DEGRADED",
  "UNHEALTHY",
  "UNKNOWN",
] as const;

export const ROUTING_STRATEGIES = [
  "LATENCY",
  "CAPACITY",
  "AFFINITY",
  "FAILOVER",
] as const;

export const DEPLOYMENT_OPTIMIZATION_ACTIONS = [
  "SCALE_OUT",
  "REBALANCE",
  "FAILOVER",
  "HOLD",
] as const;

export const GLOBAL_READINESS_VERDICTS = [
  "READY",
  "BLOCKED",
  "NOT_READY",
] as const;

export const GLOBAL_MANAGER_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
