/**
 * V3.7-H6 Production Release Ledger — ledger DTO (static aggregation)
 */

import { buildAuditSnapshot } from "../audit/audit-snapshot";
import { buildReleaseTraceManifest } from "../audit/release-trace-manifest";
import { buildReleaseControlSummary } from "../dashboard";
import type { DashboardStatus } from "../dashboard";
import type { IncidentSeverity } from "../hardening";

export const RELEASE_LEDGER_DTO_VERSION = "3.7-h6-ledger-dto-1" as const;

export type ReleaseLedgerDto = {
  version: typeof RELEASE_LEDGER_DTO_VERSION;
  releaseId: string;
  deploymentId: string;
  buildStatus: DashboardStatus;
  tscStatus: DashboardStatus;
  verificationStatus: DashboardStatus;
  hardeningStatus: DashboardStatus;
  observabilityStatus: DashboardStatus;
  dashboardStatus: DashboardStatus;
  auditStatus: DashboardStatus;
  releasable: boolean;
  releaseReady: boolean;
  confidenceScore: number;
  incidentLevel: IncidentSeverity;
  gateReason: string;
};

function auditStatus(releasable: boolean, freezeIntact: boolean): DashboardStatus {
  if (!releasable) return "fail";
  if (freezeIntact) return "pass";
  return "warn";
}

export function buildReleaseLedgerDto(input?: { deploymentId?: string }): ReleaseLedgerDto {
  const deploymentId = input?.deploymentId ?? "release-ledger";
  const releaseId = `RL-V37H6-${deploymentId.slice(0, 8)}`;
  const audit = buildAuditSnapshot({ deploymentId });
  const trace = buildReleaseTraceManifest({ deploymentId });
  const control = buildReleaseControlSummary({ deploymentId });

  return {
    version: RELEASE_LEDGER_DTO_VERSION,
    releaseId,
    deploymentId,
    buildStatus: audit.buildStatus,
    tscStatus: audit.tscStatus,
    verificationStatus: audit.verificationStatus,
    hardeningStatus: audit.hardeningStatus,
    observabilityStatus: audit.observabilityStatus,
    dashboardStatus: audit.dashboardStatus,
    auditStatus: auditStatus(audit.releasable, audit.freezeStatus === "intact"),
    releasable: audit.releasable,
    releaseReady: trace.releaseReady,
    confidenceScore: audit.releaseConfidence,
    incidentLevel: audit.incidentLevel,
    gateReason: control.gateReason,
  };
}
