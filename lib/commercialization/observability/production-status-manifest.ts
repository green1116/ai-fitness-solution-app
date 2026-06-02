/**
 * V3.7-H2 Production Observability — production status manifest
 */

import {
  BUILD_FREEZE_MANIFEST,
  BUILD_FREEZE_VERSION,
  type BuildFreezeManifest,
} from "../stabilization/build-freeze";
import { PRODUCTION_HARDENING_VERSION } from "../hardening";
import { RUNTIME_OBSERVABILITY_VERSION } from "./runtime-observability";
import { buildReleaseGateView } from "./release-gate-view";

export const PRODUCTION_STATUS_MANIFEST_VERSION = "3.7-h2-status-1" as const;

export type ProductionStatusManifest = {
  version: typeof PRODUCTION_STATUS_MANIFEST_VERSION;
  manifestId: string;
  BUILD_FREEZE_VERSION: typeof BUILD_FREEZE_VERSION;
  HARDENING_VERSION: typeof PRODUCTION_HARDENING_VERSION;
  OBSERVABILITY_VERSION: typeof RUNTIME_OBSERVABILITY_VERSION;
  buildPassed: boolean;
  tscPassed: boolean;
  verificationPassed: boolean;
  hardeningPassed: boolean;
  releaseReady: boolean;
  summary: string;
};

export function buildProductionStatusManifest(input?: {
  deploymentId?: string;
  manifest?: BuildFreezeManifest;
}): ProductionStatusManifest {
  const freeze = input?.manifest ?? BUILD_FREEZE_MANIFEST;
  const deploymentId = input?.deploymentId ?? "status-default";
  const gate = buildReleaseGateView({ deploymentId });
  const manifestId = `STATUS-V37H2-${deploymentId.slice(0, 8)}`;

  const verificationPassed =
    freeze.runtimeVerified && freeze.evidenceVerified && freeze.executiveVerified;
  const hardeningPassed = gate.confidenceScore >= 80 && !gate.blocked;
  const releaseReady = gate.releasable && hardeningPassed && freeze.buildPassed && freeze.tscPassed;

  return {
    version: PRODUCTION_STATUS_MANIFEST_VERSION,
    manifestId,
    BUILD_FREEZE_VERSION,
    HARDENING_VERSION: PRODUCTION_HARDENING_VERSION,
    OBSERVABILITY_VERSION: RUNTIME_OBSERVABILITY_VERSION,
    buildPassed: freeze.buildPassed,
    tscPassed: freeze.tscPassed,
    verificationPassed,
    hardeningPassed,
    releaseReady,
    summary: `production-status id=${manifestId} build=${freeze.buildPassed} tsc=${freeze.tscPassed} verification=${verificationPassed} hardening=${hardeningPassed} releaseReady=${releaseReady}`,
  };
}
