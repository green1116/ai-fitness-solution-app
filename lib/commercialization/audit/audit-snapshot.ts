/**
 * V3.7-H4 Production Audit — unified audit snapshot
 */

import {
  BUILD_FREEZE_MANIFEST,
  BUILD_FREEZE_VERSION,
  type BuildFreezeManifest,
} from "../stabilization/build-freeze";
import { PRODUCTION_HARDENING_VERSION } from "../hardening";
import { PRODUCTION_OBSERVABILITY_VERSION } from "../observability";
import { PRODUCTION_DASHBOARD_VERSION, buildProductionDashboardFoundation } from "../dashboard";
import type { DashboardStatus } from "../dashboard";
import type { IncidentSeverity } from "../hardening";

export const AUDIT_SNAPSHOT_VERSION = "3.7-h4-audit-1" as const;

export type AuditStatus = DashboardStatus;
export type AuditFreezeStatus = "intact" | "drift" | "missing";

export type AuditSnapshot = {
  version: typeof AUDIT_SNAPSHOT_VERSION;
  snapshotId: string;
  capturedAt: string;
  buildStatus: AuditStatus;
  tscStatus: AuditStatus;
  verificationStatus: AuditStatus;
  freezeStatus: AuditFreezeStatus;
  hardeningStatus: AuditStatus;
  observabilityStatus: AuditStatus;
  dashboardStatus: AuditStatus;
  releaseConfidence: number;
  incidentLevel: IncidentSeverity;
  releasable: boolean;
  summary: string;
};

function dashboardStatus(releaseReady: boolean, blocked: boolean): AuditStatus {
  if (blocked) return "fail";
  if (releaseReady) return "pass";
  return "warn";
}

export function buildAuditSnapshot(input?: {
  deploymentId?: string;
  manifest?: BuildFreezeManifest;
}): AuditSnapshot {
  const manifest = input?.manifest ?? BUILD_FREEZE_MANIFEST;
  const deploymentId = input?.deploymentId ?? "audit-default";
  const dashboard = buildProductionDashboardFoundation({ deploymentId });
  const snapshotId = `AUD-V37H4-${deploymentId.slice(0, 8)}`;
  const dash = dashboard.snapshot;
  const dashStatus = dashboardStatus(
    dashboard.opsPanel.releaseReady,
    dashboard.releaseControl.blocked,
  );

  return {
    version: AUDIT_SNAPSHOT_VERSION,
    snapshotId,
    capturedAt: manifest.verifiedAt,
    buildStatus: dash.buildStatus,
    tscStatus: dash.tscStatus,
    verificationStatus: dash.verificationStatus,
    freezeStatus: dash.freezeStatus,
    hardeningStatus: dash.hardeningStatus,
    observabilityStatus: dash.observabilityStatus,
    dashboardStatus: dashStatus,
    releaseConfidence: dash.releaseConfidence,
    incidentLevel: dash.incidentLevel,
    releasable: dash.releasable,
    summary: `audit-snapshot id=${snapshotId} build=${dash.buildStatus} tsc=${dash.tscStatus} verification=${dash.verificationStatus} freeze=${dash.freezeStatus} hardening=${dash.hardeningStatus} observability=${dash.observabilityStatus} dashboard=${dashStatus} confidence=${dash.releaseConfidence} releasable=${dash.releasable} freezeVersion=${BUILD_FREEZE_VERSION} hardeningVersion=${PRODUCTION_HARDENING_VERSION} observabilityVersion=${PRODUCTION_OBSERVABILITY_VERSION} dashboardVersion=${PRODUCTION_DASHBOARD_VERSION}`,
  };
}
