/**
 * V99 — Certification cache (minimal write for packages / actions)
 */

import { randomUUID } from "node:crypto";

import type {
  CertificationActionEntry,
  CertificationActionType,
  CertificationGate,
  CertificationPackage,
  GateStatus,
} from "./readiness.types";

type CertificationCacheEntry = {
  organizationId: string;
  packages: CertificationPackage[];
  actions: CertificationActionEntry[];
  gateOverrides: Map<string, GateStatus>;
  certifiedAt?: string;
};

declare global {
  // eslint-disable-next-line no-var
  var __v99CertificationCache: Map<string, CertificationCacheEntry> | undefined;
}

function cache(): Map<string, CertificationCacheEntry> {
  globalThis.__v99CertificationCache ||= new Map();
  return globalThis.__v99CertificationCache;
}

function getOrCreateEntry(organizationId: string): CertificationCacheEntry {
  const existing = cache().get(organizationId);
  if (existing) return existing;
  const entry: CertificationCacheEntry = {
    organizationId,
    packages: [],
    actions: [],
    gateOverrides: new Map(),
  };
  cache().set(organizationId, entry);
  return entry;
}

export function listCertificationPackages(organizationId: string): CertificationPackage[] {
  return getOrCreateEntry(organizationId).packages.sort((a, b) =>
    b.generatedAt.localeCompare(a.generatedAt),
  );
}

export function getCertificationPackage(
  organizationId: string,
  packageId: string,
): CertificationPackage | null {
  return listCertificationPackages(organizationId).find((p) => p.id === packageId) ?? null;
}

export function saveCertificationPackage(pack: CertificationPackage): CertificationPackage {
  const entry = getOrCreateEntry(pack.organizationId);
  const idx = entry.packages.findIndex((p) => p.id === pack.id);
  if (idx >= 0) entry.packages[idx] = pack;
  else entry.packages.push(pack);
  cache().set(pack.organizationId, entry);
  return pack;
}

export function getGateOverride(
  organizationId: string,
  gateId: string,
): GateStatus | null {
  return getOrCreateEntry(organizationId).gateOverrides.get(gateId) ?? null;
}

export function setGateOverride(
  organizationId: string,
  gateId: string,
  status: GateStatus,
): void {
  const entry = getOrCreateEntry(organizationId);
  entry.gateOverrides.set(gateId, status);
  cache().set(organizationId, entry);
}

export function getCertifiedAt(organizationId: string): string | undefined {
  return getOrCreateEntry(organizationId).certifiedAt;
}

export function setCertifiedAt(organizationId: string, certifiedAt: string): void {
  const entry = getOrCreateEntry(organizationId);
  entry.certifiedAt = certifiedAt;
  cache().set(organizationId, entry);
}

export function appendCertificationAction(input: {
  organizationId: string;
  actorId: string;
  action: CertificationActionType;
  packageId?: string;
  gateId?: string;
  note?: string;
  meta?: Record<string, unknown>;
}): CertificationActionEntry {
  const entry = getOrCreateEntry(input.organizationId);
  const action: CertificationActionEntry = {
    id: randomUUID(),
    organizationId: input.organizationId,
    actorId: input.actorId,
    action: input.action,
    packageId: input.packageId,
    gateId: input.gateId,
    timestamp: new Date().toISOString(),
    note: input.note,
    meta: input.meta,
  };
  entry.actions.push(action);
  cache().set(input.organizationId, entry);
  return action;
}

export function listCertificationActions(organizationId: string): CertificationActionEntry[] {
  return getOrCreateEntry(organizationId).actions.sort((a, b) =>
    b.timestamp.localeCompare(a.timestamp),
  );
}

export function clearCertificationCacheForTests(): void {
  globalThis.__v99CertificationCache = new Map();
}
