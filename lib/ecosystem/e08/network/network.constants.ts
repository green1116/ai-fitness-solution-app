/**
 * E08-P2 — Multi Organization Network constants
 * BASE: enterprise-e08-p1-enterprise-ecosystem-foundation-v1
 */

export const E08_NETWORK_RUNTIME_ID =
  "enterprise-e08-multi-organization-network-v1" as const;

export const E08_NETWORK_VERSION = "e08-network-1" as const;
export const E08_NETWORK_FREEZE_VERSION =
  "e08-network-freeze-1" as const;

export const E08_NETWORK_BASE =
  "enterprise-e08-p1-enterprise-ecosystem-foundation-v1" as const;

export const NETWORK_KINDS = [
  "supply-chain",
  "go-to-market",
  "compliance",
] as const;

/** Instance lifecycle: READY -> GRAPHED -> RUNNING -> RESULT */
export const NETWORK_INSTANCE_PHASES = [
  "READY",
  "GRAPHED",
  "RUNNING",
  "RESULT",
] as const;

export const NETWORK_INSTANCE_TRANSITIONS: ReadonlyArray<
  readonly [string, string]
> = [
  ["READY", "GRAPHED"],
  ["GRAPHED", "RUNNING"],
  ["RUNNING", "RESULT"],
] as const;

export const NETWORK_TRACE_EVENT_KINDS = [
  "ready",
  "graph",
  "node",
  "partner",
  "result",
  "error",
] as const;
