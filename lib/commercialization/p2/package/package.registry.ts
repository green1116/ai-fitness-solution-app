/**
 * Commercialization P2 — Package registry
 */

import { PACKAGE_KINDS, PACKAGE_STATUSES, TIER_LEVELS } from "../tier/tier.constants";
import { getCommercialProduct } from "../product/product.registry";
import type {
  PackageKind,
  PackageStatus,
  ProductPackage,
  RegisterPackageInput,
  TierLevel,
} from "./package.types";

const packages = new Map<string, ProductPackage>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function clonePackage(pkg: ProductPackage): ProductPackage {
  return {
    ...pkg,
    includedFeatureIds: [...pkg.includedFeatureIds],
    metadata: { ...pkg.metadata },
  };
}

export function registerPackage(
  input: RegisterPackageInput,
): ProductPackage {
  const name = input.name.trim();
  const productId = input.productId.trim();
  if (!name) throw new Error("package.name is required");

  const product = getCommercialProduct(productId);
  if (!product) throw new Error(`product not found: ${productId}`);
  if (product.status === "DEPRECATED") {
    throw new Error(`cannot package deprecated product: ${productId}`);
  }

  if (!(PACKAGE_KINDS as readonly string[]).includes(input.kind)) {
    throw new Error(`invalid package kind: ${input.kind}`);
  }
  if (!(TIER_LEVELS as readonly string[]).includes(input.tier)) {
    throw new Error(`invalid package tier: ${input.tier}`);
  }

  const includedFeatureIds = (
    input.includedFeatureIds ?? product.featureIds
  )
    .map((f) => f.trim())
    .filter(Boolean);

  const id = input.id?.trim() || createId("pkg");
  if (packages.has(id)) {
    throw new Error(`package already exists: ${id}`);
  }

  const status: PackageStatus = "DRAFT";
  if (!(PACKAGE_STATUSES as readonly string[]).includes(status)) {
    throw new Error(`invalid package status: ${status}`);
  }

  const now = nowIso();
  const pkg: ProductPackage = {
    id,
    name,
    productId,
    kind: input.kind,
    tier: input.tier,
    status,
    includedFeatureIds,
    detail: `kind=${input.kind} tier=${input.tier} status=${status}`,
    metadata: { ...(input.metadata ?? {}) },
    createdAt: now,
    updatedAt: now,
  };
  packages.set(id, pkg);
  return clonePackage(pkg);
}

export function markPackageComposed(
  id: string,
  featureIds: string[],
): ProductPackage {
  const pkg = packages.get(id.trim());
  if (!pkg) throw new Error(`package not found: ${id}`);
  pkg.includedFeatureIds = featureIds.map((f) => f.trim()).filter(Boolean);
  pkg.status = "COMPOSED";
  pkg.composedAt = nowIso();
  pkg.updatedAt = pkg.composedAt;
  pkg.detail = `kind=${pkg.kind} tier=${pkg.tier} status=COMPOSED`;
  packages.set(pkg.id, pkg);
  return clonePackage(pkg);
}

export function publishPackage(id: string): ProductPackage {
  const pkg = packages.get(id.trim());
  if (!pkg) throw new Error(`package not found: ${id}`);
  if (pkg.status !== "COMPOSED" && pkg.status !== "PUBLISHED") {
    throw new Error(`publish requires COMPOSED package (status=${pkg.status})`);
  }
  pkg.status = "PUBLISHED";
  pkg.updatedAt = nowIso();
  pkg.detail = `kind=${pkg.kind} tier=${pkg.tier} status=PUBLISHED`;
  packages.set(pkg.id, pkg);
  return clonePackage(pkg);
}

export function getProductPackage(id: string): ProductPackage | undefined {
  const pkg = packages.get(id.trim());
  return pkg ? clonePackage(pkg) : undefined;
}

export function listProductPackages(filter?: {
  productId?: string;
  kind?: PackageKind;
  tier?: TierLevel;
  status?: PackageStatus;
}): ProductPackage[] {
  let result = [...packages.values()];
  if (filter?.productId) {
    const pid = filter.productId.trim();
    result = result.filter((p) => p.productId === pid);
  }
  if (filter?.kind) result = result.filter((p) => p.kind === filter.kind);
  if (filter?.tier) result = result.filter((p) => p.tier === filter.tier);
  if (filter?.status) result = result.filter((p) => p.status === filter.status);
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(clonePackage);
}

export function clearProductPackages(): void {
  packages.clear();
}
