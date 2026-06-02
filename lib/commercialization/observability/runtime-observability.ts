/**
 * V3.7-H2 Production Observability — unified runtime snapshot
 */

import {
  BUILD_FREEZE_MANIFEST,
  BUILD_FREEZE_VERSION,
  type BuildFreezeManifest,
} from "../stabilization/build-freeze";
import {
  PRODUCTION_HARDENING_VERSION,
  buildProductionHardeningFoundation,
  type IncidentSeverity,
} from "../hardening";

export const RUNTIME_OBSERVABILITY_VERSION = "3.7-h2-observability-1" as const;

export type ObservabilityStatus = "pass" | "warn" | "fail";
export type FreezeObservabilityStatus = "intact" | "drift" | "missing";

export type RuntimeObservabilitySnapshot = {
  version: typeof RUNTIME_OBSERVABILITY_VERSION;
  snapshotId: string;
  capturedAt: string;
  buildStatus: ObservabilityStatus;
  tscStatus: ObservabilityStatus;
  verificationStatus: ObservabilityStatus;
  freezeStatus: FreezeObservabilityStatus;
  readinessStatus: ObservabilityStatus;
  hardeningStatus: ObservabilityStatus;
  releaseConfidence: number;
  incidentLevel: IncidentSeverity;
  summary: string;
};

function statusFromFlag(passed: boolean): ObservabilityStatus {
  return passed ? "pass" : "fail";
}

function readinessStatus(releasable: boolean, blocked: boolean): ObservabilityStatus {
  if (blocked) return "fail";
  if (releasable) return "pass";
  return "warn";
}

function hardeningStatus(opsReady: boolean, deploymentReady: boolean): ObservabilityStatus {
  if (opsReady && deploymentReady) return "pass";
  if (deploymentReady) return "warn";
  return "fail";
}

function incidentLevel(
  blocked: boolean,
  riskLevel: string,
  warningCount: number,
): IncidentSeverity {
  if (blocked) return "fatal";
  if (riskLevel === "critical" || riskLevel === "high") return "degraded";
  if (warningCount > 0) return "warning";
  return "informational";
}

export function buildRuntimeObservabilitySnapshot(input?: {
  deploymentId?: string;
  manifest?: BuildFreezeManifest;
}): RuntimeObservabilitySnapshot {
  const manifest = input?.manifest ?? BUILD_FREEZE_MANIFEST;
  const deploymentId = input?.deploymentId ?? "obs-default";
  const foundation = buildProductionHardeningFoundation({ deploymentId });
  const snapshotId = `OBS-V37H2-${deploymentId.slice(0, 8)}`;

  const buildStatus = statusFromFlag(manifest.buildPassed);
  const tscStatus = statusFromFlag(manifest.tscPassed);
  const verificationStatus = statusFromFlag(
    manifest.runtimeVerified && manifest.evidenceVerified && manifest.executiveVerified,
  );
  const freezeStatus = foundation.health.freezeIntegrity;
  const readiness = readinessStatus(foundation.release.releasable, foundation.release.blocked);
  const hardening = hardeningStatus(
    foundation.operational.opsReady,
    foundation.deployment.deploymentReady,
  );
  const releaseConfidence = foundation.deployment.confidenceScore;
  const level = incidentLevel(
    foundation.release.blocked,
    foundation.release.riskLevel,
    foundation.release.warnings.length,
  );

  return {
    version: RUNTIME_OBSERVABILITY_VERSION,
    snapshotId,
    capturedAt: manifest.verifiedAt,
    buildStatus,
    tscStatus,
    verificationStatus,
    freezeStatus,
    readinessStatus: readiness,
    hardeningStatus: hardening,
    releaseConfidence,
    incidentLevel: level,
    summary: `runtime-observability id=${snapshotId} build=${buildStatus} tsc=${tscStatus} verification=${verificationStatus} freeze=${freezeStatus} readiness=${readiness} hardening=${hardening} confidence=${releaseConfidence} incident=${level} freezeVersion=${BUILD_FREEZE_VERSION} hardeningVersion=${PRODUCTION_HARDENING_VERSION}`,
  };
}
