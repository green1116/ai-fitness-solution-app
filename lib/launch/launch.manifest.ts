/**
 * Launch P1 — Launch Manifest
 * Aggregates profile, checklist, readiness, artifacts, product/platform baselines
 */

import { buildPlatformV1Manifest } from "../platform/v1/platform.manifest";
import { buildProductFoundation } from "../product/e12/manifest/product.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../product/e12/signoff/governance.freeze.lock";
import { listReleaseChecklists } from "./launch.checklist";
import {
  LAUNCH_PRODUCTION_FOUNDATION_BASE,
  LAUNCH_PRODUCTION_FOUNDATION_FREEZE_VERSION,
  LAUNCH_PRODUCTION_FOUNDATION_ID,
  LAUNCH_PRODUCTION_FOUNDATION_VERSION,
} from "./launch.constants";
import { listProductionArtifacts } from "./launch.artifact";
import { getProductionProfile } from "./launch.profile";
import { evaluateDeploymentReadiness } from "./launch.readiness";
import type { LaunchManifest } from "./launch.types";

function nowIso(): string {
  return new Date().toISOString();
}

export function buildLaunchManifest(input: {
  productionProfileId: string;
}): LaunchManifest {
  const productionProfileId = input.productionProfileId.trim();
  const profile = getProductionProfile(productionProfileId);
  if (!profile) {
    throw new Error(`production profile not found: ${productionProfileId}`);
  }

  const platform = buildPlatformV1Manifest();
  const foundation = buildProductFoundation();
  const checklists = listReleaseChecklists({ productionProfileId });
  const checklistComplete =
    checklists.length >= 1 && checklists.every((c) => c.complete);
  const readiness = evaluateDeploymentReadiness(productionProfileId);
  const artifacts = listProductionArtifacts({ productionProfileId });

  const ready =
    platform.aligned === true &&
    foundation.ready === true &&
    profile.productizationCompleteId === E12_PRODUCTIZATION_COMPLETE_ID &&
    checklistComplete &&
    readiness.verdict === "READY" &&
    artifacts.length >= 1 &&
    (profile.status === "READY" || profile.status === "ACTIVE");

  return {
    launchId: LAUNCH_PRODUCTION_FOUNDATION_ID,
    version: LAUNCH_PRODUCTION_FOUNDATION_VERSION,
    freezeVersion: LAUNCH_PRODUCTION_FOUNDATION_FREEZE_VERSION,
    base: LAUNCH_PRODUCTION_FOUNDATION_BASE,
    productionProfileId: profile.id,
    productId: profile.productId,
    platformAligned: platform.aligned,
    productFoundationReady: foundation.ready,
    productizationCompleteId: profile.productizationCompleteId,
    deploymentPackageId: profile.deploymentPackageId,
    checklistComplete,
    readinessVerdict: readiness.verdict,
    artifactCount: artifacts.length,
    ready,
    summary: [
      `launch-manifest ready=${ready}`,
      `profile=${profile.id}`,
      `platform=${platform.aligned}`,
      `foundation=${foundation.ready}`,
      `checklist=${checklistComplete}`,
      `readiness=${readiness.verdict}`,
      `artifacts=${artifacts.length}`,
    ].join(" "),
    generatedAt: nowIso(),
  };
}

export function assertLaunchManifestReady(
  manifest: LaunchManifest,
): asserts manifest is LaunchManifest & { ready: true } {
  if (!manifest.ready) {
    throw new Error(`launch manifest not ready: ${manifest.summary}`);
  }
}
