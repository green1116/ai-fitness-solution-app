/**
 * V3.7-H1 Production Hardening — runtime health snapshot
 */

import {
  BUILD_FREEZE_MANIFEST,
  type BuildFreezeManifest,
} from "../stabilization/build-freeze";

export const RUNTIME_HEALTH_VERSION = "3.7-h1-health-1" as const;

export type HealthStatus = "healthy" | "degraded" | "failed";
export type VerificationHealth = "verified" | "partial" | "unverified";
export type StabilityHealth = "stable" | "watch" | "unstable";
export type FreezeIntegrity = "intact" | "drift" | "missing";

export type RuntimeHealthSnapshot = {
  version: typeof RUNTIME_HEALTH_VERSION;
  snapshotId: string;
  capturedAt: string;
  buildStatus: HealthStatus;
  verificationStatus: VerificationHealth;
  runtimeStability: StabilityHealth;
  freezeIntegrity: FreezeIntegrity;
  orchestrationHealth: HealthStatus;
  executiveRuntimeHealth: HealthStatus;
  summary: string;
};

function freezeIntegrity(manifest: BuildFreezeManifest): FreezeIntegrity {
  const flags = [
    manifest.buildPassed,
    manifest.tscPassed,
    manifest.runtimeVerified,
    manifest.evidenceVerified,
    manifest.executiveVerified,
  ];
  if (flags.every(Boolean)) return "intact";
  if (flags.some(Boolean)) return "drift";
  return "missing";
}

function buildStatus(manifest: BuildFreezeManifest): HealthStatus {
  if (manifest.buildPassed && manifest.tscPassed) return "healthy";
  if (manifest.buildPassed || manifest.tscPassed) return "degraded";
  return "failed";
}

function verificationStatus(manifest: BuildFreezeManifest): VerificationHealth {
  const verified = [
    manifest.runtimeVerified,
    manifest.evidenceVerified,
    manifest.executiveVerified,
  ].filter(Boolean).length;
  if (verified === 3) return "verified";
  if (verified > 0) return "partial";
  return "unverified";
}

export function buildRuntimeHealthSnapshot(input?: {
  deploymentId?: string;
  manifest?: BuildFreezeManifest;
}): RuntimeHealthSnapshot {
  const manifest = input?.manifest ?? BUILD_FREEZE_MANIFEST;
  const snapshotId = `RH-V37H1-${(input?.deploymentId ?? "default").slice(0, 8)}`;
  const integrity = freezeIntegrity(manifest);
  const build = buildStatus(manifest);
  const verification = verificationStatus(manifest);

  const runtimeStability: StabilityHealth =
    integrity === "intact" && build === "healthy" ? "stable" : integrity === "drift" ? "watch" : "unstable";

  const orchestrationHealth: HealthStatus =
    manifest.runtimeVerified && manifest.buildPassed ? "healthy" : manifest.runtimeVerified ? "degraded" : "failed";

  const executiveRuntimeHealth: HealthStatus =
    manifest.executiveVerified && manifest.evidenceVerified ? "healthy" : manifest.executiveVerified ? "degraded" : "failed";

  return {
    version: RUNTIME_HEALTH_VERSION,
    snapshotId,
    capturedAt: manifest.verifiedAt,
    buildStatus: build,
    verificationStatus: verification,
    runtimeStability,
    freezeIntegrity: integrity,
    orchestrationHealth,
    executiveRuntimeHealth,
    summary: `runtime-health id=${snapshotId} build=${build} verification=${verification} freeze=${integrity} orchestration=${orchestrationHealth} executive=${executiveRuntimeHealth}`,
  };
}
