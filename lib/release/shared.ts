/**
 * V3.7 FINAL Production Release —shared constants & helpers
 */

import { BUILD_FREEZE_MANIFEST } from "../commercialization/stabilization/build-freeze";
import { LANDING_VERSION } from "../commercialization/landing/landing-manifest";
import { ROLLOUT_VERSION as ROLLOUT_READINESS_VERSION } from "../commercialization/deployment-readiness/rollout-manifest";
import { ROLLOUT_VERSION as ROLLOUT_DOC_VERSION } from "../commercialization/rollout/handoff-manifest";
import { GO_LIVE_VERSION } from "../commercialization/go-live/go-live-manifest";
import { LAUNCH_CLOSURE_VERSION } from "../commercialization/launch-closure/launch-closure-manifest";
import { ARCHIVAL_VERSION } from "../commercialization/archival/archival-manifest";
import { RETENTION_VERSION } from "../commercialization/retention/retention-manifest";
import { LIFECYCLE_VERSION } from "../commercialization/lifecycle/lifecycle-manifest";
import { PRESERVATION_CLOSURE_VERSION } from "../commercialization/preservation-closure/preservation-manifest";

export const V37_FINAL_RELEASE_GENERATION = "V3.7-FINAL" as const;
export const V37_COMPATIBILITY_WINDOW = "V3.7-enterprise-stack" as const;
export const V37_RESTORATION_WINDOW = "V3.7-preservation-closure" as const;

export const V37_ENTERPRISE_LAYER_VERSIONS = {
  landing: LANDING_VERSION,
  rolloutReadiness: ROLLOUT_READINESS_VERSION,
  rollout: ROLLOUT_DOC_VERSION,
  goLive: GO_LIVE_VERSION,
  launchClosure: LAUNCH_CLOSURE_VERSION,
  archival: ARCHIVAL_VERSION,
  retention: RETENTION_VERSION,
  lifecycle: LIFECYCLE_VERSION,
  preservationClosure: PRESERVATION_CLOSURE_VERSION,
} as const;

export function computeBaselineHash(parts: readonly string[]): string {
  let hash = 0;
  const s = parts.join("|");
  for (let i = 0; i < s.length; i++) {
    hash = ((hash << 5) - hash + s.charCodeAt(i)) | 0;
  }
  return `BL-${Math.abs(hash).toString(16).padStart(8, "0")}`;
}

export function isBuildFreezeIntact(): boolean {
  const m = BUILD_FREEZE_MANIFEST;
  return (
    m.buildPassed &&
    m.tscPassed &&
    m.runtimeVerified &&
    m.evidenceVerified &&
    m.executiveVerified
  );
}

export function baselineHashFromLayers(): string {
  return computeBaselineHash([
    BUILD_FREEZE_MANIFEST.version,
    ...Object.values(V37_ENTERPRISE_LAYER_VERSIONS),
    V37_FINAL_RELEASE_GENERATION,
  ]);
}
