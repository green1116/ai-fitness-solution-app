/**
 * V3.7-H3 Production Dashboard — ops panel manifest
 */

import {
  BUILD_FREEZE_MANIFEST,
  BUILD_FREEZE_VERSION,
  type BuildFreezeManifest,
} from "../stabilization/build-freeze";
import { PRODUCTION_HARDENING_VERSION } from "../hardening";
import { PRODUCTION_OBSERVABILITY_VERSION } from "../observability";
import { DASHBOARD_SNAPSHOT_VERSION } from "./dashboard-snapshot";
import { buildReleaseControlSummary } from "./release-control-summary";

export const OPS_PANEL_MANIFEST_VERSION = "3.7-h3-ops-panel-1" as const;

export type OpsPanelManifest = {
  version: typeof OPS_PANEL_MANIFEST_VERSION;
  manifestId: string;
  BUILD_FREEZE_VERSION: typeof BUILD_FREEZE_VERSION;
  HARDENING_VERSION: typeof PRODUCTION_HARDENING_VERSION;
  OBSERVABILITY_VERSION: typeof PRODUCTION_OBSERVABILITY_VERSION;
  DASHBOARD_VERSION: typeof DASHBOARD_SNAPSHOT_VERSION;
  buildPassed: boolean;
  tscPassed: boolean;
  verificationPassed: boolean;
  hardeningPassed: boolean;
  observabilityPassed: boolean;
  releaseReady: boolean;
  summary: string;
};

export function buildOpsPanelManifest(input?: {
  deploymentId?: string;
  manifest?: BuildFreezeManifest;
}): OpsPanelManifest {
  const freeze = input?.manifest ?? BUILD_FREEZE_MANIFEST;
  const deploymentId = input?.deploymentId ?? "ops-panel";
  const release = buildReleaseControlSummary({ deploymentId });
  const manifestId = `PANEL-V37H3-${deploymentId.slice(0, 8)}`;

  const verificationPassed =
    freeze.runtimeVerified && freeze.evidenceVerified && freeze.executiveVerified;
  const hardeningPassed = release.confidenceScore >= 80 && !release.blocked;
  const observabilityPassed = hardeningPassed && verificationPassed;
  const releaseReady =
    release.releaseReady && freeze.buildPassed && freeze.tscPassed && observabilityPassed;

  return {
    version: OPS_PANEL_MANIFEST_VERSION,
    manifestId,
    BUILD_FREEZE_VERSION,
    HARDENING_VERSION: PRODUCTION_HARDENING_VERSION,
    OBSERVABILITY_VERSION: PRODUCTION_OBSERVABILITY_VERSION,
    DASHBOARD_VERSION: DASHBOARD_SNAPSHOT_VERSION,
    buildPassed: freeze.buildPassed,
    tscPassed: freeze.tscPassed,
    verificationPassed,
    hardeningPassed,
    observabilityPassed,
    releaseReady,
    summary: `ops-panel id=${manifestId} build=${freeze.buildPassed} tsc=${freeze.tscPassed} verification=${verificationPassed} hardening=${hardeningPassed} observability=${observabilityPassed} releaseReady=${releaseReady}`,
  };
}
