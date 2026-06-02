/**
 * V3.7-H3 Production Dashboard — unified snapshot
 */

import {
  BUILD_FREEZE_MANIFEST,
  BUILD_FREEZE_VERSION,
  type BuildFreezeManifest,
} from "../stabilization/build-freeze";
import { PRODUCTION_HARDENING_VERSION } from "../hardening";
import {
  PRODUCTION_OBSERVABILITY_VERSION,
  buildProductionObservabilityFoundation,
  type ObservabilityStatus,
} from "../observability";
import type { IncidentSeverity } from "../hardening";

export const DASHBOARD_SNAPSHOT_VERSION = "3.7-h3-dashboard-1" as const;

export type DashboardStatus = ObservabilityStatus;
export type DashboardFreezeStatus = "intact" | "drift" | "missing";

export type DashboardSnapshot = {
  version: typeof DASHBOARD_SNAPSHOT_VERSION;
  snapshotId: string;
  capturedAt: string;
  buildStatus: DashboardStatus;
  tscStatus: DashboardStatus;
  verificationStatus: DashboardStatus;
  freezeStatus: DashboardFreezeStatus;
  hardeningStatus: DashboardStatus;
  observabilityStatus: DashboardStatus;
  releaseConfidence: number;
  incidentLevel: IncidentSeverity;
  releasable: boolean;
  summary: string;
};

function observabilityStatus(releaseReady: boolean, blocked: boolean): DashboardStatus {
  if (blocked) return "fail";
  if (releaseReady) return "pass";
  return "warn";
}

export function buildDashboardSnapshot(input?: {
  deploymentId?: string;
  manifest?: BuildFreezeManifest;
}): DashboardSnapshot {
  const manifest = input?.manifest ?? BUILD_FREEZE_MANIFEST;
  const deploymentId = input?.deploymentId ?? "dash-default";
  const foundation = buildProductionObservabilityFoundation({ deploymentId });
  const snapshotId = `DASH-V37H3-${deploymentId.slice(0, 8)}`;
  const obs = foundation.observability;

  return {
    version: DASHBOARD_SNAPSHOT_VERSION,
    snapshotId,
    capturedAt: manifest.verifiedAt,
    buildStatus: obs.buildStatus,
    tscStatus: obs.tscStatus,
    verificationStatus: obs.verificationStatus,
    freezeStatus: obs.freezeStatus,
    hardeningStatus: obs.hardeningStatus,
    observabilityStatus: observabilityStatus(
      foundation.status.releaseReady,
      foundation.releaseGate.blocked,
    ),
    releaseConfidence: obs.releaseConfidence,
    incidentLevel: obs.incidentLevel,
    releasable: foundation.releaseGate.releasable,
    summary: `dashboard-snapshot id=${snapshotId} build=${obs.buildStatus} tsc=${obs.tscStatus} verification=${obs.verificationStatus} freeze=${obs.freezeStatus} hardening=${obs.hardeningStatus} observability=${observabilityStatus(foundation.status.releaseReady, foundation.releaseGate.blocked)} confidence=${obs.releaseConfidence} releasable=${foundation.releaseGate.releasable} freezeVersion=${BUILD_FREEZE_VERSION} hardeningVersion=${PRODUCTION_HARDENING_VERSION} observabilityVersion=${PRODUCTION_OBSERVABILITY_VERSION}`,
  };
}
