/**
 * V3.7-H5 Production Audit — audit review DTO (static aggregation)
 */

import { buildAuditSnapshot, type AuditSnapshot } from "./audit-snapshot";
import { buildReleaseTraceManifest, type ReleaseTraceManifest } from "./release-trace-manifest";
import { buildIncidentTrace, type IncidentTraceRecord } from "./incident-trace";
import {
  buildVerificationEvidenceBundle,
  type VerificationEvidenceBundle,
} from "./verification-evidence-bundle";
import { buildDashboardSnapshot, type DashboardSnapshot } from "../dashboard";
import {
  buildRuntimeObservabilitySnapshot,
  type RuntimeObservabilitySnapshot,
} from "../observability";
import { buildReleaseReadinessReport, type ReleaseReadinessReport } from "../hardening";

export const AUDIT_REVIEW_DTO_VERSION = "3.7-h5-audit-review-dto-1" as const;

export type AuditReviewDto = {
  version: typeof AUDIT_REVIEW_DTO_VERSION;
  dtoId: string;
  auditSnapshot: AuditSnapshot;
  releaseTraceManifest: ReleaseTraceManifest;
  incidentTrace: IncidentTraceRecord;
  verificationEvidenceBundle: VerificationEvidenceBundle;
  dashboardSnapshot: DashboardSnapshot;
  observabilitySnapshot: RuntimeObservabilitySnapshot;
  hardeningSnapshot: ReleaseReadinessReport;
};

export function buildAuditReviewDto(input?: { deploymentId?: string }): AuditReviewDto {
  const deploymentId = input?.deploymentId ?? "audit-review";
  const dtoId = `DTO-V37H5-${deploymentId.slice(0, 8)}`;

  return {
    version: AUDIT_REVIEW_DTO_VERSION,
    dtoId,
    auditSnapshot: buildAuditSnapshot({ deploymentId }),
    releaseTraceManifest: buildReleaseTraceManifest({ deploymentId }),
    incidentTrace: buildIncidentTrace({ deploymentId }),
    verificationEvidenceBundle: buildVerificationEvidenceBundle({ deploymentId }),
    dashboardSnapshot: buildDashboardSnapshot({ deploymentId }),
    observabilitySnapshot: buildRuntimeObservabilitySnapshot({ deploymentId }),
    hardeningSnapshot: buildReleaseReadinessReport({ deploymentId }),
  };
}
