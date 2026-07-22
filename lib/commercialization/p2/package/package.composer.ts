/**
 * Commercialization P2 — Package composer
 */

import { getCommercialProduct } from "../product/product.registry";
import { scoreTierFeatures } from "../tier/tier.matrix";
import {
  getProductPackage,
  markPackageComposed,
} from "./package.registry";
import type {
  ComposePackageInput,
  PackageComposition,
} from "./package.types";

const compositions = new Map<string, PackageComposition>();

function nowIso(): string {
  return new Date().toISOString();
}

function createId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}_${rand}`;
}

function cloneComposition(
  composition: PackageComposition,
): PackageComposition {
  return {
    ...composition,
    compositionNotes: [...composition.compositionNotes],
  };
}

export function composePackage(
  input: ComposePackageInput,
): PackageComposition {
  const packageId = input.packageId.trim();
  const pkg = getProductPackage(packageId);
  if (!pkg) throw new Error(`package not found: ${packageId}`);

  const product = getCommercialProduct(pkg.productId);
  if (!product) throw new Error(`product not found: ${pkg.productId}`);

  const featureIds = (
    input.featureIds ??
    (pkg.includedFeatureIds.length > 0
      ? pkg.includedFeatureIds
      : product.featureIds)
  )
    .map((f) => f.trim())
    .filter(Boolean);

  if (featureIds.length === 0) {
    throw new Error(`compose requires at least one feature: ${packageId}`);
  }

  markPackageComposed(packageId, featureIds);

  const entitlementScore = scoreTierFeatures(pkg.tier, featureIds.length);
  const notes = [
    `tier=${pkg.tier}`,
    `kind=${pkg.kind}`,
    `features=${featureIds.length}`,
    `score=${entitlementScore}`,
  ];

  const id = input.id?.trim() || createId("pcomp");
  if (compositions.has(id)) {
    throw new Error(`package composition already exists: ${id}`);
  }

  const composition: PackageComposition = {
    id,
    packageId,
    productId: pkg.productId,
    tier: pkg.tier,
    featureCount: featureIds.length,
    entitlementScore,
    compositionNotes: notes,
    detail: `composed package=${packageId} score=${entitlementScore}`,
    composedAt: nowIso(),
  };
  compositions.set(id, composition);
  return cloneComposition(composition);
}

export function getPackageComposition(
  id: string,
): PackageComposition | undefined {
  const composition = compositions.get(id.trim());
  return composition ? cloneComposition(composition) : undefined;
}

export function listPackageCompositions(filter?: {
  packageId?: string;
  productId?: string;
}): PackageComposition[] {
  let result = [...compositions.values()];
  if (filter?.packageId) {
    const pid = filter.packageId.trim();
    result = result.filter((c) => c.packageId === pid);
  }
  if (filter?.productId) {
    const pid = filter.productId.trim();
    result = result.filter((c) => c.productId === pid);
  }
  return result
    .slice()
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(cloneComposition);
}

export function clearPackageCompositions(): void {
  compositions.clear();
}
