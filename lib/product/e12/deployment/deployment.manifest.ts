/**
 * E12-P6 — Installation Manifest
 * Aggregates deployment package, environment, artifact, and layer refs
 */

import { buildProductFoundation } from "../manifest/product.manifest";
import { getDeploymentPackage } from "./deployment.package";
import { getEnvironmentProfile } from "./deployment.environment";
import { getReleaseArtifact } from "./deployment.artifact";
import type { InstallationManifest } from "./deployment.types";

function nowIso(): string {
  return new Date().toISOString();
}

export function buildInstallationManifest(input: {
  deploymentPackageId: string;
  environmentProfileId: string;
  artifactId?: string;
}): InstallationManifest {
  const deploymentPackageId = input.deploymentPackageId.trim();
  const environmentProfileId = input.environmentProfileId.trim();

  const pkg = getDeploymentPackage(deploymentPackageId);
  if (!pkg) {
    throw new Error(`deployment package not found: ${deploymentPackageId}`);
  }

  const env = getEnvironmentProfile(environmentProfileId);
  if (!env || env.deploymentPackageId !== deploymentPackageId) {
    throw new Error(`environment profile not found: ${environmentProfileId}`);
  }

  const foundation = buildProductFoundation();
  const artifact = input.artifactId
    ? getReleaseArtifact(input.artifactId.trim())
    : undefined;

  const ready =
    foundation.ready === true &&
    (pkg.status === "VALIDATED" || pkg.status === "RELEASED") &&
    env.status === "ACTIVE" &&
    (!artifact || artifact.status === "SIGNED" || artifact.status === "DISTRIBUTED");

  return {
    deploymentPackageId: pkg.id,
    environmentProfileId: env.id,
    productFoundationReady: foundation.ready,
    tenantProductLayerId: pkg.tenantProductLayerId,
    apiProductLayerId: pkg.apiProductLayerId,
    billingCommercialLayerId: pkg.billingCommercialLayerId,
    editionId: pkg.editionId,
    pricingPlanId: pkg.pricingPlanId,
    artifactId: artifact?.id,
    artifactChecksum: artifact?.checksum,
    ready,
    summary: [
      `installation-manifest ready=${ready}`,
      `package=${pkg.id}`,
      `env=${env.kind}`,
      `edition=${pkg.editionId}`,
      `foundation=${foundation.ready}`,
      artifact ? `artifact=${artifact.id}` : "artifact=none",
    ].join(" "),
    generatedAt: nowIso(),
  };
}

export function assertInstallationManifestReady(
  manifest: InstallationManifest,
): asserts manifest is InstallationManifest & { ready: true } {
  if (!manifest.ready) {
    throw new Error(`installation manifest not ready: ${manifest.summary}`);
  }
}
