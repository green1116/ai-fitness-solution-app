/**
 * V3.7-H4 Production Audit — release trace manifest
 */

import {
  BUILD_FREEZE_MANIFEST,
  BUILD_FREEZE_VERSION,
  type BuildFreezeManifest,
} from "../stabilization/build-freeze";
import { PRODUCTION_HARDENING_VERSION } from "../hardening";
import { PRODUCTION_OBSERVABILITY_VERSION } from "../observability";
import { DASHBOARD_SNAPSHOT_VERSION, buildProductionDashboardFoundation } from "../dashboard";
import { AUDIT_SNAPSHOT_VERSION } from "./audit-snapshot";

export const RELEASE_TRACE_MANIFEST_VERSION = "3.7-h4-release-trace-1" as const;

export type ReleaseTraceManifest = {
  version: typeof RELEASE_TRACE_MANIFEST_VERSION;
  manifestId: string;
  BUILD_FREEZE_VERSION: typeof BUILD_FREEZE_VERSION;
  HARDENING_VERSION: typeof PRODUCTION_HARDENING_VERSION;
  OBSERVABILITY_VERSION: typeof PRODUCTION_OBSERVABILITY_VERSION;
  DASHBOARD_VERSION: typeof DASHBOARD_SNAPSHOT_VERSION;
  AUDIT_VERSION: typeof AUDIT_SNAPSHOT_VERSION;
  buildPassed: boolean;
  tscPassed: boolean;
  verificationPassed: boolean;
  hardeningPassed: boolean;
  observabilityPassed: boolean;
  dashboardPassed: boolean;
  releaseReady: boolean;
  summary: string;
};

export function buildReleaseTraceManifest(input?: {
  deploymentId?: string;
  manifest?: BuildFreezeManifest;
}): ReleaseTraceManifest {
  const freeze = input?.manifest ?? BUILD_FREEZE_MANIFEST;
  const deploymentId = input?.deploymentId ?? "trace-default";
  const dashboard = buildProductionDashboardFoundation({ deploymentId });
  const manifestId = `TRACE-V37H4-${deploymentId.slice(0, 8)}`;

  const verificationPassed =
    freeze.runtimeVerified && freeze.evidenceVerified && freeze.executiveVerified;
  const hardeningPassed = dashboard.releaseControl.confidenceScore >= 80 && !dashboard.releaseControl.blocked;
  const observabilityPassed = hardeningPassed && verificationPassed;
  const dashboardPassed = dashboard.opsPanel.observabilityPassed && dashboard.opsPanel.hardeningPassed;
  const releaseReady =
    dashboard.opsPanel.releaseReady && freeze.buildPassed && freeze.tscPassed && dashboardPassed;

  return {
    version: RELEASE_TRACE_MANIFEST_VERSION,
    manifestId,
    BUILD_FREEZE_VERSION,
    HARDENING_VERSION: PRODUCTION_HARDENING_VERSION,
    OBSERVABILITY_VERSION: PRODUCTION_OBSERVABILITY_VERSION,
    DASHBOARD_VERSION: DASHBOARD_SNAPSHOT_VERSION,
    AUDIT_VERSION: AUDIT_SNAPSHOT_VERSION,
    buildPassed: freeze.buildPassed,
    tscPassed: freeze.tscPassed,
    verificationPassed,
    hardeningPassed,
    observabilityPassed,
    dashboardPassed,
    releaseReady,
    summary: `release-trace id=${manifestId} build=${freeze.buildPassed} tsc=${freeze.tscPassed} verification=${verificationPassed} hardening=${hardeningPassed} observability=${observabilityPassed} dashboard=${dashboardPassed} releaseReady=${releaseReady}`,
  };
}
