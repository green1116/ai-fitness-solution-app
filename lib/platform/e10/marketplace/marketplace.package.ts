/**
 * E10-P6 — Package Model (register / install / uninstall)
 * No external payment or store integration
 */

import { getCatalogEntry } from "./marketplace.catalog";
import type {
  InstallPackageInput,
  InstallRecord,
  PackageDefinition,
  PackageStatus,
  RegisterPackageInput,
} from "./marketplace.types";

const packages = new Map<string, PackageDefinition>();
const installs = new Map<string, InstallRecord>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clonePackage(pkg: PackageDefinition): PackageDefinition {
  return {
    ...pkg,
    metadata: { ...pkg.metadata },
  };
}

function cloneInstall(record: InstallRecord): InstallRecord {
  return { ...record };
}

export function registerPackage(
  input: RegisterPackageInput,
): PackageDefinition {
  const id = input.id.trim();
  const name = input.name.trim();
  const catalogId = input.catalogId.trim();
  const version = input.version.trim();
  const artifactRef = input.artifactRef.trim();
  if (!id) throw new Error("package.id is required");
  if (!name) throw new Error("package.name is required");
  if (!catalogId) throw new Error("package.catalogId is required");
  if (!version) throw new Error("package.version is required");
  if (!artifactRef) throw new Error("package.artifactRef is required");

  const catalog = getCatalogEntry(catalogId);
  if (!catalog) {
    throw new Error(`catalog entry not found: ${catalogId}`);
  }
  if (catalog.kind !== "PACKAGE" && catalog.kind !== "BUNDLE") {
    throw new Error(`catalog kind must be PACKAGE or BUNDLE: ${catalog.kind}`);
  }
  if (packages.has(id)) {
    throw new Error(`package already registered: ${id}`);
  }

  const pkg: PackageDefinition = {
    id,
    name,
    catalogId,
    version,
    status: "AVAILABLE",
    artifactRef,
    metadata: { ...(input.metadata ?? {}) },
    registeredAt: nowIso(),
  };
  packages.set(id, pkg);
  return clonePackage(pkg);
}

export function getPackage(id: string): PackageDefinition | undefined {
  const pkg = packages.get(id.trim());
  return pkg ? clonePackage(pkg) : undefined;
}

export function listPackages(filter?: {
  status?: PackageStatus;
  catalogId?: string;
}): PackageDefinition[] {
  let result = [...packages.values()];
  if (filter?.status) {
    result = result.filter((p) => p.status === filter.status);
  }
  if (filter?.catalogId) {
    const cid = filter.catalogId.trim();
    result = result.filter((p) => p.catalogId === cid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(clonePackage);
}

export function installPackage(input: InstallPackageInput): InstallRecord {
  const packageId = input.packageId.trim();
  const pkg = packages.get(packageId);
  if (!pkg) throw new Error(`package not found: ${packageId}`);
  if (pkg.status === "INSTALLED") {
    throw new Error(`package already installed: ${packageId}`);
  }
  if (pkg.status === "REMOVED") {
    throw new Error(`cannot install removed package: ${packageId}`);
  }

  const installId = input.installId?.trim() || createId("inst");
  if (installs.has(installId)) {
    throw new Error(`install record already exists: ${installId}`);
  }

  const record: InstallRecord = {
    id: installId,
    packageId,
    status: "INSTALLED",
    installedAt: nowIso(),
  };
  pkg.status = "INSTALLED";
  packages.set(pkg.id, pkg);
  installs.set(installId, record);
  return cloneInstall(record);
}

export function uninstallPackage(packageId: string): InstallRecord {
  const pkg = packages.get(packageId.trim());
  if (!pkg) throw new Error(`package not found: ${packageId}`);
  if (pkg.status !== "INSTALLED") {
    throw new Error(
      `uninstall requires INSTALLED (current=${pkg.status})`,
    );
  }

  const record = [...installs.values()].find(
    (r) => r.packageId === pkg.id && r.status === "INSTALLED",
  );
  if (!record) {
    throw new Error(`no active install record for package: ${packageId}`);
  }

  record.status = "UNINSTALLED";
  record.uninstalledAt = nowIso();
  pkg.status = "UNINSTALLED";
  packages.set(pkg.id, pkg);
  installs.set(record.id, record);
  return cloneInstall(record);
}

export function getInstall(id: string): InstallRecord | undefined {
  const record = installs.get(id.trim());
  return record ? cloneInstall(record) : undefined;
}

export function listInstalls(filter?: {
  packageId?: string;
  status?: InstallRecord["status"];
}): InstallRecord[] {
  let result = [...installs.values()];
  if (filter?.packageId) {
    const pid = filter.packageId.trim();
    result = result.filter((r) => r.packageId === pid);
  }
  if (filter?.status) {
    result = result.filter((r) => r.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneInstall);
}

export function removePackage(id: string): boolean {
  const pkg = packages.get(id.trim());
  if (!pkg) return false;
  if (pkg.status === "INSTALLED") {
    throw new Error(`cannot remove installed package: ${id}`);
  }
  pkg.status = "REMOVED";
  packages.delete(pkg.id);
  return true;
}

export function clearPackages(): void {
  packages.clear();
  installs.clear();
}

export function countInstalled(): number {
  return listPackages({ status: "INSTALLED" }).length;
}
