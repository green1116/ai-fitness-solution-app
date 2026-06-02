/**
 * V3.7-H8 Ops Portal — status manifest (static aggregation)
 */

import { BUILD_FREEZE_MANIFEST } from "../stabilization/build-freeze";
import { buildReleaseLedgerDto } from "../release-ledger/release-ledger.dto";
import { buildEvidenceExport } from "../release-ledger/evidence-export";
import type { DashboardStatus } from "../dashboard";

export const OPS_PORTAL_MANIFEST_VERSION = "3.7-h8-manifest-1" as const;

export type OpsPortalStatus = DashboardStatus;

export type OpsPortalManifest = {
  version: typeof OPS_PORTAL_MANIFEST_VERSION;
  manifestId: string;
  capturedAt: string;
  buildStatus: OpsPortalStatus;
  tscStatus: OpsPortalStatus;
  verificationStatus: OpsPortalStatus;
  hardeningStatus: OpsPortalStatus;
  observabilityStatus: OpsPortalStatus;
  dashboardStatus: OpsPortalStatus;
  auditStatus: OpsPortalStatus;
  releaseLedgerStatus: OpsPortalStatus;
  evidenceExportStatus: OpsPortalStatus;
  readyForOps: boolean;
  summary: string;
};

function ledgerSurfaceStatus(releasable: boolean, releaseReady: boolean): OpsPortalStatus {
  if (!releasable) return "fail";
  if (releaseReady) return "pass";
  return "warn";
}

function evidenceSurfaceStatus(releasable: boolean, exportSummary: string): OpsPortalStatus {
  if (!releasable || exportSummary.length === 0) return "fail";
  if (exportSummary.includes("releaseReady=true")) return "pass";
  return "warn";
}

function readyForOps(manifest: Omit<OpsPortalManifest, "readyForOps" | "summary">): boolean {
  const statuses = [
    manifest.buildStatus,
    manifest.tscStatus,
    manifest.verificationStatus,
    manifest.hardeningStatus,
    manifest.observabilityStatus,
    manifest.dashboardStatus,
    manifest.auditStatus,
    manifest.releaseLedgerStatus,
    manifest.evidenceExportStatus,
  ];
  return statuses.every((s) => s === "pass");
}

export function buildOpsPortalManifest(input?: { deploymentId?: string }): OpsPortalManifest {
  const deploymentId = input?.deploymentId ?? "ops-portal";
  const manifestId = `OPS-V37H8-${deploymentId.slice(0, 8)}`;
  const dto = buildReleaseLedgerDto({ deploymentId });
  const evidence = buildEvidenceExport({ deploymentId });

  const base = {
    version: OPS_PORTAL_MANIFEST_VERSION,
    manifestId,
    capturedAt: BUILD_FREEZE_MANIFEST.verifiedAt,
    buildStatus: dto.buildStatus,
    tscStatus: dto.tscStatus,
    verificationStatus: dto.verificationStatus,
    hardeningStatus: dto.hardeningStatus,
    observabilityStatus: dto.observabilityStatus,
    dashboardStatus: dto.dashboardStatus,
    auditStatus: dto.auditStatus,
    releaseLedgerStatus: ledgerSurfaceStatus(dto.releasable, dto.releaseReady),
    evidenceExportStatus: evidenceSurfaceStatus(dto.releasable, evidence.summary),
  };

  const opsReady = readyForOps(base);

  return {
    ...base,
    readyForOps: opsReady,
    summary: `ops-portal-manifest id=${manifestId} readyForOps=${opsReady} build=${base.buildStatus} audit=${base.auditStatus} ledger=${base.releaseLedgerStatus} evidence=${base.evidenceExportStatus}`,
  };
}
