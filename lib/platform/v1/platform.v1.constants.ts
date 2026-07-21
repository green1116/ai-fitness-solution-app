/**
 * Enterprise Platform v1 — Alignment constants
 * BASE: enterprise-e11-cloud-runtime-complete-v1
 */

export const PLATFORM_V1_ID = "enterprise-platform-v1" as const;
export const PLATFORM_V1_VERSION = "platform-v1-1" as const;
export const PLATFORM_V1_FREEZE_VERSION = "platform-v1-freeze-1" as const;
export const PLATFORM_V1_SIGNOFF_VERSION = "platform-v1-signoff-1" as const;

export const PLATFORM_V1_BASE =
  "enterprise-e11-cloud-runtime-complete-v1" as const;

/** Frozen enterprise complete tags (downstream BASE references). */
export const E09_ENTERPRISE_COMPLETE_ID =
  "enterprise-e09-global-autonomous-enterprise-network-freeze-v1" as const;

export const E10_ENTERPRISE_COMPLETE_ID =
  "enterprise-e10-autonomous-platform-complete-v1" as const;

export const E11_ENTERPRISE_COMPLETE_ID =
  "enterprise-e11-cloud-runtime-complete-v1" as const;

export const ENTERPRISE_LAYER_CODES = ["E09", "E10", "E11"] as const;

export const CAPABILITY_DOMAINS = [
  "NETWORK",
  "PLATFORM",
  "RUNTIME",
  "GOVERNANCE",
  "OBSERVABILITY",
  "AUTONOMOUS",
  "CONTROL",
] as const;

export const RELEASE_BASELINE_PHASES = [
  "E09-P8",
  "E10-P8",
  "E11-P8",
  "PLATFORM-V1",
] as const;
