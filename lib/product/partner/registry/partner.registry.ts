/**
 * Product Partner — registry
 */

import {
  PARTNER_KINDS,
  PARTNER_STATUSES,
} from "../management/management.constants";
import type {
  PartnerKind,
  PartnerStatus,
  ProductPartner,
  RegisterPartnerInput,
  UpdatePartnerStatusInput,
} from "./partner.types";

const partners = new Map<string, ProductPartner>();
const keys = new Map<string, string>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clonePartner(partner: ProductPartner): ProductPartner {
  return { ...partner, metadata: { ...partner.metadata } };
}

export function registerPartner(input: RegisterPartnerInput): ProductPartner {
  const partnerKey = input.partnerKey.trim().toUpperCase();
  const name = input.name.trim();
  if (!partnerKey) throw new Error("partner.partnerKey is required");
  if (!name) throw new Error("partner.name is required");
  if (!(PARTNER_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid partner kind: ${input.kind}`);
  }
  if (keys.has(partnerKey)) {
    throw new Error(`partnerKey already exists: ${partnerKey}`);
  }

  const id = input.id?.trim() || createId("partner");
  if (partners.has(id)) throw new Error(`partner already exists: ${id}`);

  const now = nowIso();
  const partner: ProductPartner = {
    id,
    partnerKey,
    name,
    kind: input.kind,
    status: PARTNER_STATUSES[0],
    detail: `kind=${input.kind} status=DRAFT`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  partners.set(id, partner);
  keys.set(partnerKey, id);
  return clonePartner(partner);
}

export function updatePartnerStatus(
  input: UpdatePartnerStatusInput,
): ProductPartner {
  const partnerId = input.partnerId.trim();
  if (!partnerId) throw new Error("partner.partnerId is required");
  if (!(PARTNER_STATUSES as readonly string[]).includes(input.status)) {
    throw new Error(`invalid partner status: ${input.status}`);
  }

  const existing = partners.get(partnerId);
  if (!existing) throw new Error(`partner not found: ${partnerId}`);

  const updated: ProductPartner = {
    ...existing,
    status: input.status,
    detail: `kind=${existing.kind} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  partners.set(partnerId, updated);
  return clonePartner(updated);
}

export function getPartner(id: string): ProductPartner | undefined {
  const partner = partners.get(id.trim());
  return partner ? clonePartner(partner) : undefined;
}

export function listPartners(filter?: {
  kind?: PartnerKind;
  status?: PartnerStatus;
}): ProductPartner[] {
  let result = [...partners.values()];
  if (filter?.kind) result = result.filter((p) => p.kind === filter.kind);
  if (filter?.status) {
    result = result.filter((p) => p.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.partnerKey.localeCompare(b.partnerKey))
    .map(clonePartner);
}

export function clearPartners(): void {
  partners.clear();
  keys.clear();
}
