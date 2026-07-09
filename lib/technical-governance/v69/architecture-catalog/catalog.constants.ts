/**
 * V69 P1 — Architecture catalog constants (read-only, V68 frozen upstream)
 */
import {
  V68_PLATFORM_FREEZE_VERSION,
  V68_PLATFORM_SIGNOFF_VERSION,
} from "@/lib/platform/v68/signoff/signoff.types";

export const V69_TECHNICAL_GOVERNANCE_DOMAIN = "technical-governance" as const;

export const V69_ARTIFACT_ROOT = "lib/technical-governance/v69" as const;

export type UpstreamFrozenTechnicalGovernanceLock = {
  v68PlatformSignoff: typeof V68_PLATFORM_SIGNOFF_VERSION;
  v68PlatformFreeze: typeof V68_PLATFORM_FREEZE_VERSION;
};

export const V69_UPSTREAM_FROZEN_TECHNICAL_GOVERNANCE_LOCK: UpstreamFrozenTechnicalGovernanceLock =
  {
    v68PlatformSignoff: V68_PLATFORM_SIGNOFF_VERSION,
    v68PlatformFreeze: V68_PLATFORM_FREEZE_VERSION,
  };

export function isUpstreamFrozenTechnicalGovernanceLockIntact(): boolean {
  const lock = V69_UPSTREAM_FROZEN_TECHNICAL_GOVERNANCE_LOCK;
  return Object.values(lock).every((v) => typeof v === "string" && v.length > 0);
}
