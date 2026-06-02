/**
 * V3.7-H5 Production Audit — audit review surface (readonly aggregation)
 */

import { buildAuditReviewDto, type AuditReviewDto } from "./audit-review.dto";

export const AUDIT_REVIEW_SURFACE_VERSION = "3.7-h5-audit-review-1" as const;

export type AuditReviewReleaseTrace = {
  manifestId: string;
  BUILD_FREEZE_VERSION: string;
  HARDENING_VERSION: string;
  OBSERVABILITY_VERSION: string;
  DASHBOARD_VERSION: string;
  AUDIT_VERSION: string;
  buildPassed: boolean;
  tscPassed: boolean;
  verificationPassed: boolean;
  hardeningPassed: boolean;
  observabilityPassed: boolean;
  dashboardPassed: boolean;
  releaseReady: boolean;
};

export type AuditReviewIncidentTrace = {
  incidentId: string;
  incidentLevel: string;
  incidentReason: string;
  detectedAt: string;
  resolutionState: string;
  signalCount: number;
};

export type AuditReviewVerificationLineage = {
  bundleId: string;
  buildEvidence: string;
  tscEvidence: string;
  verifyEvidence: string;
  hardeningEvidence: string;
  observabilityEvidence: string;
  dashboardEvidence: string;
};

export type AuditReviewReadinessSummary = {
  releasable: boolean;
  releaseReady: boolean;
  hardeningReady: boolean;
  dashboardReady: boolean;
  observabilityReady: boolean;
  freezeIntact: boolean;
  blocked: boolean;
};

export type AuditReviewConfidenceSummary = {
  releaseConfidence: number;
  readinessScore: number;
  riskLevel: string;
  incidentLevel: string;
};

export type AuditReviewSurface = {
  version: typeof AUDIT_REVIEW_SURFACE_VERSION;
  surfaceId: string;
  capturedAt: string;
  auditSummary: string;
  releaseTrace: AuditReviewReleaseTrace;
  incidentTrace: AuditReviewIncidentTrace;
  verificationLineage: AuditReviewVerificationLineage;
  readinessSummary: AuditReviewReadinessSummary;
  confidenceSummary: AuditReviewConfidenceSummary;
  dto: AuditReviewDto;
};

export function buildAuditReviewSurface(input?: { deploymentId?: string }): AuditReviewSurface {
  const deploymentId = input?.deploymentId ?? "audit-review";
  const surfaceId = `REV-V37H5-${deploymentId.slice(0, 8)}`;
  const dto = buildAuditReviewDto({ deploymentId });
  const { auditSnapshot, releaseTraceManifest, incidentTrace, verificationEvidenceBundle } = dto;
  const trace = releaseTraceManifest;

  return {
    version: AUDIT_REVIEW_SURFACE_VERSION,
    surfaceId,
    capturedAt: auditSnapshot.capturedAt,
    auditSummary: auditSnapshot.summary,
    releaseTrace: {
      manifestId: trace.manifestId,
      BUILD_FREEZE_VERSION: trace.BUILD_FREEZE_VERSION,
      HARDENING_VERSION: trace.HARDENING_VERSION,
      OBSERVABILITY_VERSION: trace.OBSERVABILITY_VERSION,
      DASHBOARD_VERSION: trace.DASHBOARD_VERSION,
      AUDIT_VERSION: trace.AUDIT_VERSION,
      buildPassed: trace.buildPassed,
      tscPassed: trace.tscPassed,
      verificationPassed: trace.verificationPassed,
      hardeningPassed: trace.hardeningPassed,
      observabilityPassed: trace.observabilityPassed,
      dashboardPassed: trace.dashboardPassed,
      releaseReady: trace.releaseReady,
    },
    incidentTrace: {
      incidentId: incidentTrace.incidentId,
      incidentLevel: incidentTrace.incidentLevel,
      incidentReason: incidentTrace.incidentReason,
      detectedAt: incidentTrace.detectedAt,
      resolutionState: incidentTrace.resolutionState,
      signalCount: incidentTrace.relatedSignals.length,
    },
    verificationLineage: {
      bundleId: verificationEvidenceBundle.bundleId,
      buildEvidence: verificationEvidenceBundle.buildEvidence,
      tscEvidence: verificationEvidenceBundle.tscEvidence,
      verifyEvidence: verificationEvidenceBundle.verifyEvidence,
      hardeningEvidence: verificationEvidenceBundle.hardeningEvidence,
      observabilityEvidence: verificationEvidenceBundle.observabilityEvidence,
      dashboardEvidence: verificationEvidenceBundle.dashboardEvidence,
    },
    readinessSummary: {
      releasable: auditSnapshot.releasable,
      releaseReady: trace.releaseReady,
      hardeningReady: dto.hardeningSnapshot.releasable && !dto.hardeningSnapshot.blocked,
      dashboardReady: trace.dashboardPassed,
      observabilityReady: trace.observabilityPassed,
      freezeIntact: auditSnapshot.freezeStatus === "intact",
      blocked: dto.hardeningSnapshot.blocked,
    },
    confidenceSummary: {
      releaseConfidence: auditSnapshot.releaseConfidence,
      readinessScore: dto.hardeningSnapshot.readinessScore,
      riskLevel: dto.hardeningSnapshot.riskLevel,
      incidentLevel: auditSnapshot.incidentLevel,
    },
    dto,
  };
}
