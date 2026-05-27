/**
 * V3.7-H1 Production Hardening — deployment confidence layer
 */

import { BUILD_FREEZE_MANIFEST, type BuildFreezeManifest } from "../stabilization/build-freeze";
import { buildRuntimeHealthSnapshot } from "./runtime-health";

export const DEPLOYMENT_CONFIDENCE_VERSION = "3.7-h1-deploy-1" as const;

export type DeploymentConfidenceReport = {
  version: typeof DEPLOYMENT_CONFIDENCE_VERSION;
  reportId: string;
  deploymentReady: boolean;
  runtimeReady: boolean;
  verificationReady: boolean;
  freezeReady: boolean;
  confidenceScore: number;
  summary: string;
};

export function buildDeploymentConfidenceReport(input?: {
  deploymentId?: string;
  manifest?: BuildFreezeManifest;
}): DeploymentConfidenceReport {
  const manifest = input?.manifest ?? BUILD_FREEZE_MANIFEST;
  const health = buildRuntimeHealthSnapshot({
    deploymentId: input?.deploymentId,
    manifest,
  });
  const reportId = `DEP-V37H1-${(input?.deploymentId ?? "default").slice(0, 8)}`;

  const freezeReady = health.freezeIntegrity === "intact";
  const verificationReady = health.verificationStatus === "verified";
  const runtimeReady =
    manifest.runtimeVerified &&
    health.runtimeStability !== "unstable" &&
    health.orchestrationHealth !== "failed";
  const deploymentReady =
    manifest.buildPassed &&
    manifest.tscPassed &&
    freezeReady &&
    runtimeReady &&
    verificationReady;

  const signals = [deploymentReady, runtimeReady, verificationReady, freezeReady, manifest.executiveVerified];
  const confidenceScore = Math.round((signals.filter(Boolean).length / signals.length) * 100);

  return {
    version: DEPLOYMENT_CONFIDENCE_VERSION,
    reportId,
    deploymentReady,
    runtimeReady,
    verificationReady,
    freezeReady,
    confidenceScore,
    summary: `deployment-confidence id=${reportId} ready=${deploymentReady} score=${confidenceScore} runtime=${runtimeReady} verification=${verificationReady} freeze=${freezeReady}`,
  };
}
