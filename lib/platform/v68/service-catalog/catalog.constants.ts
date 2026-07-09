/**
 * V68 P1 — Platform governance upstream lock (read-only, V67 frozen)
 */
import {
  V67_MONITORING_FREEZE_VERSION,
  V67_MONITORING_SIGNOFF_VERSION,
} from "@/lib/monitoring/v67/signoff/signoff.types";

export const V68_PLATFORM_GOVERNANCE_DOMAIN = "platform-governance" as const;

export const V68_PLATFORM_ARTIFACT_ROOT = "lib/platform/v68" as const;

export type UpstreamFrozenPlatformLock = {
  v67MonitoringSignoff: typeof V67_MONITORING_SIGNOFF_VERSION;
  v67MonitoringFreeze: typeof V67_MONITORING_FREEZE_VERSION;
};

export const V68_UPSTREAM_FROZEN_PLATFORM_LOCK: UpstreamFrozenPlatformLock = {
  v67MonitoringSignoff: V67_MONITORING_SIGNOFF_VERSION,
  v67MonitoringFreeze: V67_MONITORING_FREEZE_VERSION,
};

export function isUpstreamFrozenPlatformLockIntact(): boolean {
  const lock = V68_UPSTREAM_FROZEN_PLATFORM_LOCK;
  return Object.values(lock).every((v) => typeof v === "string" && v.length > 0);
}
