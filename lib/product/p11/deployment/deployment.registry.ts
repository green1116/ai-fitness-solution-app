/**
 * Product P11 — Deployment registry
 */

import { DEPLOYMENT_STATUSES } from "../release/release.constants";
import { getEnvironment } from "../environment/environment.registry";
import { getRelease } from "../release/release.registry";
import { getVersion } from "../version/version.registry";
import type {
  CompleteDeploymentInput,
  ReleaseDeployment,
  StartDeploymentInput,
} from "./deployment.types";

const deployments = new Map<string, ReleaseDeployment>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneDeployment(deployment: ReleaseDeployment): ReleaseDeployment {
  return { ...deployment, metadata: { ...deployment.metadata } };
}

export function startDeployment(
  input: StartDeploymentInput,
): ReleaseDeployment {
  const releaseId = input.releaseId.trim();
  const environmentId = input.environmentId.trim();
  const versionId = input.versionId.trim();
  if (!releaseId) throw new Error("deployment.releaseId is required");
  if (!environmentId) throw new Error("deployment.environmentId is required");
  if (!versionId) throw new Error("deployment.versionId is required");
  if (!getRelease(releaseId)) {
    throw new Error(`release not found: ${releaseId}`);
  }
  if (!getEnvironment(environmentId)) {
    throw new Error(`environment not found: ${environmentId}`);
  }
  if (!getVersion(versionId)) {
    throw new Error(`version not found: ${versionId}`);
  }

  const id = input.id?.trim() || createId("p11dep");
  if (deployments.has(id)) {
    throw new Error(`deployment already exists: ${id}`);
  }

  const status = DEPLOYMENT_STATUSES[1];
  const deployment: ReleaseDeployment = {
    id,
    releaseId,
    environmentId,
    versionId,
    status,
    detail: `status=${status} env=${environmentId}`,
    metadata: { ...(input.metadata ?? {}) },
    startedAt: nowIso(),
  };
  deployments.set(id, deployment);
  return cloneDeployment(deployment);
}

export function completeDeployment(
  input: CompleteDeploymentInput,
): ReleaseDeployment {
  const deploymentId = input.deploymentId.trim();
  if (!deploymentId) throw new Error("deployment.deploymentId is required");
  if (!(DEPLOYMENT_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid deployment status: ${input.status}`);
  }
  const existing = deployments.get(deploymentId);
  if (!existing) throw new Error(`deployment not found: ${deploymentId}`);
  if (
    existing.status === "SUCCEEDED" ||
    existing.status === "FAILED" ||
    existing.status === "ROLLED_BACK"
  ) {
    throw new Error(`deployment already complete: ${deploymentId}`);
  }

  const updated: ReleaseDeployment = {
    ...existing,
    status: input.status,
    detail: `status=${input.status} env=${existing.environmentId}`,
    metadata: { ...existing.metadata },
    completedAt: nowIso(),
  };
  deployments.set(deploymentId, updated);
  return cloneDeployment(updated);
}

export function getDeployment(id: string): ReleaseDeployment | undefined {
  const deployment = deployments.get(id.trim());
  return deployment ? cloneDeployment(deployment) : undefined;
}

export function listDeployments(filter?: {
  releaseId?: string;
}): ReleaseDeployment[] {
  let result = [...deployments.values()];
  if (filter?.releaseId) {
    const rid = filter.releaseId.trim();
    result = result.filter((d) => d.releaseId === rid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneDeployment);
}

export function clearDeployments(): void {
  deployments.clear();
}
