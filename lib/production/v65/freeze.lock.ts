/**
 * V65 P7 — Locked production layer version constants (read-only)
 */
import { V64_COMMERCIAL_FREEZE_VERSION } from "@/lib/commercial/v64/freeze.types";

import { V65_PRODUCTION_AUDIT_VERSION } from "./audit.types";
import type { ProductionLayerVersionLock } from "./freeze.types";
import { V65_PRODUCTION_FREEZE_VERSION } from "./freeze.types";
import { V65_RELEASE_READY_VERSION } from "./release.types";
import { V65_RUNTIME_RISK_LAYER_VERSION } from "./runtime.types";

export const V65_PRODUCTION_LAYER_VERSION_LOCK: ProductionLayerVersionLock = {
  audit: V65_PRODUCTION_AUDIT_VERSION,
  runtimeRisk: V65_RUNTIME_RISK_LAYER_VERSION,
  releaseReady: V65_RELEASE_READY_VERSION,
  freeze: V65_PRODUCTION_FREEZE_VERSION,
  commercialFreeze: V64_COMMERCIAL_FREEZE_VERSION,
};

export const EXPECTED_PRODUCTION_LAYER_VERSIONS: ProductionLayerVersionLock =
  V65_PRODUCTION_LAYER_VERSION_LOCK;

export function isProductionLayerVersionLockIntact(): boolean {
  const lock = V65_PRODUCTION_LAYER_VERSION_LOCK;
  return Object.values(lock).every((value) => typeof value === "string" && value.length > 0);
}

export function productionVersionLockMatchesExpected(): boolean {
  const lock = V65_PRODUCTION_LAYER_VERSION_LOCK;
  const expected = EXPECTED_PRODUCTION_LAYER_VERSIONS;
  return (
    lock.audit === expected.audit &&
    lock.runtimeRisk === expected.runtimeRisk &&
    lock.releaseReady === expected.releaseReady &&
    lock.freeze === expected.freeze &&
    lock.commercialFreeze === expected.commercialFreeze
  );
}
