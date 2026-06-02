/**
 * V3.7-H1 Production Hardening — operational readiness manifest
 */

import { BUILD_FREEZE_MANIFEST, type BuildFreezeManifest } from "../stabilization/build-freeze";
import { buildDeploymentConfidenceReport } from "./deployment-confidence";
import { buildReleaseReadinessReport } from "./release-readiness";

export const OPERATIONAL_READINESS_VERSION = "3.7-h1-ops-1" as const;

export type OperationalReadinessManifest = {
  version: typeof OPERATIONAL_READINESS_VERSION;
  manifestId: string;
  commercialReady: boolean;
  opsReady: boolean;
  supportReady: boolean;
  deploymentReady: boolean;
  runtimeVerified: boolean;
  summary: string;
};

export function buildOperationalReadinessManifest(input?: {
  deploymentId?: string;
  manifest?: BuildFreezeManifest;
}): OperationalReadinessManifest {
  const freeze = input?.manifest ?? BUILD_FREEZE_MANIFEST;
  const deploymentId = input?.deploymentId ?? "default";
  const release = buildReleaseReadinessReport({ deploymentId, manifest: freeze });
  const deployment = buildDeploymentConfidenceReport({ deploymentId, manifest: freeze });
  const manifestId = `OPS-V37H1-${deploymentId.slice(0, 8)}`;

  const runtimeVerified =
    freeze.runtimeVerified && freeze.evidenceVerified && freeze.executiveVerified;
  const commercialReady = release.releasable && deployment.confidenceScore >= 80;
  const deploymentReady = deployment.deploymentReady;
  const opsReady = deploymentReady && runtimeVerified && !release.blocked;
  const supportReady = opsReady && release.riskLevel !== "critical";

  return {
    version: OPERATIONAL_READINESS_VERSION,
    manifestId,
    commercialReady,
    opsReady,
    supportReady,
    deploymentReady,
    runtimeVerified,
    summary: `operational-readiness id=${manifestId} commercial=${commercialReady} ops=${opsReady} support=${supportReady} deployment=${deploymentReady} runtimeVerified=${runtimeVerified}`,
  };
}
