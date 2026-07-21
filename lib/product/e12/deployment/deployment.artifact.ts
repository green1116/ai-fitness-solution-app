/**
 * E12-P6 — Release Artifact
 */

import { getDeploymentPackage, setDeploymentPackageStatus } from "./deployment.package";
import { getEnvironmentProfile } from "./deployment.environment";
import {
  assertDeploymentValidationPass,
  validateDeploymentPackage,
} from "./deployment.validator";
import type {
  BuildReleaseArtifactInput,
  ReleaseArtifact,
  ReleaseArtifactStatus,
} from "./deployment.types";

const artifacts = new Map<string, ReleaseArtifact>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function computeChecksum(input: string): string {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (Math.imul(31, h) + input.charCodeAt(i)) | 0;
  }
  return `sha256_${Math.abs(h).toString(36)}`;
}

function cloneArtifact(artifact: ReleaseArtifact): ReleaseArtifact {
  return { ...artifact, metadata: { ...artifact.metadata } };
}

export function buildReleaseArtifact(
  input: BuildReleaseArtifactInput,
): ReleaseArtifact {
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

  const validation = validateDeploymentPackage(deploymentPackageId, {
    environmentProfileId,
  });
  assertDeploymentValidationPass(validation);

  const id = input.id?.trim() || createId("artifact");
  if (artifacts.has(id)) {
    throw new Error(`release artifact already exists: ${id}`);
  }

  const payload = `${pkg.id}:${env.id}:${pkg.version}:${env.kind}`;
  const artifact: ReleaseArtifact = {
    id,
    deploymentPackageId,
    environmentProfileId,
    checksum: computeChecksum(payload),
    status: "BUILT",
    artifactUri:
      input.artifactUri?.trim() ||
      `s3://enterprise-deploy/${pkg.id}/${env.kind}/${pkg.version}.tar.gz`,
    metadata: { ...(input.metadata ?? {}) },
    builtAt: nowIso(),
  };
  artifacts.set(id, artifact);
  setDeploymentPackageStatus(deploymentPackageId, "RELEASED");
  return cloneArtifact(artifact);
}

export function signReleaseArtifact(id: string): ReleaseArtifact {
  const artifact = artifacts.get(id.trim());
  if (!artifact) throw new Error(`release artifact not found: ${id}`);
  if (artifact.status !== "BUILT") {
    throw new Error(`sign requires BUILT (current=${artifact.status})`);
  }
  artifact.status = "SIGNED";
  artifacts.set(artifact.id, artifact);
  return cloneArtifact(artifact);
}

export function distributeReleaseArtifact(id: string): ReleaseArtifact {
  const artifact = artifacts.get(id.trim());
  if (!artifact) throw new Error(`release artifact not found: ${id}`);
  if (artifact.status !== "SIGNED") {
    throw new Error(`distribute requires SIGNED (current=${artifact.status})`);
  }
  artifact.status = "DISTRIBUTED";
  artifacts.set(artifact.id, artifact);
  return cloneArtifact(artifact);
}

export function getReleaseArtifact(id: string): ReleaseArtifact | undefined {
  const artifact = artifacts.get(id.trim());
  return artifact ? cloneArtifact(artifact) : undefined;
}

export function listReleaseArtifacts(filter?: {
  deploymentPackageId?: string;
  environmentProfileId?: string;
  status?: ReleaseArtifactStatus;
}): ReleaseArtifact[] {
  let result = [...artifacts.values()];
  if (filter?.deploymentPackageId) {
    const pid = filter.deploymentPackageId.trim();
    result = result.filter((a) => a.deploymentPackageId === pid);
  }
  if (filter?.environmentProfileId) {
    const eid = filter.environmentProfileId.trim();
    result = result.filter((a) => a.environmentProfileId === eid);
  }
  if (filter?.status) result = result.filter((a) => a.status === filter.status);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneArtifact);
}

export function clearReleaseArtifacts(): void {
  artifacts.clear();
}
