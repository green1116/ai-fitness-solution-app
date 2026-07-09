/**
 * V66 P4 — Release manifest (declarative layer catalog)
 */
import { V66_UPSTREAM_FROZEN_LAYER_LOCK } from "./baseline.lock";
import { V66_DEPLOYMENT_BASELINE_VERSION } from "./baseline.types";
import { V66_DEPLOYMENT_EXECUTION_VERSION } from "./execution.types";
import { V66_DEPLOYMENT_OBSERVABILITY_VERSION } from "./observability.types";
import type { ReleaseLayerEntry, ReleaseManifest } from "./release.types";
import { V66_RELEASE_ORCHESTRATION_VERSION } from "./release.types";

export const V66_RELEASE_LAYER_CATALOG: ReleaseLayerEntry[] = [
  {
    phase: "P1",
    version: V66_DEPLOYMENT_BASELINE_VERSION,
    module: "lib/deployment/v66/baseline.ts",
    verifyScript: "npm run verify:v66-p1-deployment-baseline",
    frozen: false,
  },
  {
    phase: "P2",
    version: V66_DEPLOYMENT_EXECUTION_VERSION,
    module: "lib/deployment/v66/execution.ts",
    verifyScript: "npm run verify:v66-p2-deployment-execution",
    frozen: false,
  },
  {
    phase: "P3",
    version: V66_DEPLOYMENT_OBSERVABILITY_VERSION,
    module: "lib/deployment/v66/observability.ts",
    verifyScript: "npm run verify:v66-p3-deployment-observability",
    frozen: false,
  },
  {
    phase: "P4",
    version: V66_RELEASE_ORCHESTRATION_VERSION,
    module: "lib/deployment/v66/release.ts",
    verifyScript: "npm run verify:v66-p4-release-orchestration",
    frozen: false,
  },
];

export function buildReleaseManifest(input?: { deploymentId?: string }): ReleaseManifest {
  const deploymentId = input?.deploymentId ?? "v66-release-manifest-default";
  const layers = V66_RELEASE_LAYER_CATALOG;
  const manifestComplete = layers.length >= 4 && layers.every((l) => l.version.length > 0);

  return {
    version: V66_RELEASE_ORCHESTRATION_VERSION,
    manifestId: `release-manifest-${deploymentId}`,
    deploymentId,
    upstreamFrozen: { ...V66_UPSTREAM_FROZEN_LAYER_LOCK },
    layers,
    layerCount: layers.length,
    manifestComplete,
    summary: [
      `release-manifest layers=${layers.length}`,
      `complete=${manifestComplete}`,
    ].join(" "),
  };
}
