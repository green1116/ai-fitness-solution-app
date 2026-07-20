/**
 * E09-P5 — Autonomous Network Economy constants
 * BASE: enterprise-e09-p4-federation-freeze-v1
 */

export const E09_ECONOMY_ID =
  "enterprise-e09-autonomous-network-economy-v1" as const;

export const E09_ECONOMY_VERSION = "e09-economy-1" as const;
export const E09_ECONOMY_FREEZE_VERSION =
  "e09-economy-freeze-1" as const;

export const E09_ECONOMY_BASE =
  "enterprise-e09-p4-federation-freeze-v1" as const;

export const ECONOMIC_NODE_TYPES = [
  "PRODUCER",
  "CONSUMER",
  "EXCHANGE",
  "ESCROW",
  "ROUTER",
] as const;

export const ECONOMIC_NODE_STATUSES = [
  "ACTIVE",
  "SUSPENDED",
  "CONNECTED",
] as const;

export const VALUE_FLOW_KINDS = [
  "TRANSFER",
  "EXCHANGE",
  "SETTLEMENT",
  "CREDIT",
] as const;

export const VALUE_FLOW_STATUSES = [
  "OPEN",
  "LINKED",
  "SETTLED",
  "FAILED",
] as const;

export const ECONOMY_RUNTIME_STATUSES = [
  "IDLE",
  "READY",
  "RUNNING",
  "STOPPED",
] as const;
