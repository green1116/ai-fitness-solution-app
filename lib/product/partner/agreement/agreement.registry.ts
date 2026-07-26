/**
 * Product Partner — agreement registry
 */

import { PARTNER_AGREEMENT_STATUSES } from "../management/management.constants";
import { getPartner } from "../registry/partner.registry";
import type {
  PartnerAgreement,
  PartnerAgreementStatus,
  RegisterPartnerAgreementInput,
  UpdatePartnerAgreementStatusInput,
} from "./agreement.types";

const agreements = new Map<string, PartnerAgreement>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneAgreement(agreement: PartnerAgreement): PartnerAgreement {
  return { ...agreement, metadata: { ...agreement.metadata } };
}

export function registerPartnerAgreement(
  input: RegisterPartnerAgreementInput,
): PartnerAgreement {
  const partnerId = input.partnerId.trim();
  const agreementKey = input.agreementKey.trim().toUpperCase();
  const termsRef = input.termsRef.trim().toUpperCase();
  if (!partnerId) throw new Error("agreement.partnerId is required");
  if (!agreementKey) throw new Error("agreement.agreementKey is required");
  if (!termsRef) throw new Error("agreement.termsRef is required");

  const partner = getPartner(partnerId);
  if (!partner) throw new Error(`partner not found: ${partnerId}`);
  if (partner.status === "RETIRED") {
    throw new Error(`partner retired: ${partnerId}`);
  }

  const duplicate = [...agreements.values()].find(
    (a) => a.partnerId === partnerId && a.agreementKey === agreementKey,
  );
  if (duplicate) {
    throw new Error(`agreementKey already exists: ${agreementKey}`);
  }

  const id = input.id?.trim() || createId("partneragr");
  if (agreements.has(id)) throw new Error(`agreement already exists: ${id}`);

  const now = nowIso();
  const agreement: PartnerAgreement = {
    id,
    partnerId,
    agreementKey,
    status: PARTNER_AGREEMENT_STATUSES[1],
    termsRef,
    detail: `terms=${termsRef} status=ACTIVE`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  agreements.set(id, agreement);
  return cloneAgreement(agreement);
}

export function updatePartnerAgreementStatus(
  input: UpdatePartnerAgreementStatusInput,
): PartnerAgreement {
  const agreementId = input.agreementId.trim();
  if (!agreementId) throw new Error("agreement.agreementId is required");
  if (
    !(PARTNER_AGREEMENT_STATUSES as readonly string[]).includes(input.status)
  ) {
    throw new Error(`invalid agreement status: ${input.status}`);
  }

  const existing = agreements.get(agreementId);
  if (!existing) throw new Error(`agreement not found: ${agreementId}`);

  const updated: PartnerAgreement = {
    ...existing,
    status: input.status,
    detail: `terms=${existing.termsRef} status=${input.status}`,
    metadata: { ...existing.metadata },
    updatedAt: nowIso(),
  };
  agreements.set(agreementId, updated);
  return cloneAgreement(updated);
}

export function getPartnerAgreement(
  id: string,
): PartnerAgreement | undefined {
  const agreement = agreements.get(id.trim());
  return agreement ? cloneAgreement(agreement) : undefined;
}

export function listPartnerAgreements(filter?: {
  partnerId?: string;
  status?: PartnerAgreementStatus;
}): PartnerAgreement[] {
  let result = [...agreements.values()];
  if (filter?.partnerId) {
    const partnerId = filter.partnerId.trim();
    result = result.filter((a) => a.partnerId === partnerId);
  }
  if (filter?.status) {
    result = result.filter((a) => a.status === filter.status);
  }
  return result
    .slice()
    .sort((a, b) => a.agreementKey.localeCompare(b.agreementKey))
    .map(cloneAgreement);
}

export function clearPartnerAgreements(): void {
  agreements.clear();
}
