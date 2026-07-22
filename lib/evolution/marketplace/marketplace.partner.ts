/**
 * Evolution P6 — Partner Ecosystem
 */

import { getOrganization } from "../../product/e12/admin/admin.organization";
import { PARTNER_STATUSES, PARTNER_TIERS } from "./marketplace.constants";
import { getMarketplaceProfile } from "./marketplace.model";
import type {
  PartnerRecord,
  PartnerStatus,
  PartnerTier,
  RegisterPartnerInput,
} from "./marketplace.types";

const partners = new Map<string, PartnerRecord>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clonePartner(partner: PartnerRecord): PartnerRecord {
  return { ...partner };
}

export function registerPartner(input: RegisterPartnerInput): PartnerRecord {
  const marketplace = getMarketplaceProfile(input.marketplaceId.trim());
  if (!marketplace) {
    throw new Error(`marketplace profile not found: ${input.marketplaceId}`);
  }
  if (marketplace.status !== "ACTIVE" && marketplace.status !== "DRAFT") {
    throw new Error(
      `marketplace not accepting partners: ${marketplace.status}`,
    );
  }

  const name = input.name.trim();
  if (!name) throw new Error("partner.name is required");

  if (input.organizationId) {
    const org = getOrganization(input.organizationId.trim());
    if (!org || org.productId !== marketplace.productId) {
      throw new Error(`organization not found: ${input.organizationId}`);
    }
  }

  const tier: PartnerTier = input.tier ?? "STANDARD";
  if (!(PARTNER_TIERS as readonly string[]).includes(tier)) {
    throw new Error(`invalid partner tier: ${tier}`);
  }

  const status: PartnerStatus = input.status ?? "ACTIVE";
  if (!(PARTNER_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid partner status: ${status}`);
  }

  const capabilityScore =
    tier === "FOUNDING"
      ? 92
      : tier === "STRATEGIC"
        ? 84
        : tier === "PREFERRED"
          ? 72
          : 60;

  const id = input.id?.trim() || createId("partner");
  if (partners.has(id)) {
    throw new Error(`partner already exists: ${id}`);
  }

  const now = nowIso();
  const partner: PartnerRecord = {
    id,
    marketplaceId: marketplace.id,
    name,
    organizationId: input.organizationId?.trim() || undefined,
    tier,
    status,
    capabilityScore,
    detail: `tier=${tier} status=${status} capability=${capabilityScore}`,
    createdAt: now,
    updatedAt: now,
  };
  partners.set(id, partner);
  return clonePartner(partner);
}

export function getPartner(id: string): PartnerRecord | undefined {
  const partner = partners.get(id.trim());
  return partner ? clonePartner(partner) : undefined;
}

export function listPartners(filter?: {
  marketplaceId?: string;
  status?: PartnerStatus;
  tier?: PartnerTier;
}): PartnerRecord[] {
  let result = [...partners.values()];
  if (filter?.marketplaceId) {
    const mid = filter.marketplaceId.trim();
    result = result.filter((p) => p.marketplaceId === mid);
  }
  if (filter?.status) result = result.filter((p) => p.status === filter.status);
  if (filter?.tier) result = result.filter((p) => p.tier === filter.tier);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(clonePartner);
}

export function clearPartners(): void {
  partners.clear();
}
