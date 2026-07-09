/**
 * V66 P1 — Upstream frozen layer version lock (read-only reference)
 */
import { V64_COMMERCIAL_FREEZE_VERSION } from "@/lib/commercial/v64/freeze.types";
import { V65_PRODUCTION_FREEZE_VERSION } from "@/lib/production/v65/freeze.types";
import { V65_PRODUCTION_SIGNOFF_VERSION } from "@/lib/production/v65/signoff.types";

import type { UpstreamFrozenLayerLock } from "./baseline.types";

export const V66_UPSTREAM_FROZEN_LAYER_LOCK: UpstreamFrozenLayerLock = {
  v65ProductionSignoff: V65_PRODUCTION_SIGNOFF_VERSION,
  v65ProductionFreeze: V65_PRODUCTION_FREEZE_VERSION,
  v64CommercialFreeze: V64_COMMERCIAL_FREEZE_VERSION,
};

export function isUpstreamFrozenLayerLockIntact(): boolean {
  const lock = V66_UPSTREAM_FROZEN_LAYER_LOCK;
  return Object.values(lock).every((v) => typeof v === "string" && v.length > 0);
}
