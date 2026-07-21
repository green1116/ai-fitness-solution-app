/**
 * E12-P7 — SLA Model
 * Integrates tenant product and admin organization
 */

import { getOrganization } from "../admin/admin.organization";
import { getProductIdentity } from "../identity/product.identity";
import { getProductTenant } from "../tenant/tenant.product";
import { SLA_STATUSES, SLA_TIERS } from "./commercial.constants";
import type {
  CreateSlaAgreementInput,
  SlaAgreement,
  SlaStatus,
  SlaTier,
} from "./commercial.types";

const agreements = new Map<string, SlaAgreement>();

const TIER_DEFAULTS: Record<
  SlaTier,
  { uptimeTarget: number; responseMinutes: number }
> = {
  STANDARD: { uptimeTarget: 99.5, responseMinutes: 480 },
  PREMIUM: { uptimeTarget: 99.9, responseMinutes: 120 },
  ENTERPRISE: { uptimeTarget: 99.99, responseMinutes: 30 },
};

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneSla(sla: SlaAgreement): SlaAgreement {
  return { ...sla, metadata: { ...sla.metadata } };
}

export function createSlaAgreement(
  input: CreateSlaAgreementInput,
): SlaAgreement {
  const productId = input.productId.trim();
  const productTenantId = input.productTenantId.trim();
  const tier = input.tier ?? "STANDARD";

  if (!getProductIdentity(productId)) {
    throw new Error(`product not found: ${productId}`);
  }
  const tenant = getProductTenant(productTenantId);
  if (!tenant || tenant.productId !== productId) {
    throw new Error(`product tenant not found: ${productTenantId}`);
  }
  if (!(SLA_TIERS as readonly string[]).includes(tier)) {
    throw new Error(`invalid sla tier: ${tier}`);
  }

  if (input.organizationId) {
    const org = getOrganization(input.organizationId.trim());
    if (!org || org.productId !== productId) {
      throw new Error(`organization not found: ${input.organizationId}`);
    }
  }

  const status = input.status ?? "ACTIVE";
  if (!(SLA_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid sla status: ${status}`);
  }

  const defaults = TIER_DEFAULTS[tier];
  const id = input.id?.trim() || createId("sla");
  if (agreements.has(id)) throw new Error(`sla already exists: ${id}`);

  const sla: SlaAgreement = {
    id,
    productId,
    productTenantId,
    organizationId: input.organizationId?.trim() || undefined,
    tier,
    uptimeTarget: input.uptimeTarget ?? defaults.uptimeTarget,
    responseMinutes: input.responseMinutes ?? defaults.responseMinutes,
    status,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  agreements.set(id, sla);
  return cloneSla(sla);
}

export function setSlaStatus(id: string, status: SlaStatus): SlaAgreement {
  const sla = agreements.get(id.trim());
  if (!sla) throw new Error(`sla not found: ${id}`);
  if (!(SLA_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid sla status: ${status}`);
  }
  sla.status = status;
  agreements.set(sla.id, sla);
  return cloneSla(sla);
}

export function getSlaAgreement(id: string): SlaAgreement | undefined {
  const sla = agreements.get(id.trim());
  return sla ? cloneSla(sla) : undefined;
}

export function listSlaAgreements(filter?: {
  productId?: string;
  productTenantId?: string;
  organizationId?: string;
  tier?: SlaTier;
  status?: SlaStatus;
}): SlaAgreement[] {
  let result = [...agreements.values()];
  if (filter?.productId) {
    const pid = filter.productId.trim();
    result = result.filter((s) => s.productId === pid);
  }
  if (filter?.productTenantId) {
    const tid = filter.productTenantId.trim();
    result = result.filter((s) => s.productTenantId === tid);
  }
  if (filter?.organizationId) {
    const oid = filter.organizationId.trim();
    result = result.filter((s) => s.organizationId === oid);
  }
  if (filter?.tier) result = result.filter((s) => s.tier === filter.tier);
  if (filter?.status) result = result.filter((s) => s.status === filter.status);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneSla);
}

export function clearSlaAgreements(): void {
  agreements.clear();
}
