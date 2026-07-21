/**
 * Launch P2 — Onboarding Profile
 * Integrates production profile and deployment package
 */

import { getDeploymentPackage } from "../../product/e12/deployment/deployment.package";
import { getProductIdentity } from "../../product/e12/identity/product.identity";
import { getProductionProfile } from "../launch.profile";
import { ONBOARDING_PROFILE_STATUSES } from "./onboarding.constants";
import type {
  CreateOnboardingProfileInput,
  OnboardingProfile,
  OnboardingProfileStatus,
} from "./onboarding.types";

const profiles = new Map<string, OnboardingProfile>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneProfile(profile: OnboardingProfile): OnboardingProfile {
  return { ...profile, metadata: { ...profile.metadata } };
}

export function createOnboardingProfile(
  input: CreateOnboardingProfileInput,
): OnboardingProfile {
  const customerName = input.customerName.trim();
  const productId = input.productId.trim();
  const productionProfileId = input.productionProfileId.trim();

  if (!customerName) throw new Error("onboarding.customerName is required");
  if (!getProductIdentity(productId)) {
    throw new Error(`product not found: ${productId}`);
  }

  const production = getProductionProfile(productionProfileId);
  if (!production || production.productId !== productId) {
    throw new Error(
      `production profile not found for product: ${productionProfileId}`,
    );
  }

  const deploymentPackageId =
    input.deploymentPackageId?.trim() || production.deploymentPackageId;
  if (deploymentPackageId) {
    const pkg = getDeploymentPackage(deploymentPackageId);
    if (!pkg || pkg.productId !== productId) {
      throw new Error(`deployment package not found: ${deploymentPackageId}`);
    }
  }

  const status = input.status ?? "DRAFT";
  if (!(ONBOARDING_PROFILE_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid onboarding status: ${status}`);
  }

  const id = input.id?.trim() || createId("onboard");
  if (profiles.has(id)) {
    throw new Error(`onboarding profile already exists: ${id}`);
  }

  const profile: OnboardingProfile = {
    id,
    customerName,
    productId,
    productionProfileId,
    organizationId: input.organizationId?.trim() || undefined,
    deploymentPackageId,
    status,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  profiles.set(id, profile);
  return cloneProfile(profile);
}

export function getOnboardingProfile(
  id: string,
): OnboardingProfile | undefined {
  const profile = profiles.get(id.trim());
  return profile ? cloneProfile(profile) : undefined;
}

export function listOnboardingProfiles(filter?: {
  productId?: string;
  productionProfileId?: string;
  status?: OnboardingProfileStatus;
}): OnboardingProfile[] {
  let result = [...profiles.values()];
  if (filter?.productId) {
    const pid = filter.productId.trim();
    result = result.filter((p) => p.productId === pid);
  }
  if (filter?.productionProfileId) {
    const ppid = filter.productionProfileId.trim();
    result = result.filter((p) => p.productionProfileId === ppid);
  }
  if (filter?.status) result = result.filter((p) => p.status === filter.status);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneProfile);
}

export function updateOnboardingProfile(
  id: string,
  patch: Partial<
    Pick<
      OnboardingProfile,
      | "organizationId"
      | "workspaceId"
      | "productTenantId"
      | "deploymentPackageId"
      | "status"
    >
  >,
): OnboardingProfile {
  const profile = profiles.get(id.trim());
  if (!profile) throw new Error(`onboarding profile not found: ${id}`);
  if (patch.status) {
    if (!(ONBOARDING_PROFILE_STATUSES as readonly string[]).includes(patch.status)) {
      throw new Error(`invalid onboarding status: ${patch.status}`);
    }
    profile.status = patch.status;
  }
  if (patch.organizationId !== undefined) {
    profile.organizationId = patch.organizationId;
  }
  if (patch.workspaceId !== undefined) profile.workspaceId = patch.workspaceId;
  if (patch.productTenantId !== undefined) {
    profile.productTenantId = patch.productTenantId;
  }
  if (patch.deploymentPackageId !== undefined) {
    profile.deploymentPackageId = patch.deploymentPackageId;
  }
  profiles.set(profile.id, profile);
  return cloneProfile(profile);
}

export function clearOnboardingProfiles(): void {
  profiles.clear();
}
