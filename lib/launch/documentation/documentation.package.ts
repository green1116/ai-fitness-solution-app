/**
 * Launch P6 — Documentation Package root
 * Integrates deployment package, security, SLA support
 */

import { getDeploymentPackage } from "../../product/e12/deployment/deployment.package";
import { getProductIdentity } from "../../product/e12/identity/product.identity";
import { getProductionProfile } from "../launch.profile";
import { getSecurityProfile } from "../security/security.profile";
import { getSupportSlaProfile } from "../support/support.profile";
import { DOCUMENTATION_PACKAGE_STATUSES } from "./documentation.constants";
import type {
  CreateDocumentationPackageInput,
  DocumentationPackage,
  DocumentationPackageStatus,
} from "./documentation.types";

const packages = new Map<string, DocumentationPackage>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clonePackage(pkg: DocumentationPackage): DocumentationPackage {
  return { ...pkg, metadata: { ...pkg.metadata } };
}

export function createDocumentationPackage(
  input: CreateDocumentationPackageInput,
): DocumentationPackage {
  const name = input.name.trim();
  const productId = input.productId.trim();
  const productionProfileId = input.productionProfileId.trim();
  const deploymentPackageId = input.deploymentPackageId.trim();

  if (!name) throw new Error("documentationPackage.name is required");
  if (!getProductIdentity(productId)) {
    throw new Error(`product not found: ${productId}`);
  }

  const production = getProductionProfile(productionProfileId);
  if (!production || production.productId !== productId) {
    throw new Error(
      `production profile not found for product: ${productionProfileId}`,
    );
  }

  const depl = getDeploymentPackage(deploymentPackageId);
  if (!depl || depl.productId !== productId) {
    throw new Error(`deployment package not found: ${deploymentPackageId}`);
  }

  if (input.securityProfileId) {
    const security = getSecurityProfile(input.securityProfileId.trim());
    if (!security || security.productId !== productId) {
      throw new Error(`security profile not found: ${input.securityProfileId}`);
    }
  }

  if (input.supportSlaProfileId) {
    const support = getSupportSlaProfile(input.supportSlaProfileId.trim());
    if (!support || support.productId !== productId) {
      throw new Error(
        `support sla profile not found: ${input.supportSlaProfileId}`,
      );
    }
  }

  const status = input.status ?? "DRAFT";
  if (!(DOCUMENTATION_PACKAGE_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid documentation package status: ${status}`);
  }

  const id = input.id?.trim() || createId("docpkg");
  if (packages.has(id)) {
    throw new Error(`documentation package already exists: ${id}`);
  }

  const pkg: DocumentationPackage = {
    id,
    name,
    productId,
    productionProfileId,
    deploymentPackageId,
    securityProfileId: input.securityProfileId?.trim() || undefined,
    supportSlaProfileId: input.supportSlaProfileId?.trim() || undefined,
    version: input.version?.trim() || "1.0.0",
    status,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: nowIso(),
  };
  packages.set(id, pkg);
  return clonePackage(pkg);
}

export function getDocumentationPackage(
  id: string,
): DocumentationPackage | undefined {
  const pkg = packages.get(id.trim());
  return pkg ? clonePackage(pkg) : undefined;
}

export function listDocumentationPackages(filter?: {
  productId?: string;
  status?: DocumentationPackageStatus;
}): DocumentationPackage[] {
  let result = [...packages.values()];
  if (filter?.productId) {
    const pid = filter.productId.trim();
    result = result.filter((p) => p.productId === pid);
  }
  if (filter?.status) result = result.filter((p) => p.status === filter.status);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(clonePackage);
}

export function setDocumentationPackageStatus(
  id: string,
  status: DocumentationPackageStatus,
): DocumentationPackage {
  const pkg = packages.get(id.trim());
  if (!pkg) throw new Error(`documentation package not found: ${id}`);
  if (!(DOCUMENTATION_PACKAGE_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid documentation package status: ${status}`);
  }
  pkg.status = status;
  packages.set(pkg.id, pkg);
  return clonePackage(pkg);
}

export function clearDocumentationPackages(): void {
  packages.clear();
}
