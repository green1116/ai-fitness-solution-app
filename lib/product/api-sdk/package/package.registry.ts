/**
 * Product API SDK — package registry (no runtime, no portal)
 */

import { SDK_PACKAGE_STATUSES } from "../management/management.constants";
import { getSdkClient } from "../client/client.registry";
import { getSdkOperation } from "../operation/operation.registry";
import type {
  PublishSdkPackageInput,
  SdkPackage,
  SdkPackageStatus,
  UpdateSdkPackageStatusInput,
} from "./package.types";

const packages = new Map<string, SdkPackage>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clonePackage(pkg: SdkPackage): SdkPackage {
  return {
    ...pkg,
    operationIds: [...pkg.operationIds],
    metadata: { ...pkg.metadata },
  };
}

function isSemver(value: string): boolean {
  return /^\d+\.\d+\.\d+$/.test(value);
}

export function publishSdkPackage(input: PublishSdkPackageInput): SdkPackage {
  const clientId = input.clientId.trim();
  const packageKey = input.packageKey.trim().toUpperCase();
  const semver = input.semver.trim();
  if (!clientId) throw new Error("package.clientId is required");
  if (!packageKey) throw new Error("package.packageKey is required");
  if (!isSemver(semver)) {
    throw new Error(`invalid package semver: ${input.semver}`);
  }
  if (!Array.isArray(input.operationIds) || input.operationIds.length < 1) {
    throw new Error("package.operationIds requires at least one operation");
  }

  const client = getSdkClient(clientId);
  if (!client) throw new Error(`client not found: ${clientId}`);
  if (client.status !== "ACTIVE") {
    throw new Error(`client not active: ${clientId}`);
  }

  const operationIds = input.operationIds.map((id) => id.trim());
  for (const operationId of operationIds) {
    const operation = getSdkOperation(operationId);
    if (!operation) throw new Error(`operation not found: ${operationId}`);
    if (operation.clientId !== clientId) {
      throw new Error(`operation client mismatch: ${operationId}`);
    }
  }

  const duplicate = [...packages.values()].find(
    (p) =>
      p.clientId === clientId &&
      p.packageKey === packageKey &&
      p.semver === semver,
  );
  if (duplicate) {
    throw new Error(`package already exists: ${packageKey}@${semver}`);
  }

  const id = input.id?.trim() || createId("apisdkpkg");
  if (packages.has(id)) throw new Error(`package already exists: ${id}`);

  const now = nowIso();
  const pkg: SdkPackage = {
    id,
    clientId,
    packageKey,
    semver,
    status: SDK_PACKAGE_STATUSES[1],
    operationIds,
    detail: `${packageKey}@${semver} ops=${operationIds.length}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  packages.set(id, pkg);
  return clonePackage(pkg);
}

export function updateSdkPackageStatus(
  input: UpdateSdkPackageStatusInput,
): SdkPackage {
  const packageId = input.packageId.trim();
  if (!packageId) throw new Error("package.packageId is required");
  if (!(SDK_PACKAGE_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid package status: ${input.status}`);
  }

  const existing = packages.get(packageId);
  if (!existing) throw new Error(`package not found: ${packageId}`);

  const updated: SdkPackage = {
    ...existing,
    status: input.status,
    operationIds: [...existing.operationIds],
    detail: `${existing.packageKey}@${existing.semver} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  packages.set(packageId, updated);
  return clonePackage(updated);
}

export function getSdkPackage(id: string): SdkPackage | undefined {
  const pkg = packages.get(id.trim());
  return pkg ? clonePackage(pkg) : undefined;
}

export function listSdkPackages(filter?: {
  clientId?: string;
  status?: SdkPackageStatus;
}): SdkPackage[] {
  let result = [...packages.values()];
  if (filter?.clientId) {
    const clientId = filter.clientId.trim();
    result = result.filter((p) => p.clientId === clientId);
  }
  if (filter?.status) {
    result = result.filter((p) => p.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) =>
      `${a.packageKey}@${a.semver}`.localeCompare(
        `${b.packageKey}@${b.semver}`,
      ),
    )
    .map(clonePackage);
}

export function clearSdkPackages(): void {
  packages.clear();
}
