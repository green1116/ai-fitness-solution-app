/**
 * Launch P5 — SLA Profile
 * Integrates production profile, commercial SLA, security, onboarding
 */

import { getOrganization } from "../../product/e12/admin/admin.organization";
import { getSlaAgreement } from "../../product/e12/commercial/commercial.sla";
import { getProductIdentity } from "../../product/e12/identity/product.identity";
import { getProductTenant } from "../../product/e12/tenant/tenant.product";
import { getOnboardingProfile } from "../onboarding/onboarding.profile";
import { getProductionProfile } from "../launch.profile";
import { getSecurityProfile } from "../security/security.profile";
import { SUPPORT_SLA_PROFILE_STATUSES } from "./support.constants";
import { getSupportTier } from "./support.tier";
import type {
  CreateSupportSlaProfileInput,
  SupportSlaProfile,
  SupportSlaProfileStatus,
} from "./support.types";

const profiles = new Map<string, SupportSlaProfile>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneProfile(profile: SupportSlaProfile): SupportSlaProfile {
  return { ...profile, metadata: { ...profile.metadata } };
}

export function createSupportSlaProfile(
  input: CreateSupportSlaProfileInput,
): SupportSlaProfile {
  const name = input.name.trim();
  const productId = input.productId.trim();
  const productionProfileId = input.productionProfileId.trim();
  const productTenantId = input.productTenantId.trim();

  if (!name) throw new Error("supportSlaProfile.name is required");
  if (!getProductIdentity(productId)) {
    throw new Error(`product not found: ${productId}`);
  }

  const production = getProductionProfile(productionProfileId);
  if (!production || production.productId !== productId) {
    throw new Error(
      `production profile not found for product: ${productionProfileId}`,
    );
  }

  const tenant = getProductTenant(productTenantId);
  if (!tenant || tenant.productId !== productId) {
    throw new Error(`product tenant not found: ${productTenantId}`);
  }

  if (input.organizationId) {
    const org = getOrganization(input.organizationId.trim());
    if (!org || org.productId !== productId) {
      throw new Error(`organization not found: ${input.organizationId}`);
    }
  }

  if (input.securityProfileId) {
    const security = getSecurityProfile(input.securityProfileId.trim());
    if (!security || security.productId !== productId) {
      throw new Error(`security profile not found: ${input.securityProfileId}`);
    }
  }

  if (input.onboardingProfileId) {
    const onboarding = getOnboardingProfile(input.onboardingProfileId.trim());
    if (!onboarding || onboarding.productId !== productId) {
      throw new Error(
        `onboarding profile not found: ${input.onboardingProfileId}`,
      );
    }
  }

  if (input.commercialSlaId) {
    const sla = getSlaAgreement(input.commercialSlaId.trim());
    if (!sla || sla.productId !== productId) {
      throw new Error(`commercial sla not found: ${input.commercialSlaId}`);
    }
    if (sla.productTenantId !== productTenantId) {
      throw new Error(
        `commercial sla tenant mismatch: ${input.commercialSlaId}`,
      );
    }
  }

  if (input.supportTierId) {
    if (!getSupportTier(input.supportTierId.trim())) {
      throw new Error(`support tier not found: ${input.supportTierId}`);
    }
  }

  const status = input.status ?? "DRAFT";
  if (!(SUPPORT_SLA_PROFILE_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid support sla profile status: ${status}`);
  }

  const id = input.id?.trim() || createId("supsla");
  if (profiles.has(id)) {
    throw new Error(`support sla profile already exists: ${id}`);
  }

  const profile: SupportSlaProfile = {
    id,
    name,
    productId,
    productionProfileId,
    productTenantId,
    organizationId: input.organizationId?.trim() || undefined,
    securityProfileId: input.securityProfileId?.trim() || undefined,
    onboardingProfileId: input.onboardingProfileId?.trim() || undefined,
    commercialSlaId: input.commercialSlaId?.trim() || undefined,
    supportTierId: input.supportTierId?.trim() || undefined,
    status,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  profiles.set(id, profile);
  return cloneProfile(profile);
}

export function getSupportSlaProfile(
  id: string,
): SupportSlaProfile | undefined {
  const profile = profiles.get(id.trim());
  return profile ? cloneProfile(profile) : undefined;
}

export function listSupportSlaProfiles(filter?: {
  productId?: string;
  productTenantId?: string;
  status?: SupportSlaProfileStatus;
}): SupportSlaProfile[] {
  let result = [...profiles.values()];
  if (filter?.productId) {
    const pid = filter.productId.trim();
    result = result.filter((p) => p.productId === pid);
  }
  if (filter?.productTenantId) {
    const tid = filter.productTenantId.trim();
    result = result.filter((p) => p.productTenantId === tid);
  }
  if (filter?.status) result = result.filter((p) => p.status === filter.status);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneProfile);
}

export function setSupportSlaProfileStatus(
  id: string,
  status: SupportSlaProfileStatus,
): SupportSlaProfile {
  const profile = profiles.get(id.trim());
  if (!profile) throw new Error(`support sla profile not found: ${id}`);
  if (!(SUPPORT_SLA_PROFILE_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid support sla profile status: ${status}`);
  }
  profile.status = status;
  profiles.set(profile.id, profile);
  return cloneProfile(profile);
}

export function bindSupportTier(
  profileId: string,
  supportTierId: string,
): SupportSlaProfile {
  const profile = profiles.get(profileId.trim());
  if (!profile) throw new Error(`support sla profile not found: ${profileId}`);
  if (!getSupportTier(supportTierId.trim())) {
    throw new Error(`support tier not found: ${supportTierId}`);
  }
  profile.supportTierId = supportTierId.trim();
  profiles.set(profile.id, profile);
  return cloneProfile(profile);
}

export function clearSupportSlaProfiles(): void {
  profiles.clear();
}
