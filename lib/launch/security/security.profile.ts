/**
 * Launch P4 — Security Profile
 * Integrates production profile, optional demo tenant, organization
 */

import { getOrganization } from "../../product/e12/admin/admin.organization";
import { getProductIdentity } from "../../product/e12/identity/product.identity";
import { getProductTenant } from "../../product/e12/tenant/tenant.product";
import { getDemoTenant } from "../demo/demo.tenant";
import { getProductionProfile } from "../launch.profile";
import { SECURITY_PROFILE_STATUSES } from "./security.constants";
import type {
  CreateSecurityProfileInput,
  SecurityProfile,
  SecurityProfileStatus,
} from "./security.types";

const profiles = new Map<string, SecurityProfile>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneProfile(profile: SecurityProfile): SecurityProfile {
  return { ...profile, metadata: { ...profile.metadata } };
}

export function createSecurityProfile(
  input: CreateSecurityProfileInput,
): SecurityProfile {
  const name = input.name.trim();
  const productId = input.productId.trim();
  const productionProfileId = input.productionProfileId.trim();
  const reviewerUserId = input.reviewerUserId.trim();

  if (!name) throw new Error("securityProfile.name is required");
  if (!reviewerUserId) {
    throw new Error("securityProfile.reviewerUserId is required");
  }
  if (!getProductIdentity(productId)) {
    throw new Error(`product not found: ${productId}`);
  }

  const production = getProductionProfile(productionProfileId);
  if (!production || production.productId !== productId) {
    throw new Error(
      `production profile not found for product: ${productionProfileId}`,
    );
  }

  if (input.organizationId) {
    const org = getOrganization(input.organizationId.trim());
    if (!org || org.productId !== productId) {
      throw new Error(`organization not found: ${input.organizationId}`);
    }
  }

  if (input.productTenantId) {
    const tenant = getProductTenant(input.productTenantId.trim());
    if (!tenant || tenant.productId !== productId) {
      throw new Error(`product tenant not found: ${input.productTenantId}`);
    }
  }

  if (input.demoTenantId) {
    const demo = getDemoTenant(input.demoTenantId.trim());
    if (!demo || demo.productId !== productId) {
      throw new Error(`demo tenant not found: ${input.demoTenantId}`);
    }
  }

  const status = input.status ?? "DRAFT";
  if (!(SECURITY_PROFILE_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid security profile status: ${status}`);
  }

  const id = input.id?.trim() || createId("secprofile");
  if (profiles.has(id)) {
    throw new Error(`security profile already exists: ${id}`);
  }

  const profile: SecurityProfile = {
    id,
    name,
    productId,
    productionProfileId,
    organizationId: input.organizationId?.trim() || undefined,
    productTenantId: input.productTenantId?.trim() || undefined,
    demoTenantId: input.demoTenantId?.trim() || undefined,
    reviewerUserId,
    status,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  profiles.set(id, profile);
  return cloneProfile(profile);
}

export function getSecurityProfile(id: string): SecurityProfile | undefined {
  const profile = profiles.get(id.trim());
  return profile ? cloneProfile(profile) : undefined;
}

export function listSecurityProfiles(filter?: {
  productId?: string;
  status?: SecurityProfileStatus;
}): SecurityProfile[] {
  let result = [...profiles.values()];
  if (filter?.productId) {
    const pid = filter.productId.trim();
    result = result.filter((p) => p.productId === pid);
  }
  if (filter?.status) result = result.filter((p) => p.status === filter.status);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneProfile);
}

export function setSecurityProfileStatus(
  id: string,
  status: SecurityProfileStatus,
): SecurityProfile {
  const profile = profiles.get(id.trim());
  if (!profile) throw new Error(`security profile not found: ${id}`);
  if (!(SECURITY_PROFILE_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid security profile status: ${status}`);
  }
  profile.status = status;
  profiles.set(profile.id, profile);
  return cloneProfile(profile);
}

export function clearSecurityProfiles(): void {
  profiles.clear();
}
