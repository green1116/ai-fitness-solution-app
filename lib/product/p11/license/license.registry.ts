/**
 * Product P11 — License registry
 */

import { LICENSE_STATUSES } from "../release/release.constants";
import { getRelease } from "../release/release.registry";
import { getTenant } from "../tenant/tenant.registry";
import type {
  ActivateLicenseInput,
  CommercialLicense,
  IssueLicenseInput,
} from "./license.types";

const licenses = new Map<string, CommercialLicense>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneLicense(license: CommercialLicense): CommercialLicense {
  return { ...license, metadata: { ...license.metadata } };
}

export function issueLicense(input: IssueLicenseInput): CommercialLicense {
  const releaseId = input.releaseId.trim();
  const tenantId = input.tenantId.trim();
  if (!releaseId) throw new Error("license.releaseId is required");
  if (!tenantId) throw new Error("license.tenantId is required");
  if (!Number.isFinite(input.seats) || input.seats <= 0) {
    throw new Error("license.seats must be a positive number");
  }
  if (!getRelease(releaseId)) {
    throw new Error(`release not found: ${releaseId}`);
  }
  if (!getTenant(tenantId)) {
    throw new Error(`tenant not found: ${tenantId}`);
  }

  const id = input.id?.trim() || createId("p11lic");
  if (licenses.has(id)) {
    throw new Error(`license already exists: ${id}`);
  }

  const key =
    (input.key ?? "").trim() ||
    `LIC-${id.toUpperCase()}-${Math.random().toString(36).slice(2, 8)}`;
  const status = LICENSE_STATUSES[0];
  const license: CommercialLicense = {
    id,
    releaseId,
    tenantId,
    key,
    seats: Math.floor(input.seats),
    status,
    detail: `status=${status} seats=${Math.floor(input.seats)}`,
    metadata: { ...(input.metadata ?? {}) },
    issuedAt: nowIso(),
  };
  licenses.set(id, license);
  return cloneLicense(license);
}

export function activateLicense(
  input: ActivateLicenseInput,
): CommercialLicense {
  const licenseId = input.licenseId.trim();
  if (!licenseId) throw new Error("license.licenseId is required");
  const existing = licenses.get(licenseId);
  if (!existing) throw new Error(`license not found: ${licenseId}`);
  if (existing.status === "ACTIVE") {
    throw new Error(`license already active: ${licenseId}`);
  }
  if (existing.status === "REVOKED" || existing.status === "EXPIRED") {
    throw new Error(`license cannot be activated: ${licenseId}`);
  }

  const updated: CommercialLicense = {
    ...existing,
    status: "ACTIVE",
    detail: `status=ACTIVE seats=${existing.seats}`,
    metadata: { ...existing.metadata },
    activatedAt: nowIso(),
  };
  licenses.set(licenseId, updated);
  return cloneLicense(updated);
}

export function getLicense(id: string): CommercialLicense | undefined {
  const license = licenses.get(id.trim());
  return license ? cloneLicense(license) : undefined;
}

export function listLicenses(filter?: {
  releaseId?: string;
  tenantId?: string;
}): CommercialLicense[] {
  let result = [...licenses.values()];
  if (filter?.releaseId) {
    const rid = filter.releaseId.trim();
    result = result.filter((l) => l.releaseId === rid);
  }
  if (filter?.tenantId) {
    const tid = filter.tenantId.trim();
    result = result.filter((l) => l.tenantId === tid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneLicense);
}

export function clearLicenses(): void {
  licenses.clear();
}
