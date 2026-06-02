/**
 * V3.7-H4 Production Audit Foundation
 */

export {
  AUDIT_SNAPSHOT_VERSION,
  buildAuditSnapshot,
  type AuditSnapshot,
  type AuditStatus,
  type AuditFreezeStatus,
} from "./audit-snapshot";

export {
  RELEASE_TRACE_MANIFEST_VERSION,
  buildReleaseTraceManifest,
  type ReleaseTraceManifest,
} from "./release-trace-manifest";

export {
  INCIDENT_TRACE_VERSION,
  buildIncidentTrace,
  type IncidentTraceRecord,
  type IncidentResolutionState,
} from "./incident-trace";

export {
  VERIFICATION_EVIDENCE_BUNDLE_VERSION,
  buildVerificationEvidenceBundle,
  type VerificationEvidenceBundle,
} from "./verification-evidence-bundle";

export {
  AUDIT_REVIEW_DTO_VERSION,
  buildAuditReviewDto,
  type AuditReviewDto,
} from "./audit-review.dto";

export {
  AUDIT_REVIEW_SURFACE_VERSION,
  buildAuditReviewSurface,
  type AuditReviewSurface,
  type AuditReviewReleaseTrace,
  type AuditReviewIncidentTrace,
  type AuditReviewVerificationLineage,
  type AuditReviewReadinessSummary,
  type AuditReviewConfidenceSummary,
} from "./audit-review-surface";

export const PRODUCTION_AUDIT_VERSION = "3.7-h4-foundation-1" as const;
export const PRODUCTION_AUDIT_REVIEW_VERSION = "3.7-h5-foundation-1" as const;

import { buildAuditSnapshot, type AuditSnapshot } from "./audit-snapshot";
import { buildReleaseTraceManifest, type ReleaseTraceManifest } from "./release-trace-manifest";
import { buildIncidentTrace, type IncidentTraceRecord } from "./incident-trace";
import {
  buildVerificationEvidenceBundle,
  type VerificationEvidenceBundle,
} from "./verification-evidence-bundle";

export type ProductionAuditFoundation = {
  version: typeof PRODUCTION_AUDIT_VERSION;
  foundationId: string;
  snapshot: AuditSnapshot;
  releaseTrace: ReleaseTraceManifest;
  incident: IncidentTraceRecord;
  evidence: VerificationEvidenceBundle;
  summary: string;
};

export function buildProductionAuditFoundation(input?: {
  deploymentId?: string;
}): ProductionAuditFoundation {
  const deploymentId = input?.deploymentId ?? "audit-foundation";
  const foundationId = `PA-V37H4-${deploymentId.slice(0, 8)}`;
  const snapshot = buildAuditSnapshot({ deploymentId });
  const releaseTrace = buildReleaseTraceManifest({ deploymentId });
  const incident = buildIncidentTrace({ deploymentId });
  const evidence = buildVerificationEvidenceBundle({ deploymentId });

  return {
    version: PRODUCTION_AUDIT_VERSION,
    foundationId,
    snapshot,
    releaseTrace,
    incident,
    evidence,
    summary: `production-audit id=${foundationId} releasable=${snapshot.releasable} releaseReady=${releaseTrace.releaseReady} incident=${incident.incidentLevel} resolution=${incident.resolutionState}`,
  };
}
