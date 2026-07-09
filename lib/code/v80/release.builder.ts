/**
 * V80 CODE P4 — Release builder (read-only P3 + APP P4 consumer)
 */
import { buildProductionArchitecture } from "@/lib/app/v80/production.builder";
import {
  buildV80DeploymentBinding,
  isV80DeploymentBindingComplete,
} from "@/lib/scaffold/v80/ops/deployment.model";
import {
  isV80CommercialMatrixComplete,
  V80_COMMERCIAL_ROUTES,
} from "@/lib/scaffold/v80/ops/commercial";
import { buildCodeScaffold } from "./scaffold.builder";
import { isReleaseOpsRegistryComplete, RELEASE_OPS_REGISTRY } from "./release.registry";
import type { ReleaseManifest, ReleaseReport } from "./release.types";
import { V80_CODE_RELEASE_FREEZE_VERSION, V80_CODE_RELEASE_VERSION } from "./release.types";

export function buildReleaseManifest(input: {
  hardenedReady: boolean;
  productionReady: boolean;
}): ReleaseManifest {
  const binding = buildV80DeploymentBinding();
  const opsComplete = isReleaseOpsRegistryComplete();
  const commercialComplete = isV80CommercialMatrixComplete();
  const deploymentComplete = isV80DeploymentBindingComplete(binding);

  const releaseComplete =
    input.hardenedReady &&
    input.productionReady &&
    opsComplete &&
    commercialComplete &&
    deploymentComplete;

  return {
    version: V80_CODE_RELEASE_VERSION,
    hardenedVersion: "v80-code-hardened-1",
    deploymentBindings: binding.routes.length,
    observabilityHooks: RELEASE_OPS_REGISTRY.filter((m) => m.kind === "observability").length,
    governanceHooks: RELEASE_OPS_REGISTRY.filter((m) => m.kind === "governance").length,
    commercialGates: V80_COMMERCIAL_ROUTES.length,
    releaseComplete,
    summary: `code-release complete=${releaseComplete} gates=${V80_COMMERCIAL_ROUTES.length}`,
  };
}

export function buildCodeRelease(input?: { deploymentId?: string }): ReleaseReport {
  const deploymentId = input?.deploymentId ?? "v80-code-release-default";
  const scaffold = buildCodeScaffold({ deploymentId });
  const production = buildProductionArchitecture({ deploymentId });
  const manifest = buildReleaseManifest({
    hardenedReady: scaffold.scaffoldReady,
    productionReady: production.architectureReady,
  });

  const releaseReady =
    scaffold.scaffoldReady && production.architectureReady && manifest.releaseComplete;

  return {
    version: V80_CODE_RELEASE_VERSION,
    freezeVersion: V80_CODE_RELEASE_FREEZE_VERSION,
    reportId: `code-release-${deploymentId}`,
    hardenedReady: scaffold.scaffoldReady,
    productionReady: production.architectureReady,
    manifest,
    modules: RELEASE_OPS_REGISTRY,
    releaseReady,
    readinessScore: releaseReady ? 100 : 0,
    summary: `code-release ready=${releaseReady} hardened=${scaffold.scaffoldReady}`,
  };
}

export function assertCodeReleasePass(
  report: ReleaseReport,
): asserts report is ReleaseReport & { releaseReady: true } {
  if (!report.releaseReady) {
    throw new Error(`V80 CODE release not ready: ${report.summary}`);
  }
}
