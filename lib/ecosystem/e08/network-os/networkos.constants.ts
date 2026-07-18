/**
 * E08-P7 — Enterprise Network OS constants
 * BASE: enterprise-e08-p6-autonomous-market-agent-v1
 */

export const E08_NETWORK_OS_ID =
  "enterprise-e08-enterprise-network-os-v1" as const;

export const E08_NETWORK_OS_VERSION = "e08-network-os-1" as const;
export const E08_NETWORK_OS_FREEZE_VERSION =
  "e08-network-os-freeze-1" as const;

export const E08_NETWORK_OS_BASE =
  "enterprise-e08-p6-autonomous-market-agent-v1" as const;

export const NETWORK_OS_KINDS = [
  "sector",
  "program",
  "enterprise",
] as const;

/** Instance lifecycle: READY -> CONTROLLED -> RUNNING -> RESULT */
export const NETWORK_OS_INSTANCE_PHASES = [
  "READY",
  "CONTROLLED",
  "RUNNING",
  "RESULT",
] as const;

export const NETWORK_OS_INSTANCE_TRANSITIONS: ReadonlyArray<
  readonly [string, string]
> = [
  ["READY", "CONTROLLED"],
  ["CONTROLLED", "RUNNING"],
  ["RUNNING", "RESULT"],
] as const;

export const NETWORK_OS_TRACE_EVENT_KINDS = [
  "ready",
  "control",
  "slot",
  "market",
  "result",
  "error",
] as const;
