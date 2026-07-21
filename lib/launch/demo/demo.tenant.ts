/**
 * Launch P3 — Demo Tenant Model
 * Integrates production profile, onboarding profile, deployment package
 */

import { getDeploymentPackage } from "../../product/e12/deployment/deployment.package";
import { getProductIdentity } from "../../product/e12/identity/product.identity";
import { getOnboardingProfile } from "../onboarding/onboarding.profile";
import { getProductionProfile } from "../launch.profile";
import { DEMO_TENANT_STATUSES } from "./demo.constants";
import type {
  CreateDemoTenantInput,
  DemoTenant,
  DemoTenantStatus,
} from "./demo.types";

const tenants = new Map<string, DemoTenant>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneTenant(tenant: DemoTenant): DemoTenant {
  return { ...tenant, metadata: { ...tenant.metadata } };
}

export function createDemoTenant(input: CreateDemoTenantInput): DemoTenant {
  const name = input.name.trim();
  const productId = input.productId.trim();
  const productionProfileId = input.productionProfileId.trim();

  if (!name) throw new Error("demoTenant.name is required");
  if (!getProductIdentity(productId)) {
    throw new Error(`product not found: ${productId}`);
  }

  const production = getProductionProfile(productionProfileId);
  if (!production || production.productId !== productId) {
    throw new Error(
      `production profile not found for product: ${productionProfileId}`,
    );
  }

  if (input.onboardingProfileId) {
    const onboarding = getOnboardingProfile(input.onboardingProfileId.trim());
    if (!onboarding || onboarding.productId !== productId) {
      throw new Error(
        `onboarding profile not found: ${input.onboardingProfileId}`,
      );
    }
  }

  const deploymentPackageId =
    input.deploymentPackageId?.trim() || production.deploymentPackageId;
  if (deploymentPackageId) {
    const pkg = getDeploymentPackage(deploymentPackageId);
    if (!pkg || pkg.productId !== productId) {
      throw new Error(`deployment package not found: ${deploymentPackageId}`);
    }
  }

  const status = input.status ?? "PROVISIONING";
  if (!(DEMO_TENANT_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid demo tenant status: ${status}`);
  }

  const id = input.id?.trim() || createId("demotenant");
  if (tenants.has(id)) throw new Error(`demo tenant already exists: ${id}`);

  const tenant: DemoTenant = {
    id,
    name,
    productId,
    productionProfileId,
    onboardingProfileId: input.onboardingProfileId?.trim() || undefined,
    deploymentPackageId,
    status,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  tenants.set(id, tenant);
  return cloneTenant(tenant);
}

export function getDemoTenant(id: string): DemoTenant | undefined {
  const tenant = tenants.get(id.trim());
  return tenant ? cloneTenant(tenant) : undefined;
}

export function listDemoTenants(filter?: {
  productId?: string;
  productionProfileId?: string;
  status?: DemoTenantStatus;
}): DemoTenant[] {
  let result = [...tenants.values()];
  if (filter?.productId) {
    const pid = filter.productId.trim();
    result = result.filter((t) => t.productId === pid);
  }
  if (filter?.productionProfileId) {
    const ppid = filter.productionProfileId.trim();
    result = result.filter((t) => t.productionProfileId === ppid);
  }
  if (filter?.status) result = result.filter((t) => t.status === filter.status);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneTenant);
}

export function updateDemoTenant(
  id: string,
  patch: Partial<
    Pick<
      DemoTenant,
      "productTenantId" | "demoWorkspaceId" | "status" | "onboardingProfileId"
    >
  >,
): DemoTenant {
  const tenant = tenants.get(id.trim());
  if (!tenant) throw new Error(`demo tenant not found: ${id}`);
  if (patch.status) {
    if (!(DEMO_TENANT_STATUSES as readonly string[]).includes(patch.status)) {
      throw new Error(`invalid demo tenant status: ${patch.status}`);
    }
    tenant.status = patch.status;
  }
  if (patch.productTenantId !== undefined) {
    tenant.productTenantId = patch.productTenantId;
  }
  if (patch.demoWorkspaceId !== undefined) {
    tenant.demoWorkspaceId = patch.demoWorkspaceId;
  }
  if (patch.onboardingProfileId !== undefined) {
    tenant.onboardingProfileId = patch.onboardingProfileId;
  }
  tenants.set(tenant.id, tenant);
  return cloneTenant(tenant);
}

export function clearDemoTenants(): void {
  tenants.clear();
}
