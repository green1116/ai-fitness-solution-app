/**
 * Launch P1 — Production Profile
 * Integrates product identity, deployment package, platform baseline
 */

import { getDeploymentPackage } from "../product/e12/deployment/deployment.package";
import { getProductIdentity } from "../product/e12/identity/product.identity";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../product/e12/signoff/governance.freeze.lock";
import { PRODUCTION_PROFILE_STATUSES } from "./launch.constants";
import type {
  CreateProductionProfileInput,
  ProductionProfile,
  ProductionProfileStatus,
} from "./launch.types";

const profiles = new Map<string, ProductionProfile>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneProfile(profile: ProductionProfile): ProductionProfile {
  return { ...profile, metadata: { ...profile.metadata } };
}

export function createProductionProfile(
  input: CreateProductionProfileInput,
): ProductionProfile {
  const name = input.name.trim();
  const productId = input.productId.trim();
  if (!name) throw new Error("profile.name is required");
  if (!getProductIdentity(productId)) {
    throw new Error(`product not found: ${productId}`);
  }

  if (input.deploymentPackageId) {
    const pkg = getDeploymentPackage(input.deploymentPackageId.trim());
    if (!pkg || pkg.productId !== productId) {
      throw new Error(
        `deployment package not found for product: ${input.deploymentPackageId}`,
      );
    }
  }

  const status = input.status ?? "DRAFT";
  if (!(PRODUCTION_PROFILE_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid profile status: ${status}`);
  }

  const id = input.id?.trim() || createId("prodprofile");
  if (profiles.has(id)) throw new Error(`production profile already exists: ${id}`);

  const profile: ProductionProfile = {
    id,
    name,
    region: input.region?.trim() || "us-east-1",
    status,
    productId,
    deploymentPackageId: input.deploymentPackageId?.trim() || undefined,
    platformBaseline: "enterprise-platform-v1-complete",
    productizationCompleteId: E12_PRODUCTIZATION_COMPLETE_ID,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  profiles.set(id, profile);
  return cloneProfile(profile);
}

export function getProductionProfile(
  id: string,
): ProductionProfile | undefined {
  const profile = profiles.get(id.trim());
  return profile ? cloneProfile(profile) : undefined;
}

export function listProductionProfiles(filter?: {
  productId?: string;
  status?: ProductionProfileStatus;
}): ProductionProfile[] {
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

export function setProductionProfileStatus(
  id: string,
  status: ProductionProfileStatus,
): ProductionProfile {
  const profile = profiles.get(id.trim());
  if (!profile) throw new Error(`production profile not found: ${id}`);
  if (!(PRODUCTION_PROFILE_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid profile status: ${status}`);
  }
  profile.status = status;
  profiles.set(profile.id, profile);
  return cloneProfile(profile);
}

export function bindDeploymentPackageToProfile(
  profileId: string,
  deploymentPackageId: string,
): ProductionProfile {
  const profile = profiles.get(profileId.trim());
  if (!profile) throw new Error(`production profile not found: ${profileId}`);
  const pkg = getDeploymentPackage(deploymentPackageId.trim());
  if (!pkg || pkg.productId !== profile.productId) {
    throw new Error(
      `deployment package not found for product: ${deploymentPackageId}`,
    );
  }
  profile.deploymentPackageId = pkg.id;
  profiles.set(profile.id, profile);
  return cloneProfile(profile);
}

export function clearProductionProfiles(): void {
  profiles.clear();
}
