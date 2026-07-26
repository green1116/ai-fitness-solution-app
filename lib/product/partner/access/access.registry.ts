/**
 * Product Partner — access registry (no connector runtime / provider SDK)
 */

import { PARTNER_ACCESS_STATUSES } from "../management/management.constants";
import { getPartnerAgreement } from "../agreement/agreement.registry";
import { getPartner } from "../registry/partner.registry";
import type {
  GrantPartnerAccessInput,
  PartnerAccess,
  PartnerAccessStatus,
  UpdatePartnerAccessStatusInput,
} from "./access.types";

const accesses = new Map<string, PartnerAccess>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneAccess(access: PartnerAccess): PartnerAccess {
  return { ...access, metadata: { ...access.metadata } };
}

export function grantPartnerAccess(
  input: GrantPartnerAccessInput,
): PartnerAccess {
  const partnerId = input.partnerId.trim();
  const agreementId = input.agreementId.trim();
  const accessKey = input.accessKey.trim().toUpperCase();
  const connectorKeyRef = input.connectorKeyRef.trim().toUpperCase();
  if (!partnerId) throw new Error("access.partnerId is required");
  if (!agreementId) throw new Error("access.agreementId is required");
  if (!accessKey) throw new Error("access.accessKey is required");
  if (!connectorKeyRef) throw new Error("access.connectorKeyRef is required");

  const partner = getPartner(partnerId);
  if (!partner) throw new Error(`partner not found: ${partnerId}`);
  if (partner.status !== "ACTIVE") {
    throw new Error(`partner not active: ${partnerId}`);
  }

  const agreement = getPartnerAgreement(agreementId);
  if (!agreement) throw new Error(`agreement not found: ${agreementId}`);
  if (agreement.partnerId !== partnerId) {
    throw new Error(`agreement partner mismatch: ${agreementId}`);
  }
  if (agreement.status !== "ACTIVE") {
    throw new Error(`agreement not active: ${agreementId}`);
  }

  const duplicate = [...accesses.values()].find(
    (a) => a.partnerId === partnerId && a.accessKey === accessKey,
  );
  if (duplicate) {
    throw new Error(`accessKey already exists: ${accessKey}`);
  }

  const id = input.id?.trim() || createId("partneracc");
  if (accesses.has(id)) throw new Error(`access already exists: ${id}`);

  const now = nowIso();
  const access: PartnerAccess = {
    id,
    partnerId,
    agreementId,
    accessKey,
    connectorKeyRef,
    status: PARTNER_ACCESS_STATUSES[0],
    detail: `connector=${connectorKeyRef} status=GRANTED`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  accesses.set(id, access);
  return cloneAccess(access);
}

export function updatePartnerAccessStatus(
  input: UpdatePartnerAccessStatusInput,
): PartnerAccess {
  const accessId = input.accessId.trim();
  if (!accessId) throw new Error("access.accessId is required");
  if (!(PARTNER_ACCESS_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid access status: ${input.status}`);
  }

  const existing = accesses.get(accessId);
  if (!existing) throw new Error(`access not found: ${accessId}`);

  const updated: PartnerAccess = {
    ...existing,
    status: input.status,
    detail: `connector=${existing.connectorKeyRef} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  accesses.set(accessId, updated);
  return cloneAccess(updated);
}

export function getPartnerAccess(id: string): PartnerAccess | undefined {
  const access = accesses.get(id.trim());
  return access ? cloneAccess(access) : undefined;
}

export function listPartnerAccesses(filter?: {
  partnerId?: string;
  status?: PartnerAccessStatus;
}): PartnerAccess[] {
  let result = [...accesses.values()];
  if (filter?.partnerId) {
    const partnerId = filter.partnerId.trim();
    result = result.filter((a) => a.partnerId === partnerId);
  }
  if (filter?.status) {
    result = result.filter((a) => a.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.accessKey.localeCompare(b.accessKey))
    .map(cloneAccess);
}

export function clearPartnerAccesses(): void {
  accesses.clear();
}
