/**
 * E12-P6 — Deployment Package Model
 * Integrates product manifest, tenant product, api product, billing edition
 */

import { E12_API_PRODUCT_ID } from "../api/api.constants";
import { getPricingPlan } from "../billing/billing.plan";
import { E12_BILLING_COMMERCIAL_ID } from "../billing/billing.constants";
import { getProductEdition } from "../edition/product.edition";
import { getProductIdentity } from "../identity/product.identity";
import { buildProductFoundation } from "../manifest/product.manifest";
import { E12_TENANT_PRODUCT_ID } from "../tenant/tenant.constants";
import { DEPLOYMENT_PACKAGE_STATUSES } from "./deployment.constants";
import type {
  CreateDeploymentPackageInput,
  DeploymentPackage,
  DeploymentPackageStatus,
} from "./deployment.types";

const packages = new Map<string, DeploymentPackage>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clonePackage(pkg: DeploymentPackage): DeploymentPackage {
  return { ...pkg, metadata: { ...pkg.metadata } };
}

export function createDeploymentPackage(
  input: CreateDeploymentPackageInput,
): DeploymentPackage {
  const productId = input.productId.trim();
  const editionId = input.editionId.trim();
  const name = input.name.trim();
  if (!name) throw new Error("deploymentPackage.name is required");

  if (!getProductIdentity(productId)) {
    throw new Error(`product not found: ${productId}`);
  }

  const edition = getProductEdition(editionId);
  if (!edition || edition.productId !== productId) {
    throw new Error(`edition not found for product: ${editionId}`);
  }

  if (input.pricingPlanId) {
    const plan = getPricingPlan(input.pricingPlanId.trim());
    if (!plan || plan.productId !== productId || plan.editionId !== editionId) {
      throw new Error(`pricing plan not found for edition: ${input.pricingPlanId}`);
    }
  }

  const foundation = buildProductFoundation();
  if (!foundation.ready) {
    throw new Error(`product foundation not ready: ${foundation.summary}`);
  }

  const status = input.status ?? "DRAFT";
  if (!(DEPLOYMENT_PACKAGE_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid deployment package status: ${status}`);
  }

  const id = input.id?.trim() || createId("deplpkg");
  if (packages.has(id)) {
    throw new Error(`deployment package already exists: ${id}`);
  }

  const pkg: DeploymentPackage = {
    id,
    productId,
    editionId,
    pricingPlanId: input.pricingPlanId?.trim() || undefined,
    name,
    version: input.version?.trim() || "1.0.0",
    status,
    tenantProductLayerId: E12_TENANT_PRODUCT_ID,
    apiProductLayerId: E12_API_PRODUCT_ID,
    billingCommercialLayerId: E12_BILLING_COMMERCIAL_ID,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  packages.set(id, pkg);
  return clonePackage(pkg);
}

export function getDeploymentPackage(
  id: string,
): DeploymentPackage | undefined {
  const pkg = packages.get(id.trim());
  return pkg ? clonePackage(pkg) : undefined;
}

export function listDeploymentPackages(filter?: {
  productId?: string;
  editionId?: string;
  status?: DeploymentPackageStatus;
}): DeploymentPackage[] {
  let result = [...packages.values()];
  if (filter?.productId) {
    const pid = filter.productId.trim();
    result = result.filter((p) => p.productId === pid);
  }
  if (filter?.editionId) {
    const eid = filter.editionId.trim();
    result = result.filter((p) => p.editionId === eid);
  }
  if (filter?.status) result = result.filter((p) => p.status === filter.status);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(clonePackage);
}

export function setDeploymentPackageStatus(
  id: string,
  status: DeploymentPackageStatus,
): DeploymentPackage {
  const pkg = packages.get(id.trim());
  if (!pkg) throw new Error(`deployment package not found: ${id}`);
  if (!(DEPLOYMENT_PACKAGE_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid deployment package status: ${status}`);
  }
  pkg.status = status;
  packages.set(pkg.id, pkg);
  return clonePackage(pkg);
}

export function clearDeploymentPackages(): void {
  packages.clear();
}
