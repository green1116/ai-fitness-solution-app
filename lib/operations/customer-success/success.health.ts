/**
 * Post-Launch P2 — Customer Health Model
 * Integrates tenant product, commercial org, SLA, production ops
 */

import { getOrganization } from "../../product/e12/admin/admin.organization";
import { getProductIdentity } from "../../product/e12/identity/product.identity";
import { getProductTenant } from "../../product/e12/tenant/tenant.product";
import { getOnboardingProfile } from "../../launch/onboarding/onboarding.profile";
import { getSupportSlaProfile } from "../../launch/support/support.profile";
import { getProductionOperation } from "../production/production.operation";
import { CUSTOMER_HEALTH_LEVELS } from "./success.constants";
import type {
  CreateCustomerHealthProfileInput,
  CustomerHealthLevel,
  CustomerHealthProfile,
} from "./success.types";

const profiles = new Map<string, CustomerHealthProfile>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneProfile(profile: CustomerHealthProfile): CustomerHealthProfile {
  return { ...profile, metadata: { ...profile.metadata } };
}

function scoreToHealth(score: number): CustomerHealthLevel {
  if (score >= 80) return "HEALTHY";
  if (score >= 60) return "STABLE";
  if (score >= 40) return "AT_RISK";
  if (score > 0) return "CRITICAL";
  return "UNKNOWN";
}

export function createCustomerHealthProfile(
  input: CreateCustomerHealthProfileInput,
): CustomerHealthProfile {
  const name = input.name.trim();
  const productId = input.productId.trim();
  const organizationId = input.organizationId.trim();
  const productTenantId = input.productTenantId.trim();

  if (!name) throw new Error("customerHealth.name is required");
  if (!getProductIdentity(productId)) {
    throw new Error(`product not found: ${productId}`);
  }

  const org = getOrganization(organizationId);
  if (!org || org.productId !== productId) {
    throw new Error(`organization not found: ${organizationId}`);
  }

  const tenant = getProductTenant(productTenantId);
  if (!tenant || tenant.productId !== productId) {
    throw new Error(`product tenant not found: ${productTenantId}`);
  }

  if (input.productionOperationId) {
    const op = getProductionOperation(input.productionOperationId.trim());
    if (!op || op.productId !== productId) {
      throw new Error(
        `production operation not found: ${input.productionOperationId}`,
      );
    }
  }

  if (input.supportSlaProfileId) {
    const sla = getSupportSlaProfile(input.supportSlaProfileId.trim());
    if (!sla || sla.productId !== productId) {
      throw new Error(
        `support sla profile not found: ${input.supportSlaProfileId}`,
      );
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

  const id = input.id?.trim() || createId("cshealth");
  if (profiles.has(id)) {
    throw new Error(`customer health profile already exists: ${id}`);
  }

  let score = 40;
  if (tenant.status === "ACTIVE") score += 25;
  if (org.status === "ACTIVE") score += 15;
  if (input.supportSlaProfileId) score += 10;
  if (input.productionOperationId) score += 10;

  const now = nowIso();
  const profile: CustomerHealthProfile = {
    id,
    name,
    productId,
    organizationId,
    productTenantId,
    productionOperationId: input.productionOperationId?.trim() || undefined,
    supportSlaProfileId: input.supportSlaProfileId?.trim() || undefined,
    onboardingProfileId: input.onboardingProfileId?.trim() || undefined,
    health: scoreToHealth(score),
    score,
    detail: "initial health assessment",
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  profiles.set(id, profile);
  return cloneProfile(profile);
}

export function reassessCustomerHealth(
  id: string,
  patch?: { score?: number; detail?: string },
): CustomerHealthProfile {
  const profile = profiles.get(id.trim());
  if (!profile) throw new Error(`customer health profile not found: ${id}`);

  if (patch?.score !== undefined) {
    if (patch.score < 0 || patch.score > 100) {
      throw new Error("health score must be 0..100");
    }
    profile.score = patch.score;
  }
  profile.health = scoreToHealth(profile.score);
  if (!(CUSTOMER_HEALTH_LEVELS as readonly string[]).includes(profile.health)) {
    throw new Error(`invalid health level: ${profile.health}`);
  }
  if (patch?.detail) profile.detail = patch.detail.trim();
  profile.updatedAt = nowIso();
  profiles.set(profile.id, profile);
  return cloneProfile(profile);
}

export function getCustomerHealthProfile(
  id: string,
): CustomerHealthProfile | undefined {
  const profile = profiles.get(id.trim());
  return profile ? cloneProfile(profile) : undefined;
}

export function listCustomerHealthProfiles(filter?: {
  productId?: string;
  health?: CustomerHealthLevel;
}): CustomerHealthProfile[] {
  let result = [...profiles.values()];
  if (filter?.productId) {
    const pid = filter.productId.trim();
    result = result.filter((p) => p.productId === pid);
  }
  if (filter?.health) result = result.filter((p) => p.health === filter.health);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneProfile);
}

export function clearCustomerHealthProfiles(): void {
  profiles.clear();
}
