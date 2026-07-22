/**
 * Evolution P5 — Multi-Region Model
 * Integrates deployment package + cloud runtime
 */

import { checkRuntimeHealth } from "../../cloud-runtime/e11/runtime/cloud.health";
import { getRuntime } from "../../cloud-runtime/e11/registry/cloud.registry";
import { getProductIdentity } from "../../product/e12/identity/product.identity";
import { getDeploymentPackage } from "../../product/e12/deployment/deployment.package";
import { getEnvironmentProfile } from "../../product/e12/deployment/deployment.environment";
import { GLOBAL_REGIONS, REGION_ROLES } from "./global.constants";
import type {
  CreateMultiRegionProfileInput,
  GlobalRegion,
  MultiRegionProfile,
  RegionRole,
} from "./global.types";

const profiles = new Map<string, MultiRegionProfile>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneProfile(profile: MultiRegionProfile): MultiRegionProfile {
  return { ...profile, metadata: { ...profile.metadata } };
}

export function createMultiRegionProfile(
  input: CreateMultiRegionProfileInput,
): MultiRegionProfile {
  const name = input.name.trim();
  const productId = input.productId.trim();
  const deploymentPackageId = input.deploymentPackageId.trim();
  const region = input.region;

  if (!name) throw new Error("multiRegionProfile.name is required");
  if (!getProductIdentity(productId)) {
    throw new Error(`product not found: ${productId}`);
  }
  if (!(GLOBAL_REGIONS as readonly string[]).includes(region)) {
    throw new Error(`invalid global region: ${region}`);
  }

  const pkg = getDeploymentPackage(deploymentPackageId);
  if (!pkg || pkg.productId !== productId) {
    throw new Error(`deployment package not found: ${deploymentPackageId}`);
  }

  const role: RegionRole = input.role ?? "SECONDARY";
  if (!(REGION_ROLES as readonly string[]).includes(role)) {
    throw new Error(`invalid region role: ${role}`);
  }

  if (input.cloudRuntimeId) {
    const runtime = getRuntime(input.cloudRuntimeId.trim());
    if (!runtime) {
      throw new Error(`cloud runtime not found: ${input.cloudRuntimeId}`);
    }
    checkRuntimeHealth(runtime.id);
  }

  if (input.environmentProfileId) {
    const env = getEnvironmentProfile(input.environmentProfileId.trim());
    if (!env || env.deploymentPackageId !== deploymentPackageId) {
      throw new Error(
        `environment profile not found: ${input.environmentProfileId}`,
      );
    }
  }

  const weight = input.weight ?? (role === "PRIMARY" ? 100 : role === "EDGE" ? 40 : 70);
  if (weight < 0 || weight > 100) {
    throw new Error("region weight must be 0..100");
  }

  const id = input.id?.trim() || createId("region");
  if (profiles.has(id)) {
    throw new Error(`multi-region profile already exists: ${id}`);
  }

  const now = nowIso();
  const profile: MultiRegionProfile = {
    id,
    name,
    productId,
    deploymentPackageId,
    region,
    role,
    cloudRuntimeId: input.cloudRuntimeId?.trim() || undefined,
    environmentProfileId: input.environmentProfileId?.trim() || undefined,
    weight,
    detail: `region=${region} role=${role} weight=${weight}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  profiles.set(id, profile);
  return cloneProfile(profile);
}

export function getMultiRegionProfile(
  id: string,
): MultiRegionProfile | undefined {
  const profile = profiles.get(id.trim());
  return profile ? cloneProfile(profile) : undefined;
}

export function listMultiRegionProfiles(filter?: {
  productId?: string;
  deploymentPackageId?: string;
  region?: GlobalRegion;
}): MultiRegionProfile[] {
  let result = [...profiles.values()];
  if (filter?.productId) {
    const pid = filter.productId.trim();
    result = result.filter((p) => p.productId === pid);
  }
  if (filter?.deploymentPackageId) {
    const did = filter.deploymentPackageId.trim();
    result = result.filter((p) => p.deploymentPackageId === did);
  }
  if (filter?.region) result = result.filter((p) => p.region === filter.region);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneProfile);
}

export function clearMultiRegionProfiles(): void {
  profiles.clear();
}
