/**
 * V3.7-H6 Production Release Ledger — unified ledger builder (readonly aggregation)
 */

import { buildReleaseLedgerDto, type ReleaseLedgerDto } from "./release-ledger.dto";
import { buildReleaseTraceManifest } from "../audit/release-trace-manifest";
import { buildIncidentTrace } from "../audit/incident-trace";
import {
  buildVerificationEvidenceBundle,
  type VerificationEvidenceBundle,
} from "../audit/verification-evidence-bundle";
import { buildReleaseReadinessReport } from "../hardening";

export const RELEASE_LEDGER_VERSION = "3.7-h6-ledger-1" as const;

export type ReleaseLedgerTrace = {
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

export type ReleaseLedgerReadiness = {
  releasable: boolean;
  releaseReady: boolean;
  freezeIntact: boolean;
  hardeningReady: boolean;
  observabilityReady: boolean;
  dashboardReady: boolean;
  blocked: boolean;
};

export type ReleaseLedgerConfidence = {
  confidenceScore: number;
  readinessScore: number;
  riskLevel: string;
};

export type ReleaseLedgerIncident = {
  incidentId: string;
  incidentLevel: string;
  incidentReason: string;
  resolutionState: string;
  gateReason: string;
};

export type ReleaseLedgerVerificationLineage = {
  bundleId: string;
  buildEvidence: string;
  tscEvidence: string;
  verifyEvidence: string;
  hardeningEvidence: string;
  observabilityEvidence: string;
  dashboardEvidence: string;
};

export type ReleaseLedger = {
  version: typeof RELEASE_LEDGER_VERSION;
  ledgerId: string;
  capturedAt: string;
  ledgerSummary: string;
  releaseTrace: ReleaseLedgerTrace;
  readiness: ReleaseLedgerReadiness;
  confidence: ReleaseLedgerConfidence;
  incident: ReleaseLedgerIncident;
  verificationLineage: ReleaseLedgerVerificationLineage;
  evidenceBundle: VerificationEvidenceBundle;
  dto: ReleaseLedgerDto;
};

export function buildReleaseLedger(input?: { deploymentId?: string }): ReleaseLedger {
  const deploymentId = input?.deploymentId ?? "release-ledger";
  const ledgerId = `LED-V37H6-${deploymentId.slice(0, 8)}`;
  const dto = buildReleaseLedgerDto({ deploymentId });
  const trace = buildReleaseTraceManifest({ deploymentId });
  const incident = buildIncidentTrace({ deploymentId });
  const evidence = buildVerificationEvidenceBundle({ deploymentId });
  const hardening = buildReleaseReadinessReport({ deploymentId });

  return {
    version: RELEASE_LEDGER_VERSION,
    ledgerId,
    capturedAt: incident.detectedAt,
    ledgerSummary: `release-ledger id=${ledgerId} release=${dto.releaseId} releasable=${dto.releasable} releaseReady=${dto.releaseReady} confidence=${dto.confidenceScore} incident=${dto.incidentLevel}`,
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
    readiness: {
      releasable: dto.releasable,
      releaseReady: dto.releaseReady,
      freezeIntact: dto.buildStatus === "pass" && dto.tscStatus === "pass",
      hardeningReady: dto.hardeningStatus === "pass" && !hardening.blocked,
      observabilityReady: dto.observabilityStatus === "pass",
      dashboardReady: dto.dashboardStatus === "pass",
      blocked: hardening.blocked,
    },
    confidence: {
      confidenceScore: dto.confidenceScore,
      readinessScore: hardening.readinessScore,
      riskLevel: hardening.riskLevel,
    },
    incident: {
      incidentId: incident.incidentId,
      incidentLevel: incident.incidentLevel,
      incidentReason: incident.incidentReason,
      resolutionState: incident.resolutionState,
      gateReason: dto.gateReason,
    },
    verificationLineage: {
      bundleId: evidence.bundleId,
      buildEvidence: evidence.buildEvidence,
      tscEvidence: evidence.tscEvidence,
      verifyEvidence: evidence.verifyEvidence,
      hardeningEvidence: evidence.hardeningEvidence,
      observabilityEvidence: evidence.observabilityEvidence,
      dashboardEvidence: evidence.dashboardEvidence,
    },
    evidenceBundle: evidence,
    dto,
  };
}
