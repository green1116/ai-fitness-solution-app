/**
 * V3.7-H6 Production Release Ledger — evidence export builder (static, no IO)
 */

import { formatBuildFreezeSummary } from "../stabilization/build-freeze";
import { buildAuditSnapshot } from "../audit/audit-snapshot";
import { buildVerificationEvidenceBundle } from "../audit/verification-evidence-bundle";
import { buildProductionHardeningFoundation } from "../hardening";
import { buildProductionObservabilityFoundation } from "../observability";
import { buildProductionDashboardFoundation } from "../dashboard";

export const EVIDENCE_EXPORT_VERSION = "3.7-h6-evidence-export-1" as const;

export type EvidenceExport = {
  version: typeof EVIDENCE_EXPORT_VERSION;
  exportId: string;
  auditEvidence: string;
  buildEvidence: string;
  verificationEvidence: string;
  hardeningEvidence: string;
  observabilityEvidence: string;
  dashboardEvidence: string;
  summary: string;
};

export function buildEvidenceExport(input?: { deploymentId?: string }): EvidenceExport {
  const deploymentId = input?.deploymentId ?? "evidence-export";
  const exportId = `EXP-V37H6-${deploymentId.slice(0, 8)}`;
  const audit = buildAuditSnapshot({ deploymentId });
  const bundle = buildVerificationEvidenceBundle({ deploymentId });
  const hardening = buildProductionHardeningFoundation({ deploymentId });
  const observability = buildProductionObservabilityFoundation({ deploymentId });
  const dashboard = buildProductionDashboardFoundation({ deploymentId });

  return {
    version: EVIDENCE_EXPORT_VERSION,
    exportId,
    auditEvidence: audit.summary,
    buildEvidence: formatBuildFreezeSummary(),
    verificationEvidence: bundle.verifyEvidence,
    hardeningEvidence: hardening.summary,
    observabilityEvidence: observability.summary,
    dashboardEvidence: dashboard.summary,
    summary: `evidence-export id=${exportId} releaseReady=${dashboard.opsPanel.releaseReady} bundle=${bundle.bundleId}`,
  };
}
