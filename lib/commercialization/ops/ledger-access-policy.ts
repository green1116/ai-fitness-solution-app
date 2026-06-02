/**
 * V3.7-H8 Ops Portal — ledger access policy (static, no real auth)
 */

import { buildOpsPortalManifest } from "./ops-portal-manifest";

export const LEDGER_ACCESS_POLICY_VERSION = "3.7-h8-access-1" as const;

export type LedgerAccessPolicy = {
  version: typeof LEDGER_ACCESS_POLICY_VERSION;
  policyId: string;
  canViewReleaseLedger: boolean;
  canViewEvidenceExport: boolean;
  canViewAuditReview: boolean;
  canViewDashboard: boolean;
  canViewObservability: boolean;
  summary: string;
};

export function buildLedgerAccessPolicy(input?: { deploymentId?: string }): LedgerAccessPolicy {
  const deploymentId = input?.deploymentId ?? "ops-access";
  const policyId = `POL-V37H8-${deploymentId.slice(0, 8)}`;
  const manifest = buildOpsPortalManifest({ deploymentId });
  const ready = manifest.readyForOps;

  const canViewReleaseLedger =
    ready && manifest.releaseLedgerStatus === "pass" && manifest.auditStatus === "pass";
  const canViewEvidenceExport =
    ready && manifest.evidenceExportStatus === "pass" && manifest.auditStatus === "pass";
  const canViewAuditReview = ready && manifest.auditStatus === "pass";
  const canViewDashboard = ready && manifest.dashboardStatus === "pass";
  const canViewObservability =
    ready && manifest.observabilityStatus === "pass" && manifest.hardeningStatus === "pass";

  return {
    version: LEDGER_ACCESS_POLICY_VERSION,
    policyId,
    canViewReleaseLedger,
    canViewEvidenceExport,
    canViewAuditReview,
    canViewDashboard,
    canViewObservability,
    summary: `ledger-access-policy id=${policyId} ledger=${canViewReleaseLedger} evidence=${canViewEvidenceExport} audit=${canViewAuditReview} dashboard=${canViewDashboard} observability=${canViewObservability}`,
  };
}
