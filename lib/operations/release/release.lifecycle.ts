/**
 * Post-Launch P4 — Release Lifecycle
 * Integrates production operations, launch control, deployment package
 */

import { getDeploymentPackage } from "../../product/e12/deployment/deployment.package";
import { getProductIdentity } from "../../product/e12/identity/product.identity";
import { getLaunchOrchestration } from "../../launch/control/control.orchestration";
import { getProductionOperation } from "../production/production.operation";
import { RELEASE_LIFECYCLE_STATUSES } from "./release.constants";
import type {
  CreateOperationsReleaseInput,
  OperationsRelease,
  ReleaseLifecycleStatus,
} from "./release.types";

const releases = new Map<string, OperationsRelease>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneRelease(release: OperationsRelease): OperationsRelease {
  return { ...release, metadata: { ...release.metadata } };
}

export function createOperationsRelease(
  input: CreateOperationsReleaseInput,
): OperationsRelease {
  const name = input.name.trim();
  const productId = input.productId.trim();
  const productionOperationId = input.productionOperationId.trim();
  const orchestrationId = input.orchestrationId.trim();
  const deploymentPackageId = input.deploymentPackageId.trim();

  if (!name) throw new Error("operationsRelease.name is required");
  if (!getProductIdentity(productId)) {
    throw new Error(`product not found: ${productId}`);
  }

  const operation = getProductionOperation(productionOperationId);
  if (!operation || operation.productId !== productId) {
    throw new Error(
      `production operation not found: ${productionOperationId}`,
    );
  }

  const orch = getLaunchOrchestration(orchestrationId);
  if (!orch || orch.productId !== productId) {
    throw new Error(`orchestration not found: ${orchestrationId}`);
  }

  const pkg = getDeploymentPackage(deploymentPackageId);
  if (!pkg || pkg.productId !== productId) {
    throw new Error(`deployment package not found: ${deploymentPackageId}`);
  }

  const id = input.id?.trim() || createId("opsrel");
  if (releases.has(id)) {
    throw new Error(`operations release already exists: ${id}`);
  }

  const now = nowIso();
  const release: OperationsRelease = {
    id,
    name,
    productId,
    productionOperationId,
    orchestrationId,
    deploymentPackageId,
    status: "DRAFT",
    detail: input.detail?.trim() || "release draft",
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  releases.set(id, release);
  return cloneRelease(release);
}

export function setOperationsReleaseStatus(
  id: string,
  status: ReleaseLifecycleStatus,
  detail?: string,
): OperationsRelease {
  const release = releases.get(id.trim());
  if (!release) throw new Error(`operations release not found: ${id}`);
  if (!(RELEASE_LIFECYCLE_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid release status: ${status}`);
  }

  const now = nowIso();
  release.status = status;
  if (detail) release.detail = detail.trim();
  if (status === "RELEASED") release.releasedAt = now;
  if (status === "ROLLED_BACK") release.rolledBackAt = now;
  release.updatedAt = now;
  releases.set(release.id, release);
  return cloneRelease(release);
}

export function bindReleaseVersion(
  operationsReleaseId: string,
  versionRecordId: string,
): OperationsRelease {
  const release = releases.get(operationsReleaseId.trim());
  if (!release) {
    throw new Error(`operations release not found: ${operationsReleaseId}`);
  }
  release.versionRecordId = versionRecordId.trim();
  release.updatedAt = nowIso();
  if (release.status === "DRAFT") release.status = "PLANNED";
  releases.set(release.id, release);
  return cloneRelease(release);
}

export function bindReleaseApproval(
  operationsReleaseId: string,
  approvalId: string,
): OperationsRelease {
  const release = releases.get(operationsReleaseId.trim());
  if (!release) {
    throw new Error(`operations release not found: ${operationsReleaseId}`);
  }
  release.approvalId = approvalId.trim();
  release.updatedAt = nowIso();
  releases.set(release.id, release);
  return cloneRelease(release);
}

export function getOperationsRelease(
  id: string,
): OperationsRelease | undefined {
  const release = releases.get(id.trim());
  return release ? cloneRelease(release) : undefined;
}

export function listOperationsReleases(filter?: {
  productId?: string;
  productionOperationId?: string;
  status?: ReleaseLifecycleStatus;
}): OperationsRelease[] {
  let result = [...releases.values()];
  if (filter?.productId) {
    const pid = filter.productId.trim();
    result = result.filter((r) => r.productId === pid);
  }
  if (filter?.productionOperationId) {
    const oid = filter.productionOperationId.trim();
    result = result.filter((r) => r.productionOperationId === oid);
  }
  if (filter?.status) result = result.filter((r) => r.status === filter.status);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneRelease);
}

export function clearOperationsReleases(): void {
  releases.clear();
}
