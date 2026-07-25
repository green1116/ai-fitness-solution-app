/**
 * Product P8 — Package registry
 */

import { PACKAGE_STATUSES } from "../tender/tender.constants";
import { getTender } from "../tender/tender.registry";
import type {
  CreatePackageInput,
  SealPackageInput,
  TenderPackage,
} from "./package.types";

const packages = new Map<string, TenderPackage>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clonePackage(pkg: TenderPackage): TenderPackage {
  return {
    ...pkg,
    exportIds: [...pkg.exportIds],
    metadata: { ...pkg.metadata },
  };
}

export function createPackage(input: CreatePackageInput): TenderPackage {
  const tenderId = input.tenderId.trim();
  const name = input.name.trim();
  if (!tenderId) throw new Error("package.tenderId is required");
  if (!name) throw new Error("package.name is required");
  if (!getTender(tenderId)) {
    throw new Error(`tender not found: ${tenderId}`);
  }

  const id = input.id?.trim() || createId("p8pkg");
  if (packages.has(id)) {
    throw new Error(`package already exists: ${id}`);
  }

  const exportIds = (input.exportIds ?? [])
    .map((e) => e.trim())
    .filter((e) => e.length > 0);
  const status = PACKAGE_STATUSES[1];
  const pkg: TenderPackage = {
    id,
    tenderId,
    name,
    exportIds,
    status,
    detail: `status=${status} exports=${exportIds.length}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  packages.set(id, pkg);
  return clonePackage(pkg);
}

export function sealPackage(input: SealPackageInput): TenderPackage {
  const packageId = input.packageId.trim();
  if (!packageId) throw new Error("package.packageId is required");
  const existing = packages.get(packageId);
  if (!existing) throw new Error(`package not found: ${packageId}`);
  if (existing.status === "SEALED" || existing.status === "DELIVERED") {
    throw new Error(`package already sealed: ${packageId}`);
  }

  const exportIds =
    input.exportIds !== undefined
      ? input.exportIds.map((e) => e.trim()).filter((e) => e.length > 0)
      : existing.exportIds;
  if (exportIds.length < 1) {
    throw new Error("package.exportIds must include at least one export");
  }

  const updated: TenderPackage = {
    ...existing,
    exportIds,
    status: "SEALED",
    detail: `status=SEALED exports=${exportIds.length}`,
    metadata: { ...existing.metadata },
    sealedAt: nowIso(),
  };
  packages.set(packageId, updated);
  return clonePackage(updated);
}

export function getPackage(id: string): TenderPackage | undefined {
  const pkg = packages.get(id.trim());
  return pkg ? clonePackage(pkg) : undefined;
}

export function listPackages(filter?: {
  tenderId?: string;
}): TenderPackage[] {
  let result = [...packages.values()];
  if (filter?.tenderId) {
    const tid = filter.tenderId.trim();
    result = result.filter((p) => p.tenderId === tid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(clonePackage);
}

export function clearPackages(): void {
  packages.clear();
}
