/**
 * V3.7-H1 Production Hardening — release readiness report
 */

import { BUILD_FREEZE_MANIFEST, type BuildFreezeManifest } from "../stabilization/build-freeze";
import { buildRuntimeHealthSnapshot } from "./runtime-health";

export const RELEASE_READINESS_VERSION = "3.7-h1-release-1" as const;

export type ReleaseRiskLevel = "low" | "medium" | "high" | "critical";

export type ReleaseReadinessReport = {
  version: typeof RELEASE_READINESS_VERSION;
  reportId: string;
  releasable: boolean;
  blocked: boolean;
  warnings: string[];
  riskLevel: ReleaseRiskLevel;
  readinessScore: number;
  summary: string;
};

function deriveRiskLevel(blocked: boolean, warnings: string[], score: number): ReleaseRiskLevel {
  if (blocked || score < 50) return "critical";
  if (score < 70 || warnings.length >= 3) return "high";
  if (score < 90 || warnings.length > 0) return "medium";
  return "low";
}

export function buildReleaseReadinessReport(input?: {
  deploymentId?: string;
  manifest?: BuildFreezeManifest;
}): ReleaseReadinessReport {
  const manifest = input?.manifest ?? BUILD_FREEZE_MANIFEST;
  const health = buildRuntimeHealthSnapshot({
    deploymentId: input?.deploymentId,
    manifest,
  });
  const reportId = `REL-V37H1-${(input?.deploymentId ?? "default").slice(0, 8)}`;
  const warnings: string[] = [];

  if (health.freezeIntegrity === "drift") {
    warnings.push("Build freeze manifest shows partial verification drift.");
  }
  if (health.verificationStatus === "partial") {
    warnings.push("Runtime verification coverage is partial.");
  }
  if (health.runtimeStability === "watch") {
    warnings.push("Runtime stability is under watch.");
  }
  if (health.orchestrationHealth === "degraded") {
    warnings.push("Orchestration health is degraded.");
  }
  if (health.executiveRuntimeHealth === "degraded") {
    warnings.push("Executive runtime health is degraded.");
  }

  const checks = [
    manifest.buildPassed,
    manifest.tscPassed,
    manifest.runtimeVerified,
    manifest.evidenceVerified,
    manifest.executiveVerified,
    health.buildStatus === "healthy",
    health.freezeIntegrity === "intact",
  ];
  const readinessScore = Math.round((checks.filter(Boolean).length / checks.length) * 100);
  const blocked =
    !manifest.buildPassed ||
    !manifest.tscPassed ||
    health.buildStatus === "failed" ||
    health.freezeIntegrity === "missing";
  const releasable = !blocked && readinessScore >= 85 && warnings.length <= 1;
  const riskLevel = deriveRiskLevel(blocked, warnings, readinessScore);

  return {
    version: RELEASE_READINESS_VERSION,
    reportId,
    releasable,
    blocked,
    warnings,
    riskLevel,
    readinessScore,
    summary: `release-readiness id=${reportId} releasable=${releasable} blocked=${blocked} score=${readinessScore} risk=${riskLevel}`,
  };
}
